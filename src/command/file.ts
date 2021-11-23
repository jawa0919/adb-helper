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

export function mkdir(id: string, path: string): boolean {
  try {
    const res = ww("adb", ["-s", id, "shell", "mkdir", path]);
    return res.stdout === "";
  } catch (error) {
    logPrint(`mkdir.catch\n${error}`);
    return false;
  }
}

export function push(id: string, locPath: string, path: string): boolean {
  try {
    const res = ww("adb", ["-s", id, "push", locPath, path]);
    return res.stdout !== "";
  } catch (error) {
    logPrint(`push.catch\n${error}`);
    return false;
  }
}
export function rm(id: string, path: string): boolean {
  try {
    const res = ww("adb", ["-s", id, "shell", "rm", "-r", path]);
    return res.stdout === "";
  } catch (error) {
    logPrint(`rm.catch\n${error}`);
    return false;
  }
}
