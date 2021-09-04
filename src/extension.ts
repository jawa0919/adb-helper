import * as vscode from "vscode";
import { adbVersion } from "./command/base";
import { CommandTree } from "./tree/commandTree";
import { DevicesTree } from "./tree/devicesTree";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "adb-helper" is now active!');

  let disposable = vscode.commands.registerCommand("adb-helper.Adb.Start", () => {
    const version = adbVersion();
    if (version === "") {
      vscode.window.showWarningMessage("ADB command not found in the PATH");
      return;
    }
    const devicesTree = new DevicesTree(context);
    const commandTree = new CommandTree(context);
    vscode.commands.executeCommand("setContext", "adb-helper:isADBSupport", true);
  });
  context.subscriptions.push(disposable);

  /// start
  vscode.commands.executeCommand("adb-helper.Adb.Start");
}

export function deactivate() {
  console.log("adb-helper deactivated");
}
