import * as vscode from "vscode";
import { adbVersion } from "./api/base";
import { DevicesTree } from "./devices/devicesTree";
import { CommandTree } from "./command/commandTree";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "adb-helper" is now active!');

  let disposable = vscode.commands.registerCommand("adb-helper.Adb.Start", async () => {
    const version = adbVersion();
    if (version === "") {
      vscode.window.showWarningMessage("ADB command not found in the PATH");
      return;
    }
    new DevicesTree(context);
    new CommandTree(context);
    await vscode.commands.executeCommand("setContext", "adb-helper:isADBSupport", true);
  });
  context.subscriptions.push(disposable);

  /// start
  vscode.commands.executeCommand("adb-helper.Adb.Start");
}

export function deactivate() {
  console.log("adb-helper deactivated");
}
