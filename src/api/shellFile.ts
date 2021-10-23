/*
 * @FilePath     : /adb-helper/src/api/shellFile.ts
 * @Date         : 2021-08-13 16:52:50
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : shellFile
 */

import { cSync } from "../util/c";

export function mkdir(id: string, path: string): boolean {
  path = path.replace(/ /g, "\\ ");
  let s = `adb -s ${id} shell mkdir ${path}`;
  const res = cSync(s);
  return res === "";
}

export function pull(id: string, path: string, locPath: string): boolean {
  path = path.replace(/ /g, "\\ ");
  locPath = locPath.replace(/ /g, "\\ ");
  let s = `adb -s ${id} pull ${path} ${locPath}`;
  const res = cSync(s);
  return res !== "";
}

export function push(id: string, locPath: string, path: string): boolean {
  locPath = locPath.replace(/ /g, "\\ ");
  path = path.replace(/ /g, "\\ ");
  let s = `adb -s ${id} push ${locPath} ${path}`;
  const res = cSync(s);
  return res !== "";
}

export function rm(id: string, path: string): boolean {
  path = path.replace(/ /g, "\\ ");
  let s = `adb -s ${id} shell rm -r ${path}`;
  const res = cSync(s);
  return res === "";
}
