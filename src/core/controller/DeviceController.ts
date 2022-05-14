/*
 * @FilePath     : /src/core/controller/DeviceController.ts
 * @Date         : 2022-05-14 01:06:20
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : 设备控制器
 */

import { join } from "node:path";
import { commands, Disposable, ExtensionContext, TreeItem, window } from "vscode";
import { IDevice } from "../cmd/devices";
import { openExplorerWindows, pull, screenCap } from "../cmd/io";
import { adbJoin, chooseFolder, dateTimeName, logPrint, showInformationMessage, showProgress, waitMoment } from "../utils/util";
import { DeviceTree } from "../view/DeviceTree";

export class DeviceController implements Disposable {
  static deviceList: IDevice[] = [];
  tree: DeviceTree;
  constructor(public context: ExtensionContext) {
    this.tree = new DeviceTree();
    window.registerTreeDataProvider("adb-helper.DeviceManager", this.tree);
    /// commands
    commands.registerCommand("adb-helper.screenshot", (res) => this.screenshot(res));
    commands.registerCommand("adb-helper.installApk", (res) => this.installApk(res));
    commands.registerCommand("adb-helper.showDeviceInfo", (res) => this.showDeviceInfo(res));
    commands.registerCommand("adb-helper.showClipboardData", (res) => this.showClipboardData(res));
    commands.registerCommand("adb-helper.rebootDevice", (res) => this.rebootDevice(res));
    commands.registerCommand("adb-helper.shutdownDevice", (res) => this.shutdownDevice(res));
    commands.registerCommand("adb-helper.useWifiConnect", (res) => this.useWifiConnect(res));
  }
  useWifiConnect(res: TreeItem) {
    logPrint(res);
  }
  shutdownDevice(res: TreeItem) {
    logPrint(res);
  }
  rebootDevice(res: TreeItem) {
    logPrint(res);
  }
  showClipboardData(res: TreeItem) {
    logPrint(res);
  }
  showDeviceInfo(res: TreeItem) {
    logPrint(res);
  }
  installApk(res: TreeItem) {
    logPrint(res);
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

  dispose() {}
}
