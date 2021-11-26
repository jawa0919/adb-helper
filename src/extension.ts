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
    // _flutterDaemon(tree);
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

// function _flutterDaemon(tree: ManagerTree) {
//   const pro = execa("flutter", ["daemon"]);
//   pro.stdout?.on("data", (data: string) => {
//     const res = JSON.parse(data);
//     if (res[0].event === "device.added") {
//       // [{ event: "device.added", params: { id: "89a6bc23", name: "vivo X9s", platform: "android-arm64", emulator: false, category: "mobile", platformType: "android", ephemeral: true, emulatorId: null } }];
//       tree.added(res[0].params.id);
//     }
//     if (res[0].event === "device.removed") {
//       // [{"event":"device.removed","params":{"id":"89a6bc23","name":"vivo X9s","platform":"android-arm","emulator":false,"category":"mobile","platformType":"android","ephemeral":true,"emulatorId":null}}]
//       tree.removed(res[0].params.id);
//     }
//     logPrint("_flutterDaemon stdout data" + data);
//   });
//   pro.stderr?.on("data", (data: string) => {
//     logPrint("_flutterDaemon stderr data" + data);
//   });
//   pro.on("exit", (code, signal) => {
//     logPrint("_flutterDaemon exit" + code + signal);
//   });
//   pro.on("error", (error) => {
//     logPrint("_flutterDaemon error" + error);
//   });
//   const req = { id: 10086, method: "device.enable" };
//   const json = "[" + JSON.stringify(req) + "]\r\n";
//   pro.stdin?.write(json);
// }
