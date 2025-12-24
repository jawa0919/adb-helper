/*
 * @FilePath     : /src/core/controller/ApkController.ts
 * @Date         : 2022-05-14 18:37:56
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : ApkController
 */

import { join } from "node:path";
import { commands, Disposable, env, ExtensionContext, TreeItem, window } from "vscode";
import { getGrantedPermissions, getPid } from "../cmd/apk_info";
import { clear, revokePermission, uninstall } from "../cmd/install";
import { pull } from "../cmd/io";
import { openApkLogCat } from "../cmd/logcat";
import { getApkPath, IApk, stopTheApp } from "../cmd/pm";
import { chooseFolder, showInformationMessage, showModal, showProgress, waitMoment } from "../utils/util";
import { DeviceController } from "./DeviceController";

export class ApkController implements Disposable {
  constructor(public context: ExtensionContext) {
    /// commands
    commands.registerCommand("adb-helper.wipeApkData", (res) => this.wipeApkData(res));
    commands.registerCommand("adb-helper.wipeApkPermissions", (res) => this.wipeApkPermissions(res));
    commands.registerCommand("adb-helper.uninstallApk", (res) => this.uninstallApk(res));
    commands.registerCommand("adb-helper.exportApk", (res) => this.exportApk(res));
    commands.registerCommand("adb-helper.stopApk", (res) => this.stopApk(res));
    commands.registerCommand("adb-helper.copyApkId", (res) => this.copyApkId(res));
    commands.registerCommand("adb-helper.showAppLogCat", (res) => this.showAppLogCat(res));
  }
  async showAppLogCat(res: TreeItem) {
    let apk: IApk = JSON.parse(res.tooltip?.toString() || "");
    DeviceController.logCatProcess?.cancel();
    DeviceController.logCatChannel?.dispose();
    await waitMoment();
    let pid = await getPid(apk.devId, apk.apkId);
    DeviceController.logCatChannel = window.createOutputChannel("AdbHelper-" + apk.devId + "-" + apk.apkId, { log: true });
    DeviceController.logCatProcess = openApkLogCat(apk.devId, pid, (res, level) => {
      // TODO 2025-12-24 16:07:06 Level
      if (level === "V") {
        DeviceController.logCatChannel?.trace(res);
      } else if (level === "D") {
        DeviceController.logCatChannel?.debug(res);
      } else if (level === "I") {
        DeviceController.logCatChannel?.info(res);
      } else if (level === "W") {
        DeviceController.logCatChannel?.warn(res);
      } else if (level === "E") {
        DeviceController.logCatChannel?.error(res);
      } else {
        DeviceController.logCatChannel?.appendLine(res);
      }
    });
    DeviceController.logCatChannel?.show();
  }
  async copyApkId(res: TreeItem) {
    let apk: IApk = JSON.parse(res.tooltip?.toString() || "");
    env.clipboard.writeText(`${apk.apkId}`);
  }
  async stopApk(res: TreeItem) {
    let apk: IApk = JSON.parse(res.tooltip?.toString() || "");
    await stopTheApp(apk.devId, apk.apkId);
  }
  async exportApk(res: TreeItem) {
    let apk: IApk = JSON.parse(res.tooltip?.toString() || "");
    const folders = await chooseFolder(false);
    const folderPath = folders?.[0]?.fsPath || "";
    if (folderPath === "") return;
    showProgress("Export Apk running!", async () => {
      const fileName = `${apk.apkId}.apk`;
      const apkPath = await getApkPath(apk.devId, apk.apkId);
      await waitMoment();
      let success = await pull(apk.devId, apkPath, join(folderPath, fileName));
      if (success) showInformationMessage("Export Apk Success");
      return;
    });
  }
  async uninstallApk(res: TreeItem) {
    let apk: IApk = JSON.parse(res.tooltip?.toString() || "");
    if ((await showModal("Do you want uninstall this apk?", apk.apkId, ...["YES", "NO"])) === "YES") {
      showProgress("Uninstall Apk running!", async () => {
        await waitMoment();
        let success = await uninstall(apk.devId, apk.apkId);
        if (success) commands.executeCommand("adb-helper.refreshDeviceManager");
        return;
      });
    }
  }
  async wipeApkPermissions(res: TreeItem) {
    let apk: IApk = JSON.parse(res.tooltip?.toString() || "");
    if ((await showModal("Do you want wipe this apk permission?", apk.apkId, ...["YES", "NO"])) === "YES") {
      await waitMoment();
      let permissions = await getGrantedPermissions(apk.devId, apk.apkId);
      console.log(permissions);
      let success = Promise.all(permissions.map((r) => revokePermission(apk.devId, apk.apkId, r)));
      if (!success) return;
      showInformationMessage("Wipe Apk Permissions Success");
      return;
    }
  }
  async wipeApkData(res: TreeItem) {
    let apk: IApk = JSON.parse(res.tooltip?.toString() || "");
    if ((await showModal("Do you want wipe this apk data?", apk.apkId, ...["YES", "NO"])) === "YES") {
      await waitMoment();
      let success = await clear(apk.devId, apk.apkId);
      if (!success) return;
      showInformationMessage("Wipe Apk Data Success");
      return;
    }
  }
  dispose() { }
}
