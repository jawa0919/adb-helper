/*
 * @FilePath     : /src/core/cmd/fs.ts
 * @Date         : 2022-05-15 11:46:24
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : fs
 */

import { adbBinPath } from "../app/AppConfig";
import { simpleSafeSpawn } from "../utils/processes";
import { runAsMkdir, runAsMv, runAsRm } from "./run_as";

export async function mkdir(devId: string, remotePath: string): Promise<void> {
  if (remotePath.startsWith("/data/data")) return runAsMkdir(devId, remotePath);
  let cmd = ["-s", devId, "shell", "mkdir", remotePath];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
}

export async function mv(devId: string, oldRemotePath: string, newRemotePath: string): Promise<void> {
  if (oldRemotePath.startsWith("/data/data")) return runAsMv(devId, oldRemotePath, newRemotePath);
  let cmd = ["-s", devId, "shell", "mv", "-i", oldRemotePath, newRemotePath];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
}

export async function rm(devId: string, remotePath: string): Promise<void> {
  if (remotePath.startsWith("/data/data")) return runAsRm(devId, remotePath);
  let cmd = ["-s", devId, "shell", "rm", "-r", remotePath];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
}
