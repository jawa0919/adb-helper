/*
 * @FilePath     : /src/core/view/DeviceManager.ts
 * @Date         : 2022-05-13 16:38:20
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : 设备管理器
 */

import { commands, Disposable, ExtensionContext, window } from "vscode";
import { killServer, startServer } from "../cmd/connect";
import { devices, IDevice } from "../cmd/devices";
import { showProgress, waitMoment } from "../utils/util";
import { DeviceTree } from "./DeviceTree";

export class DeviceManager implements Disposable {
  static deviceList: IDevice[] = [];
  tree: DeviceTree;
  constructor(public context: ExtensionContext) {
    this.tree = new DeviceTree();
    window.registerTreeDataProvider("adb-helper.DeviceManager", this.tree);
    /// commands
    commands.registerCommand("adb-helper.restartAdb", () => this.restartAdb());
    commands.registerCommand("adb-helper.refreshDeviceManager", () => this.refreshDeviceManager());
    commands.registerCommand("adb-helper.ipConnect", () => this.ipConnect());
    commands.registerCommand("adb-helper.ipConnectHistory", () => this.ipConnectHistory());
  }
  ipConnectHistory() {
    console.log("ipConnectHistory");
  }
  ipConnect() {
    console.log("ipConnect");
  }
  async refreshDeviceManager() {
    DeviceManager.deviceList = await devices();
    console.log(DeviceManager.deviceList);
    this.tree.eventEmitter.fire();
  }
  async restartAdb() {
    showProgress("Restart Adb running!", async () => {
      await killServer();
      await waitMoment();
      await startServer();
      await waitMoment();
      DeviceManager.deviceList = await devices();
      return;
    });
  }
  dispose() {}
}
