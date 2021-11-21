import * as vscode from "vscode";
import { adbVersion, flutterVersion } from "./command/base";

import { ManagerTree } from "./manager/managerTree";
import { logPrint } from "./util/logs";

import execa = require("execa");

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "adb-helper" is now active!');
  logPrint('Congratulations, your extension "adb-helper" is now active!');

  let disposable = vscode.commands.registerCommand("adb-helper.ADBHelper.Start", async () => {
    /// _test();
    /// adbVersion
    if (adbVersion() === "") {
      vscode.window.showWarningMessage("`adb` command not found in the PATH");
      return;
    }
    await vscode.commands.executeCommand("setContext", "adb-helper:isADBSupport", true);

    /// flutterVersion
    if (flutterVersion() === "") {
      await vscode.commands.executeCommand("setContext", "adb-helper:isFLUTTERSupport", false);
      vscode.window.showWarningMessage("`flutter` command not found in the PATH");
    } else {
      await vscode.commands.executeCommand("setContext", "adb-helper:isFLUTTERSupport", true);
    }

    new ManagerTree(context);
  });
  context.subscriptions.push(disposable);

  /// Start
  vscode.commands.executeCommand("adb-helper.ADBHelper.Start");
}

export function deactivate() {
  console.log("adb-helper deactivated");
}

function _test() {
  console.log("adb-helper _test");

  const res1 = execa.sync("adb", ["version"]);
  logPrint(res1.stdout);

  const res2 = execa.sync("flutter", ["--version"]);
  logPrint(res2.stdout);

  const pro = execa("flutter", ["daemon"]);
  pro.stdout?.on("data", (data: Buffer | string) => {
    logPrint("stdout data" + data);
  });
  pro.stderr?.on("data", (data: Buffer | string) => {
    logPrint("stderr data" + data);
  });
  pro.on("exit", (code, signal) => {
    logPrint("exit" + code + signal);
  });
  pro.on("error", (error) => {
    logPrint("error" + error);
  });
  const req = { id: 2, method: "device.enable", params: {} };
  const json = "[" + JSON.stringify(req) + "]\r\n";
  pro.stdin?.write(json);
}
