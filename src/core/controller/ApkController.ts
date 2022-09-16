/*
 * @FilePath     : /src/core/controller/ApkController.ts
 * @Date         : 2022-05-14 18:37:56
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : ApkController
 */

import { join } from "node:path";
import { commands, Disposable, env, ExtensionContext, TreeItem } from "vscode";
import { clear, uninstall } from "../cmd/install";
import { pull } from "../cmd/io";
import { getApkPath, IApk, stopTheApp } from "../cmd/pm";
import { chooseFolder, showInformationMessage, showModal, showProgress, waitMoment } from "../utils/util";

export class ApkController implements Disposable {
  constructor(public context: ExtensionContext) {
    /// commands
    commands.registerCommand("adb-helper.wipeApkData", (res) => this.wipeApkData(res));
    commands.registerCommand("adb-helper.uninstallApk", (res) => this.uninstallApk(res));
    commands.registerCommand("adb-helper.exportApk", (res) => this.exportApk(res));
    commands.registerCommand("adb-helper.stopApk", (res) => this.stopApk(res));
    commands.registerCommand("adb-helper.copyApkId", (res) => this.copyApkId(res));
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
  dispose() {}
}
