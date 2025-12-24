/*
 * @FilePath     : /src/core/controller/DeviceController.ts
 * @Date         : 2022-05-14 01:06:20
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : 设备控制器
 */

import { join } from "node:path";
import { commands, Disposable, env, ExtensionContext, OutputChannel, TreeItem, window } from "vscode";
import { scrcpyBinPath } from "../app/AppConfig";
import { AppConst } from "../app/AppConst";
import { connect, powerOff, reboot, scrcpy, tcpIp } from "../cmd/connect";
import { getDeviceIp, IDevice, loadDeviceSystem, loadDeviceTopActivity, shellInputText } from "../cmd/devices";
import { install } from "../cmd/install";
import { openExplorerWindows, pull, screenCap } from "../cmd/io";
import { openLogCat } from "../cmd/logcat";
import { adbJoin, chooseFile, chooseFolder, dateTimeName, logPrint, showErrorMessage, showInformationMessage, showInputBox, showModal, showProgress, waitMoment } from "../utils/util";
import { DeviceTree } from "../view/DeviceTree";
import { AdbController } from "./AdbController";
import { ApkController } from "./ApkController";

export class DeviceController implements Disposable {
  apkController: ApkController;
  tree: DeviceTree;
  constructor(public context: ExtensionContext) {
    this.apkController = new ApkController(context);
    this.tree = new DeviceTree(AppConst.apkFilterList[0]);
    window.registerTreeDataProvider("adb-helper.DeviceManager", this.tree);
    /// commands
    commands.registerCommand("adb-helper.screenshot", (res) => this.screenshot(res));
    commands.registerCommand("adb-helper.installApk", (res) => this.installApk(res));
    commands.registerCommand("adb-helper.openShell", (res) => this.openShell(res));
    commands.registerCommand("adb-helper.inputText", (res) => this.inputText(res));
    commands.registerCommand("adb-helper.showDeviceInfo", (res) => this.showDeviceInfo(res));
    commands.registerCommand("adb-helper.showTopActivity", (res) => this.showTopActivity(res));
    commands.registerCommand("adb-helper.startScrcpy", (res) => this.startScrcpy(res));
    commands.registerCommand("adb-helper.rebootDevice", (res) => this.rebootDevice(res));
    commands.registerCommand("adb-helper.powerOffDevice", (res) => this.powerOffDevice(res));
    commands.registerCommand("adb-helper.useIpConnect", (res) => this.useIpConnect(res));
    commands.registerCommand("adb-helper.showLogCat", (res) => this.showLogCat(res));
    commands.registerCommand("adb-helper.closeAllLogCat", (res) => this.closeAllLogCat(res));
  }
  async closeAllLogCat(res: TreeItem) {
    const device: IDevice = JSON.parse(res.tooltip?.toString() || "");
  }
  async showLogCat(res: TreeItem) {
    const device: IDevice = JSON.parse(res.tooltip?.toString() || "");
    const outputChannel = window.createOutputChannel("AdbHelper-" + device.product);
    openLogCat(device.devId, (res) => {
      outputChannel.appendLine(res);
    });
    outputChannel.show();
  }
  async useIpConnect(res: TreeItem) {
    const device: IDevice = JSON.parse(res.tooltip?.toString() || "");
    if (device.netWorkIp !== undefined) {
      showInformationMessage("Now Device Is Use Ip Connect");
      return;
    }
    if (device.devId === "") return;
    const ip = await getDeviceIp(device.devId);
    if (ip === "") {
      showErrorMessage("No Find Device Ip, Connect Ip Error.");
      return;
    }
    const port = 5555; // default port
    const tcpIpSuccess = await tcpIp(device.devId, `${port}`);
    if (!tcpIpSuccess) return;
    showProgress("Ip Connect running!", async () => {
      const connectSuccess = await connect(ip, `${port}`);
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
  async powerOffDevice(res: TreeItem) {
    const device: IDevice = JSON.parse(res.tooltip?.toString() || "");
    if ((await showModal("Do you want power off this Device?", device.model, ...["YES", "NO"])) === "YES") {
      await powerOff(device.devId);
    }
  }
  async rebootDevice(res: TreeItem) {
    const device: IDevice = JSON.parse(res.tooltip?.toString() || "");
    if ((await showModal("Do you want reboot this Device?", device.model, ...["YES", "NO"])) === "YES") {
      await reboot(device.devId);
    }
  }
  async startScrcpy(res: TreeItem) {
    if (scrcpyBinPath === "") {
      showInformationMessage("Please install [Scrcpy](https://github.com/Genymobile/scrcpy) first!", ...["About Scrcpy"]).then((r) => {
        if (r === "About Scrcpy") commands.executeCommand("vscode.open", "https://github.com/Genymobile/scrcpy");
      });
      return;
    }
    const device: IDevice = JSON.parse(res.tooltip?.toString() || "");
    await scrcpy(device.devId);
  }
  async showTopActivity(res: TreeItem) {
    const device: IDevice = JSON.parse(res.tooltip?.toString() || "");
    const info = await loadDeviceTopActivity(device.devId);
    showInformationMessage(`TopActivity ${info}`, ...["Copy"]).then((r) => {
      if (r === "Copy") env.clipboard.writeText(info);;
    });
  }
  async showDeviceInfo(res: TreeItem) {
    const device: IDevice = JSON.parse(res.tooltip?.toString() || "");
    const info = await loadDeviceSystem(device.devId);
    const deviceInfo = { ...device, ...info };
    showModal("DeviceInfo", `${JSON.stringify(deviceInfo, null, 2)}`, ...["Copy"]).then((r) => {
      if (r === "Copy") env.clipboard.writeText(JSON.stringify(deviceInfo, null, 2));
    });
  }
  async inputText(res: TreeItem) {
    const devId = res.description?.toString() || "";
    let text = await showInputBox("Input Text", "");
    if (!text) return;
    await shellInputText(devId, text);
  }
  async installApk(res: TreeItem) {
    const files = await chooseFile(false, { apk: ["apk"] });
    logPrint(files?.[0]);
    const filePath = files?.[0]?.fsPath || "";
    if (filePath === "") return;
    showProgress("Install Apk running!", async () => {
      const devId = res.description?.toString() || "";
      if (devId === "") return;
      const successInstall = await install(devId, filePath);
      if (!successInstall) return;
      await waitMoment();
      this.tree.eventEmitter.fire();
      return;
    });
  }
  async openShell(res: TreeItem) {
    const devName = res.label?.toString() || "";
    const devId = res.description?.toString() || "";
    const terminal = window.createTerminal({ name: devName });
    terminal.sendText("adb -s " + devId + " shell");
    terminal.show();
  }
  async screenshot(res: TreeItem) {
    const folders = await chooseFolder(false);
    const folderPath = folders?.[0]?.fsPath || "";
    if (folderPath === "") return;
    showProgress("Screenshot running!", async () => {
      const fileName = `adbHelper_Screenshot_${dateTimeName()}.png`;
      const screenshotsFilePath = adbJoin("/sdcard/", fileName);
      const devId = res.description?.toString() || "";
      if (devId === "") return;
      const successScreenCap = await screenCap(devId, screenshotsFilePath);
      if (!successScreenCap) return;
      await waitMoment();
      let pullSuccess = await pull(devId, screenshotsFilePath, join(folderPath, fileName));
      if (!pullSuccess) return;
      showInformationMessage(`Screenshot Success \n\n ${fileName}`, ...["Open Explorer"]).then((r) => {
        if (r === "Open Explorer") openExplorerWindows(folderPath);
      });
      return;
    });
  }

  dispose() { }
}
