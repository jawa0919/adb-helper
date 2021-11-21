/*
 * @FilePath     : /src/command/file.ts
 * @Date         : 2021-11-21 17:56:00
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : file
 */

import { logPrint } from "../util/logs";
import { ww } from "../util/util";

export function pull(id: string, path: string, locPath: string): boolean {
  try {
    const res = ww("adb", ["-s", id, "pull", path, locPath]);
    return res.stdout !== "";
  } catch (error) {
    logPrint(`pull.catch\n${error}`);
    return false;
  }
}
