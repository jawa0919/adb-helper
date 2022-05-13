/*
 * @FilePath     : /src/core/controller/DeviceController.ts
 * @Date         : 2022-05-14 01:06:20
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : 设备控制器
 */

import { commands, Disposable, ExtensionContext, window } from "vscode";
import { IDevice } from "../cmd/devices";
import { logPrint } from "../utils/util";
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
    commands.registerCommand("adb-helper.copyDeviceInfo", (res) => this.copyDeviceInfo(res));
    commands.registerCommand("adb-helper.rebootDevice", (res) => this.rebootDevice(res));
    commands.registerCommand("adb-helper.shutdownDevice", (res) => this.shutdownDevice(res));
    commands.registerCommand("adb-helper.useWifiConnect", (res) => this.useWifiConnect(res));
  }
  useWifiConnect(res: any): any {
    throw new Error("Method not implemented.");
  }
  shutdownDevice(res: any): any {
    throw new Error("Method not implemented.");
  }
  rebootDevice(res: any): any {
    throw new Error("Method not implemented.");
  }
  copyDeviceInfo(res: any): any {
    throw new Error("Method not implemented.");
  }
  installApk(res: any): any {
    throw new Error("Method not implemented.");
  }
  screenshot(res: any) {
    logPrint(res);
  }

  dispose() {}
}
