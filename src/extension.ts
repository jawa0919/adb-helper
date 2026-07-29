/*
 * @FilePath     : /src/extension.ts
 * @Date         : 2022-05-13 16:16:18
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : extension
 */

import { commands, ExtensionContext, ProgressLocation, window, workspace } from "vscode";
import { adbBinPath, explorerRootPathList, flutterBinPath, initAppConfig, scrcpyBinPath } from "./core/app/AppConfig";
import { AdbController } from "./core/controller/AdbController";
import { logPrint, showProgress, showWarningMessage, waitMoment } from "./core/utils/util";
import { AppConst } from "./core/app/AppConst";
import { join } from "node:path";
import { cpSync, renameSync, rmSync } from "node:fs";
import { downloadFile, zipFile, extractFile } from "./core/utils/file_util";
import { killServer, startServer } from "./core/cmd/connect";
import { findScrcpyBinDir, getScrcpyAsset } from "./core/utils/github_asset_download";

let adbManager: AdbController | undefined;

export function activate(context: ExtensionContext) {
  logPrint("adb-helper active");

  initAppConfig();
  workspace.onDidChangeConfiguration(() => initAppConfig());

  logPrint(explorerRootPathList, adbBinPath, flutterBinPath);

  commands.registerCommand("adb-helper.installAdb", async () => {
    await installAdb();
    initAppConfig();
    logPrint(explorerRootPathList, adbBinPath, flutterBinPath);
    if (adbManager === undefined) {
      adbManager = new AdbController(context);
    }
    if (flutterBinPath !== "") {
      adbManager.createFlutterDaemon();
    } else {
      commands.executeCommand("adb-helper.refreshDeviceManager");
      logPrint("No Find `flutter` Command, Can Not Auto Refresh Device List When Device Connect/Disconnect");
    }
  });

  commands.registerCommand("adb-helper.installScrcpy", async () => {
    await installScrcpy();
    initAppConfig();
    logPrint(explorerRootPathList, adbBinPath, flutterBinPath, scrcpyBinPath);
    if (adbManager === undefined) {
      adbManager = new AdbController(context);
    }
    if (flutterBinPath !== "") {
      adbManager.createFlutterDaemon();
    } else {
      commands.executeCommand("adb-helper.refreshDeviceManager");
      logPrint("No Find `flutter` Command, Can Not Auto Refresh Device List When Device Connect/Disconnect");
    }
  });

  commands.registerCommand("adb-helper.restartAdb", () => {
    if (adbBinPath === "") {
      showWarningMessage("No Find `adb` Command, Please Check Your Config");
      return;
    }
    showProgress("Restart Adb running!", async () => {
      await killServer();
      await waitMoment();
      await startServer();
      await waitMoment();
      await commands.executeCommand("adb-helper.refreshDeviceManager");
      return;
    });
  });

  if (adbBinPath === "") {
    showWarningMessage("No Find `adb` Command, Please Check Your Config");
    return;
  }

  if (adbManager === undefined) {
    adbManager = new AdbController(context);
  }

  if (flutterBinPath !== "") {
    adbManager.createFlutterDaemon();
  } else {
    commands.executeCommand("adb-helper.refreshDeviceManager");
    logPrint("No Find `flutter` Command, Can Not Auto Refresh Device List When Device Connect/Disconnect");
  }
}

export function deactivate() {
  logPrint("adb-helper deactivate");
  adbManager?.dispose();
  adbManager = undefined;
}

async function installAdb() {
  logPrint("installAdb");
  let zipName = "";
  if (AppConst.isWin) {
    zipName = "platform-tools-latest-windows.zip";
  } else if (AppConst.isMac) {
    zipName = "platform-tools-latest-darwin.zip";
  } else if (AppConst.isLinux) {
    zipName = "platform-tools-latest-linux.zip";
  }
  if (zipName === "") {
    window.showErrorMessage(`no find you system support adb`);
    return;
  }
  try {
    const tempFile = join(AppConst.homePath, zipName);
    await window.withProgress({
      location: ProgressLocation.Notification,
      title: 'downloading'
    }, async (progress) => {
      progress.report({ message: 'starting download' });
      const adbZipUrl = 'https://googledownloads.cn/android/repository/' + zipName;
      await downloadFile(adbZipUrl, tempFile);
      progress.report({ message: 'starting unzip' });
      await zipFile(tempFile, AppConst.homePath);
    });
    window.showInformationMessage(`installAdb success: ${AppConst.quickSdkPath}`, ...["Restart Adb Helper"]).then((r) => {
      if (r === "Restart Adb Helper") commands.executeCommand("vscode.open", "adb-helper.restartAdb");
    });
  } catch (error) {
    logPrint("installAdb error: " + error);
    window.showErrorMessage(`installAdb error: ${error}`);
  }
}

async function installScrcpy() {
  logPrint("installScrcpy");
  try {
    const asset = await getScrcpyAsset();
    if (!asset) {
      window.showErrorMessage(`no find you system support scrcpy`);
      return;
    }
    const tempFile = join(AppConst.homePath, asset.name);
    rmSync(tempFile, { recursive: true, force: true });
    await window.withProgress({
      location: ProgressLocation.Notification,
      title: 'downloading scrcpy'
    }, async (progress) => {
      progress.report({ message: 'starting download' });
      await downloadFile(asset.browser_download_url, tempFile);
      progress.report({ message: 'starting unzip' });
      await extractFile(tempFile, AppConst.homePath);
    });
    const binDir = findScrcpyBinDir(AppConst.homePath);
    if (!binDir) {
      window.showErrorMessage(`can not find scrcpy after extract`);
      return;
    }
    rmSync(AppConst.quickScrcpyPath, { recursive: true, force: true });
    try {
      renameSync(binDir, AppConst.quickScrcpyPath);
    } catch {
      cpSync(binDir, AppConst.quickScrcpyPath, { recursive: true });
      rmSync(binDir, { recursive: true, force: true });
    }
    window.showInformationMessage(`installScrcpy success: ${AppConst.quickScrcpyPath}`);
  } catch (error) {
    logPrint("installScrcpy error: " + error);
    window.showErrorMessage(`installScrcpy error: ${error}`);
  }
}


