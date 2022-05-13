/*
 * @FilePath     : /src/extension.ts
 * @Date         : 2022-05-13 16:16:18
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : extension
 */

import { commands, ExtensionContext, workspace } from "vscode";
import { adbBinPath, explorerRootPathList, flutterBinPath, initAppConfig } from "./core/app/AppConfig";
import { AdbController } from "./core/controller/AdbController";
import { logPrint, showWarningMessage } from "./core/utils/util";

let adbManager: AdbController | undefined;

export function activate(context: ExtensionContext) {
  logPrint("adb-helper active");

  initAppConfig();
  workspace.onDidChangeConfiguration(() => initAppConfig());

  logPrint(explorerRootPathList, adbBinPath, flutterBinPath);

  if (adbBinPath === "") {
    showWarningMessage("No Find `adb` Command, Please Check Your Config");
    return;
  }

  if (adbManager === undefined) {
    adbManager = new AdbController(context);
  }

  commands.executeCommand("adb-helper.refreshDeviceManager");

  if (flutterBinPath !== "") {
    adbManager.createFlutterDaemon();
  } else {
    logPrint("No Find `flutter` Command, Can Not Auto Refresh Device List When Device Connect/Disconnect");
  }
}

export function deactivate() {
  logPrint("adb-helper deactivate");
  adbManager?.dispose();
  adbManager = undefined;
}
