/*
 * @FilePath     : /src/core/controller/AdbController.ts
 * @Date         : 2022-05-14 01:05:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : adb控制器
 */

import { ExecaChildProcess } from "execa";
import { commands, Disposable, ExtensionContext, Uri } from "vscode";
import { flutterBinPath } from "../app/AppConfig";
import { connect, killServer, startServer } from "../cmd/connect";
import { devices, IDevice } from "../cmd/devices";
import { install } from "../cmd/install";
import { safeSpawn } from "../utils/processes";
import { logPrint, showInformationMessage, showInputBox, showProgress, showQuickPickItem, waitMoment } from "../utils/util";
import { ApkController } from "./ApkController";
import { DeviceController } from "./DeviceController";

export class AdbController implements Disposable {
  deviceController: DeviceController;
  apkController: ApkController;

  constructor(public context: ExtensionContext) {
    this.deviceController = new DeviceController(context);
    this.apkController = new ApkController(context);
    /// commands
    commands.registerCommand("adb-helper.restartAdb", () => this.restartAdb());
    commands.registerCommand("adb-helper.refreshDeviceManager", () => this.refreshDeviceManager());
    commands.registerCommand("adb-helper.ipConnect", () => this.ipConnect());
    commands.registerCommand("adb-helper.ipConnectHistory", () => this.ipConnectHistory());
    commands.registerCommand("adb-helper.installToDevice", (res) => this.installToDevice(res));
  }
  async installToDevice(res: Uri) {
    logPrint(res);
    let apkPath: string = res.fsPath || "";
    const items = DeviceController.deviceList.map((d) => {
      const label = d.netWorkIp ? "$(broadcast) " : "$(plug) ";
      return { label: label + d.model, description: d.devId };
    });
    let item = await showQuickPickItem(items);
    if (item) {
      const devId = item.description;
      showProgress("Install To Device running!", async () => {
        await waitMoment();
        let successInstall = await install(devId, apkPath);
        if (successInstall) commands.executeCommand("adb-helper.refreshDeviceManager");
        showInformationMessage("Install Success");
        return;
      });
    }
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
      DeviceController.deviceList = await devices();
      this.deviceController.tree.eventEmitter.fire();
      const dev = DeviceController.deviceList.find((r) => r.devId === `${ip}:${port}`);
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
    DeviceController.deviceList = await devices();
    this.deviceController.tree.eventEmitter.fire();
  }
  async restartAdb() {
    showProgress("Restart Adb running!", async () => {
      await killServer();
      await waitMoment();
      await startServer();
      await waitMoment();
      DeviceController.deviceList = await devices();
      this.deviceController.tree.eventEmitter.fire();
      return;
    });
  }

  dispose() {
    const req = { id: this.daemonId, method: "daemon.shutdown" };
    const cmd = "[" + JSON.stringify(req) + "]\r\n";
    this.process?.stdin?.write(cmd);
    this.process?.disconnect();
    this.daemonId === undefined;
    this.deviceController.dispose();
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
  }
  private _outDataListener(data: any) {
    const res = Buffer.from(data).toString();
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
