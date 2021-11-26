import * as vscode from "vscode";
import { adbVersion } from "./command/base";
import { logPrint } from "./util/logs";

import execa = require("execa");
import { DeviceDaemon } from "./device/deviceDaemon";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "adb-helper" is now active!');

  let disposable = vscode.commands.registerCommand("adb-helper.ADBHelper.Start", async () => {
    console.log("ADBHelper.Start");
    /// adbVersion
    if (adbVersion() === "") {
      vscode.window.showWarningMessage("`adb` command not found in the PATH");
      return;
    }
    await vscode.commands.executeCommand("setContext", "adb-helper:isADBSupport", true);

    new DeviceDaemon(context);
  });
  context.subscriptions.push(disposable);

  /// Start
  vscode.commands.executeCommand("adb-helper.ADBHelper.Start");
}

export function deactivate() {
  console.log("adb-helper deactivated");
}

function _adbVersion() {
  const res1 = execa.sync("adb", ["version"]);
  logPrint(res1.stdout);
}

function _flutterVersion() {
  const res2 = execa.sync("flutter", ["--version"]);
  logPrint(res2.stdout);
}
