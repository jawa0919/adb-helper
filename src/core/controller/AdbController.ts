/*
 * @FilePath     : /src/core/controller/AdbController.ts
 * @Date         : 2022-05-14 01:05:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : adb控制器
 */

import { generate } from "qrcode-terminal";
import { ExecaChildProcess } from "execa";
import { commands, Disposable, ExtensionContext, QuickPickItem, Uri, window } from "vscode";
import { flutterBinPath } from "../app/AppConfig";
import { AppConst } from "../app/AppConst";
import { connect, pair } from "../cmd/connect";
import { devices, IDevice } from "../cmd/devices";
import { install } from "../cmd/install";
import { safeSpawn } from "../utils/processes";
import { showInformationMessage, showInputBox, showProgress, showQuickPickItem, waitMoment } from "../utils/util";
import { DeviceController } from "./DeviceController";
import { ExplorerController } from "./ExplorerController";
import { bonjourPairing, simpleBonjourConnect, simpleBonjourPairing } from "../cmd/bonjour_find";
import * as bonjour from "bonjour";

export class AdbController implements Disposable {
  static deviceList: IDevice[] = [];
  deviceController: DeviceController;
  explorerController: ExplorerController;

  constructor(public context: ExtensionContext) {
    this.deviceController = new DeviceController(context);
    this.explorerController = new ExplorerController(context);
    /// commands
    commands.registerCommand("adb-helper.refreshDeviceManager", () => this.refreshDeviceManager());
    commands.registerCommand("adb-helper.ipConnect", () => this.ipConnect());
    commands.registerCommand("adb-helper.ipConnectHistory", () => this.ipConnectHistory());
    commands.registerCommand("adb-helper.pairDevicesScanner", () => this.pairDevicesScanner());
    commands.registerCommand("adb-helper.pairDevicesUsingQRCode", () => this.pairDevicesUsingQRCode());
    commands.registerCommand("adb-helper.pairDevicesUsingCode", () => this.pairDevicesUsingCode());
    commands.registerCommand("adb-helper.installToDevice", (res) => this.installToDevice(res));
    commands.registerCommand("adb-helper.chooseApkFilter", () => this.chooseApkFilter());
  }
  async chooseApkFilter() {
    const items = AppConst.apkFilterList.map((label) => {
      return { label };
    });
    let item = await showQuickPickItem(items);
    if (item) {
      this.deviceController.tree.apkFilter = item.label;
      commands.executeCommand("adb-helper.refreshDeviceManager");
    }
  }
  async installToDevice(res: Uri) {
    let apkPath: string = res.fsPath || "";
    const items = AdbController.deviceList.map((d) => {
      const label = d.netWorkIp ? "$(broadcast) " : "$(plug) ";
      return { label: label + d.model, description: d.devId };
    });
    let item = items.length === 1 ? items[0] : await showQuickPickItem(items);
    if (item) {
      const devId = item.description;
      showProgress(`Install To Device:${item.label.split(")")[1]} running!`, async () => {
        await waitMoment();
        let successInstall = await install(devId, apkPath);
        if (successInstall) commands.executeCommand("adb-helper.refreshDeviceManager");
        showInformationMessage("Install Success");
        return;
      });
    }
  }
  async pairDevicesScanner() {
    showProgress("Scanner running!", async () => {
      const service = await simpleBonjourConnect();
      if (service[0] && service[1] && service[2]) {
        this.ipConnect(service[1], service[2]);
      }
      return;
    });
  }
  async pairDevicesUsingQRCode() {
    const password = Math.floor(Math.random() * 1000000 + 1).toString();
    const text = "WIFI:T:ADB;S:ADB-Helper-pairDevicesUsingWifi;P:" + password + ";;";
    const outputChannel = window.createOutputChannel("AdbHelper-PairQR");
    generate(text, { small: true }, (qrCode) => {
      outputChannel.clear();
      outputChannel.appendLine(qrCode);
      outputChannel.show();
      showProgress("QRCode pair running!", async () => {
        const service = await simpleBonjourPairing();
        outputChannel.clear();
        outputChannel.hide();
        if (service[0]) {
          const successPair = await pair(service[1], service[2], password);
          if (!successPair) return;
          await waitMoment();
          this.pairDevicesScanner();
        }
        return;
      });
    });
  }
  async pairDevicesUsingCode() {
    const devItem: QuickPickItem[] = [];
    const scanner = bonjourPairing((service) => {
      if (service.name === "") return;
      devItem.push({ label: service.addresses[0], description: `${service.port}`, detail: service.name });
      quickPick.items = devItem;
    });
    const quickPick = window.createQuickPick<QuickPickItem>();
    quickPick.title = "Scanning...";
    quickPick.placeholder = "Choose One Device";
    quickPick.canSelectMany = false;
    quickPick.onDidChangeSelection(async (e) => {
      const dev = e[0];
      if (dev) {
        quickPick.hide();
        const code = await showInputBox("Input Pairing Code");
        if (!code) return;
        await showProgress("Code pair running!", async () => {
          const ip = dev.label || "";
          const port = dev.description || "";
          const successPair = await pair(ip, `${port}`, code);
          if (!successPair) return;
          await waitMoment();
          this.pairDevicesScanner();
          return;
        });
      }
    });
    quickPick.onDidHide(() => {
      quickPick.dispose();
      scanner.stop();
    });
    quickPick.busy = true;
    quickPick.show();
  }
  async ipConnectHistory() {
    const history = this.context.globalState.get<string>("adb-helper.ipHistory") ?? "";
    let historyDevices: IDevice[] = history ? JSON.parse(history) : [];
    if (historyDevices.length === 0) {
      showInformationMessage("No find history device");
      return;
    }
    const clearItem = { label: "Clear History", detail: "Clear Ip History List", alwaysShow: true };
    const ipItems = historyDevices.map((d) => {
      return { label: "$(broadcast) " + d.model, description: d.devId, detail: JSON.stringify(d) };
    });
    let item = await showQuickPickItem([...ipItems, clearItem]);
    if (item?.label === "Clear History") {
      this.context.globalState.update("adb-helper.ipHistory", "");
      return;
    }
    if (item === undefined) return;
    const model: IDevice = JSON.parse(item.detail);
    await this.ipConnect(model.netWorkIp, model.adbTcpPort);
  }
  async ipConnect(ip?: string, port?: string) {
    if (ip === undefined) ip = await showInputBox("Input Device IP", "eg:192.168.1.103", ip);
    if (!ip) return;
    if (port === undefined) port = await showInputBox("Input Device tcp port", "eg:5555", port);
    if (!port) return;
    showProgress("IP Connect running!", async () => {
      const connectSuccess = await connect(ip!, port!);
      if (!connectSuccess) return;
      await waitMoment();
      await commands.executeCommand("adb-helper.refreshDeviceManager");
      const dev = AdbController.deviceList.find((r) => r.devId === `${ip}:${port}`);
      if (dev === undefined) return;
      const history = this.context.globalState.get<string>("adb-helper.ipHistory") ?? "";
      let historyDevices: IDevice[] = history ? JSON.parse(history) : [];
      historyDevices.push(dev);
      historyDevices = [...new Set(historyDevices)];
      this.context.globalState.update("adb-helper.ipHistory", JSON.stringify(historyDevices));
      return;
    });
  }
  async refreshDeviceManager() {
    AdbController.deviceList = await devices();
    this.deviceController.tree.eventEmitter.fire();
    const index = AdbController.deviceList.findIndex((d) => d.devId === this.explorerController.tree.device?.devId);
    if (index === -1) this.explorerController.tree.device = AdbController.deviceList[0];
    commands.executeCommand("adb-helper.refreshExplorerManager");
  }

