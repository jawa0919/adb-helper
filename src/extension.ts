/*
 * @FilePath     : /src/extension.ts
 * @Date         : 2022-05-13 16:16:18
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : extension
 */

import { commands, ExtensionContext, workspace } from "vscode";
import { adbBinPath, explorerRootPathList, flutterBinPath, initAppConfig } from "./core/app/AppConfig";
import { logPrint, showWarningMessage } from "./core/utils/util";
import { DeviceManager } from "./core/view/DeviceManager";

let deviceManager: DeviceManager | undefined;

export function activate(context: ExtensionContext) {
  logPrint("adb-helper active");

  initAppConfig();
  workspace.onDidChangeConfiguration(() => initAppConfig());

  logPrint(explorerRootPathList, adbBinPath, flutterBinPath);

  if (adbBinPath === "") {
    showWarningMessage("No Find `adb` Command, Please Check Your Config");
    return;
  }

  if (deviceManager === undefined) {
    deviceManager = new DeviceManager(context);
  }

  commands.executeCommand("adb-helper.refreshDeviceManager");

  if (flutterBinPath !== "") {
    deviceManager.createFlutterDaemon();
  } else {
    logPrint("No Find `flutter` Command, Can Not Auto Refresh Device List When Device Connect/Disconnect");
  }
}

export function deactivate() {
  logPrint("adb-helper deactivate");
  deviceManager?.dispose();
  deviceManager = undefined;
}
