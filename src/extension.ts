import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "adb-helper" is now active!');
  let disposable = vscode.commands.registerCommand(
    "adb-helper.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from adb-helper!");
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
