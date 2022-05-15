/*
 * @FilePath     : /src/core/cmd/run_as.ts
 * @Date         : 2022-05-15 13:01:27
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : run_as
 */

import { basename, join } from "node:path";
import { FileStat, FileType } from "vscode";
import { adbBinPath } from "../app/AppConfig";
import { simpleSafeSpawn } from "../utils/processes";
import { adbJoin } from "../utils/util";
import { rm } from "./fs";
import { pull, push } from "./io";
import { noneFileStat, _lsParse, _sort, _statParse } from "./ls";
import { pm } from "./pm";

export async function runAsLs(devId: string, remotePath: string): Promise<[string, FileType][]> {
  if (!remotePath.startsWith("/data")) return [];
  if (remotePath === "/data/") return [["data", FileType.Directory]];
  if (remotePath === "/data/data/") {
    const apkList = await pm(devId, "-3");
    return apkList.map((r) => [r.apkId, FileType.Directory]);
  }
  let apkId = remotePath.replace("/data/data/", "").split("/").shift() || "";
  let cmd = ["-s", devId, "shell", "run-as", apkId, "ls", remotePath, "-F"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  let res: [string, FileType][] = [];
  procRes.stdout.split(/\n|\r\n/).forEach((line) => {
    let t = _lsParse(line.trim());
    if (t) res.push(t);
  });
  res.sort(_sort);
  return res;
}

export async function runAsStat(devId: string, remotePath: string): Promise<FileStat> {
  if (!remotePath.startsWith("/data")) return noneFileStat(FileType.Directory);
  if (remotePath === "/data/") return noneFileStat(FileType.Directory);
  if (remotePath === "/data/data/") return noneFileStat(FileType.Directory);
  let apkId = remotePath.replace("/data/data/", "").split("/").shift() || "";
  let cmd = ["-s", devId, "shell", "run-as", apkId, "stat", remotePath, "-c", "%f=%s=%X=%Y"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  return _statParse(procRes.stdout);
}

export async function runAsPull(devId: string, remotePath: string, localPath: string): Promise<boolean> {
  if (!remotePath.startsWith("/data")) return false;
  if (remotePath === "/data/") return false;
  if (remotePath === "/data/data/") return false;
  let apkId = remotePath.replace("/data/data/", "").split("/").shift() || "";

  let pullTempRemotePath = adbJoin("/sdcard/Download/", basename(remotePath));
  // Step 1 cp remotePath -> pullTempLocalPath
  let cpCmd = ["-s", devId, "shell", "run-as", apkId, "cp", remotePath, pullTempRemotePath];
  await simpleSafeSpawn("adb", cpCmd, adbBinPath);
  // Step 2 pull pullTempLocalPath -> localPath
  await pull(devId, pullTempRemotePath, localPath);
  // Step 3 rm deviceDownloadPath
  await rm(devId, pullTempRemotePath);
  return true;
}

export async function runAsMkdir(devId: string, remotePath: string): Promise<void> {
  if (!remotePath.startsWith("/data")) return;
  if (remotePath === "/data/") return;
  if (remotePath === "/data/data/") return;
  let apkId = remotePath.replace("/data/data/", "").split("/").shift() || "";
  let cmd = ["-s", devId, "shell", "run-as", apkId, "mkdir", remotePath];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
}

export async function runAsMv(devId: string, oldRemotePath: string, newRemotePath: string): Promise<void> {
  if (!oldRemotePath.startsWith("/data")) return;
  if (oldRemotePath === "/data/") return;
  if (oldRemotePath === "/data/data/") return;
  let apkId = oldRemotePath.replace("/data/data/", "").split("/").shift() || "";
  let cmd = ["-s", devId, "shell", "run-as", apkId, "mv", "-i", oldRemotePath, newRemotePath];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
}

export async function runAsRm(devId: string, remotePath: string): Promise<void> {
  if (!remotePath.startsWith("/data")) return;
  if (remotePath === "/data/") return;
  if (remotePath === "/data/data/") return;
  let apkId = remotePath.replace("/data/data/", "").split("/").shift() || "";
  let cmd = ["-s", devId, "shell", "run-as", apkId, "rm", "-r", remotePath];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
}

export async function runAsPush(devId: string, localPath: string, remotePath: string): Promise<boolean> {
  if (!remotePath.startsWith("/data")) return false;
  if (remotePath === "/data/") return false;
  if (remotePath === "/data/data/") return false;
  let apkId = remotePath.replace("/data/data/", "").split("/").shift() || "";

  let pushTempRemotePath = adbJoin("/sdcard/Download/", basename(remotePath));
  // Step 1 push localPath -> pushTempRemotePath
  await push(devId, localPath, pushTempRemotePath);
  // Step 2 cp pushTempRemotePath -> remotePath
  let cpCmd = ["-s", devId, "shell", "run-as", apkId, "cp", pushTempRemotePath, remotePath];
  await simpleSafeSpawn("adb", cpCmd, adbBinPath);
  // Step 3 rm pushTempRemotePath
  await rm(devId, pushTempRemotePath);
  return true;
}
