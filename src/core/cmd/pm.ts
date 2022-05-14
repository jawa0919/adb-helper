/*
 * @FilePath     : /src/core/cmd/pm.ts
 * @Date         : 2022-05-14 18:41:21
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : pm
 */

import { adbBinPath } from "../app/AppConfig";
import { simpleSafeSpawn } from "../utils/processes";

export interface IApk {
  devId: string;
  apkId: string;
}

export async function pm(devId: string, filter: string): Promise<IApk[]> {
  let cmd = ["-s", devId, "shell", "pm", "list", "packages", filter];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  if (procRes.exitCode === 0) {
    let res: IApk[] = [];
    procRes.stdout.split(/\n|\r\n/).forEach((line) => {
      let t = _pmParse(line.trim(), devId);
      if (t) res.push(t);
    });
    res.sort(_sort);
    return res;
  }
  return [];
}

function _pmParse(line: string, devId: string): IApk | undefined {
  if (line.length < 1) return undefined;
  const apkId = line.replace(/package:/, "").trim();
  if (apkId.length < 1) return undefined;
  return { devId, apkId };
}

function _sort(a: IApk, b: IApk): number {
  return a.apkId.localeCompare(b.apkId);
}

export async function getApkPath(devId: string, apkId: string): Promise<string> {
  let cmd = ["-s", devId, "shell", "pm", "path", apkId];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  if (procRes.stdout.includes("package:")) {
    const apkPath = procRes.stdout.replace(/package:/, "").trim();
    return apkPath;
  }
  return "";
}

export async function stopTheApp(devId: string, apkId: string): Promise<void> {
  let cmd = ["-s", devId, "shell", "am", "force-stop", apkId];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
}
