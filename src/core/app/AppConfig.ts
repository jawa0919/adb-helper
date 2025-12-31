/*
 * @FilePath     : /src/core/app/AppConfig.ts
 * @Date         : 2022-05-13 21:52:05
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : AppConfig
 */

import { existsSync } from "node:fs";
import { basename, delimiter, join } from "node:path";
import { commands, workspace, WorkspaceConfiguration } from "vscode";
import { logPrint } from "../utils/util";
import { AppConst } from "./AppConst";

export let explorerRootPathList: string[] = [];
export let adbBinPath = "";
export let flutterBinPath = "";
// https://github.com/Genymobile/scrcpy
export let scrcpyBinPath = "";

export function initAppConfig(): void {
  let cf = workspace.getConfiguration();
  loadExplorerRootPathList(cf);
  loadAdbBinPath(cf);
  loadFlutterBinPath(cf);
  loadScrcpyBinPath(cf);
}

function loadExplorerRootPathList(cf: WorkspaceConfiguration = workspace.getConfiguration()): string[] {
  let paths = cf.get<string[]>("adb-helper.explorerRootPathList") || [];
  explorerRootPathList = [...paths];
  return explorerRootPathList;
}

function loadAdbBinPath(cf: WorkspaceConfiguration = workspace.getConfiguration()): string {
  let paths = [cf.get<string>("adb-helper.adbBinPath") || ""];
  let sdkPaths = [];
  sdkPaths.push(cf.get<string>("adb-helper.androidSdkPath") || "");
  sdkPaths.push(process.env.ANDROID_HOME || "");
  sdkPaths.push(process.env.ANDROID_SDK_ROOT || "");
  const normalPath = process.env.PATH || "";
  sdkPaths.push(...normalPath.split(delimiter).filter((p) => p));

  sdkPaths = sdkPaths.map((p) => p.trim()).filter((p) => p);
  sdkPaths = sdkPaths.map((p) => (basename(p) === "platform-tools" ? p : join(p, "platform-tools")));

  sdkPaths = [...paths, ...sdkPaths, AppConst.quickSdkPath].filter((p) => existsSync(join(p, AppConst.isWin ? "adb.exe" : "adb")));

  adbBinPath = sdkPaths.shift() || "";
  logPrint("adbBinPath", adbBinPath);
  commands.executeCommand("setContext", "adb-helper:adbSupport", adbBinPath !== "");
  return adbBinPath;
}

function loadFlutterBinPath(cf: WorkspaceConfiguration = workspace.getConfiguration()): string {
  let sdkPaths = [cf.get<string>("adb-helper.flutterSdkPath") || ""];
  sdkPaths.push(process.env.FLITTER_ROOT || "");
  const normalPath = process.env.PATH || "";
  sdkPaths = `${sdkPaths}${delimiter}${normalPath}`.split(delimiter).filter((p) => p);

  sdkPaths = sdkPaths.map((p) => p.trim()).filter((p) => p);
  sdkPaths = sdkPaths.map((p) => (basename(p) === "bin" ? p : join(p, "bin")));

  sdkPaths = sdkPaths.filter((p) => existsSync(join(p, AppConst.isWin ? "flutter.bat" : "flutter")));

  flutterBinPath = sdkPaths.shift() || "";
  logPrint("flutterBinPath", flutterBinPath);
  commands.executeCommand("setContext", "adb-helper:flutterSupport", flutterBinPath !== "");
  return flutterBinPath;
}

function loadScrcpyBinPath(cf: WorkspaceConfiguration = workspace.getConfiguration()): string {
  let sdkPaths = [cf.get<string>("adb-helper.scrcpyBinPath") || ""];
  const normalPath = process.env.PATH || "";
  sdkPaths = `${sdkPaths}${delimiter}${normalPath}`.split(delimiter).filter((p) => p);

  sdkPaths = sdkPaths.map((p) => p.trim()).filter((p) => p);

  sdkPaths = sdkPaths.filter((p) => existsSync(join(p, AppConst.isWin ? "scrcpy.exe" : "scrcpy")));

  scrcpyBinPath = sdkPaths.shift() || "";
  logPrint("scrcpyBinPath", scrcpyBinPath);
  commands.executeCommand("setContext", "adb-helper:scrcpySupport", scrcpyBinPath !== "");
  return scrcpyBinPath;
}