  dispose() {
    const req = { id: this.daemonId, method: "daemon.shutdown" };
    const cmd = "[" + JSON.stringify(req) + "]\r\n";
    this.process?.stdin?.write(cmd);
    this.process?.disconnect();
    this.daemonId === undefined;
    this.deviceController.dispose();
    bonjour().destroy();
  }

  private process: ExecaChildProcess | undefined;
  private daemonId: number | undefined;
  createFlutterDaemon() {
    if (flutterBinPath === "") return;
    this.process = safeSpawn("flutter", ["daemon"], flutterBinPath);
    this.process.stderr?.on("data", (err) => this._errDataListener(err));
    this.process.stdout?.on("data", (chunk) => this._outDataListener(chunk));
    this.process.on("error", (err) => this._errDataListener(err));
    this.daemonId = Math.round(Math.random() * 1000 + 1);
    // FIXME 2022-05-04 15:21:40 https://github.com/Dart-Code/Dart-Code/blob/master/src/extension/flutter/flutter_daemon.ts#L206
    const req = { id: this.daemonId, method: "device.enable" };
    const cmd = "[" + JSON.stringify(req) + "]\r\n";
    this.process?.stdin?.write(cmd);
  }
  private _errDataListener(data: any) {
    const res = Buffer.from(data).toString();
    console.error("errDataListener", res);
    this.process?.cancel();
  }
  private _outDataListener(data: any) {
    const res = Buffer.from(data).toString();
    console.log("_outDataListener", res);
    const messageList = res.split("\n").filter((m) => m.trim() !== "");
    const ids = messageList.map((m) => this._messageLineParse(m));
    if (ids.filter((id) => id !== "").length > 0) {
      this.refreshDeviceManager();
    }
  }
  // "[{"event":"device.removed","params":{"id":"CVH7N15B10000216","name":"Nexus 6P","platform":"android-arm","emulator":false,"category":"mobile","platformType":"android","ephemeral":true,"emulatorId":null}}]"
  private _messageLineParse(line: string): string {
    const data = [JSON.parse(line)].flat()?.shift();
    if (data.event) {
      let event: string = data.event;
      let platformType: string = data.params.platformType;
      if (event === "device.added" && platformType === "android") {
        console.log("device.added", data.params.id);
        return data.params.id || "";
      }
      if (event === "device.removed" && platformType === "android") {
        console.log("device.removed", data.params.id);
        return data.params.id || "";
      }
    }
    return "";
  }
}
