/*
 * @FilePath     : /src/core/cmd/io.ts
 * @Date         : 2022-05-14 10:22:29
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : io
 */

import { adbBinPath } from "../app/AppConfig";
import { AppConst } from "../app/AppConst";
import { simpleSafeSpawn } from "../utils/processes";
import { showErrorMessage } from "../utils/util";
import { runAsPull, runAsPush } from "./run_as";

export async function screenCap(devId: string, remotePath: string): Promise<boolean> {
  let cmd = ["-s", devId, "shell", "screencap", remotePath];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  if (procRes.exitCode === 0) {
    return true;
  }
  showErrorMessage(procRes.stderr || procRes.stdout);
  return false;
}

export async function openExplorerWindows(path: string): Promise<boolean> {
  let cmd = [path];
  const procRes = await simpleSafeSpawn(AppConst.isWin ? "explorer" : "open", cmd);
  if (procRes.exitCode === 0) {
    return true;
  }
  showErrorMessage(procRes.stderr || procRes.stdout);
  return false;
}

export async function pull(devId: string, remotePath: string, localPath: string): Promise<boolean> {
  if (remotePath.startsWith("/data")) return runAsPull(devId, remotePath, localPath);
  let cmd = ["-s", devId, "pull", remotePath, localPath];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  if (procRes.exitCode === 0) {
    return true;
  }
  showErrorMessage(procRes.stderr || procRes.stdout);
  return false;
}

export async function push(devId: string, localPath: string, remotePath: string): Promise<boolean> {
  if (remotePath.startsWith("/data")) return runAsPush(devId, localPath, remotePath);
  let cmd = ["-s", devId, "push", localPath, remotePath];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  if (procRes.exitCode === 0) {
    return true;
  }
  showErrorMessage(procRes.stderr || procRes.stdout);
  return false;
}
