import * as vscode from "vscode";

import { ManagerTree } from "./manager/managerTree";
import { cmd } from "./util/util";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "adb-helper" is now active!');

  let disposable = vscode.commands.registerCommand("adb-helper.ADBHelper.Start", async () => {
    const version = cmd("adb version");
    if (version === "") {
      vscode.window.showWarningMessage("ADB command not found in the PATH");
      return;
    }
    new ManagerTree(context);
    await vscode.commands.executeCommand("setContext", "adb-helper:isADBSupport", true);
  });
  context.subscriptions.push(disposable);

  /// Start
  vscode.commands.executeCommand("adb-helper.ADBHelper.Start");
}

export function deactivate() {
  console.log("adb-helper deactivated");
}
