/*
 * @FilePath     : /src/core/cmd/install.ts
 * @Date         : 2022-05-14 12:24:25
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : install
 */

import { adbBinPath } from "../app/AppConfig";
import { simpleSafeSpawn } from "../utils/processes";
import { showErrorMessage } from "../utils/util";

export async function install(devId: string, apkLocalPath: string): Promise<boolean> {
  let cmd = ["-s", devId, "install", "-r", "-t", apkLocalPath];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  if (procRes.stdout.includes("Success")) {
    return true;
  }
  showErrorMessage(procRes.stderr || procRes.stdout);
  return false;
}
