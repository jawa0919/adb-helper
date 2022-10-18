/*
 * @FilePath     : /src/core/cmd/apk_info.ts
 * @Date         : 2022-09-27 11:15:21
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : app的信息
 */

import { adbBinPath } from "../app/AppConfig";
import { simpleSafeSpawn } from "../utils/processes";

export async function dumpsys(devId: string, apkId: string): Promise<string[]> {
  let cmd = ["-s", devId, "shell", "dumpsys", "package", apkId];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  return procRes.stdout.split(/\n|\r\n/);
}

export async function getGrantedPermissions(devId: string, apkId: string): Promise<string[]> {
  let lins = await dumpsys(devId, apkId);
  let res = lins.filter((line) => line.indexOf("permission") >= 0 && line.indexOf("granted=true") >= 0);
  return res.map((line) => line.split(":")[0].trim());
}

export async function meminfo(devId: string, apkId: string): Promise<string[]> {
  let cmd = ["-s", devId, "shell", "dumpsys", "meminfo", apkId];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  return procRes.stdout.split(/\n|\r\n/);
}

export async function getPid(devId: string, apkId: string): Promise<string> {
  let lins = await meminfo(devId, apkId);
  let res = lins.find((line) => line.includes("pid")) || "";
  let resList = res.split(/\s+/);
  let pidIndex = resList.findIndex((line) => line.includes("pid"));
  return resList[pidIndex + 1];
}
