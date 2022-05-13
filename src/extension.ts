/*
 * @FilePath     : /src/extension.ts
 * @Date         : 2022-05-13 16:16:18
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : extension
 */

import * as vscode from "vscode";
import { logPrint } from "./core/utils/util";
import { DeviceManager } from "./core/view/DeviceManager";

let deviceManager: DeviceManager | undefined;

export function activate(context: vscode.ExtensionContext) {
  logPrint('"adb-helper" active');
  if (deviceManager === undefined) {
    deviceManager = new DeviceManager(context);
  }
}

export function deactivate() {
  logPrint('"adb-helper" deactivate');
  deviceManager?.dispose();
  deviceManager = undefined;
}
