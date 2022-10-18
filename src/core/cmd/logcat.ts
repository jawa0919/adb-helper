/*
 * @FilePath     : /src/core/cmd/logcat.ts
 * @Date         : 2022-10-18 10:27:57
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : 日志
 */

import { adbBinPath } from "../app/AppConfig";
import { safeSpawn } from "../utils/processes";
import { showErrorMessage } from "../utils/util";

export async function openLogCat(devId: string, callback?: (line: string) => void): Promise<string> {
  let cmd = ["-s", devId, "logcat", "-v", "time"];
  const procRes = safeSpawn("adb", cmd, adbBinPath);
  procRes.stderr?.on("data", (err) => {
    const res = Buffer.from(err).toString();
    console.error("errDataListener", res);
    showErrorMessage(res);
    procRes.cancel();
  });
  procRes.stdout?.on("data", (chunk) => {
    const res = Buffer.from(chunk).toString();
    res.split(/\n|\r\n/).forEach((line) => {
      if (callback) callback(line.trim());
    });
  });
  procRes.on("error", (err) => {
    const res = Buffer.from(err.message).toString();
    console.error("errDataListener", res);
    showErrorMessage(res);
    procRes.cancel();
  });
  return "";
}
