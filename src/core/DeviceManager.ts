/*
 * @FilePath     : /src/core/DeviceManager.ts
 * @Date         : 2022-05-13 16:38:20
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : 设备管理器
 */

import { commands, Disposable, ExtensionContext } from "vscode";

export class DeviceManager implements Disposable {
  constructor(public context: ExtensionContext) {
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
  refreshDeviceManager() {
    console.log("refreshDeviceManager");
  }
  restartAdb() {
    console.log("restartAdb");
  }
  dispose() {}
}
