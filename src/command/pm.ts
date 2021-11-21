/*
 * @FilePath     : /src/command/pm.ts
 * @Date         : 2021-11-21 18:06:45
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : pm
 */

import { IApk } from "../type";
import { logPrint } from "../util/logs";
import { ww } from "../util/util";

export function pmList(id: string, args: string): IApk[] {
  try {
    const res = ww("adb", ["-s", id, "shell", `pm`, `list`, `packages`, `-f`, `${args}`]);
    let lines = res.stdout.trim().split(/\n|\r\n/);
    lines = lines.map((r) => r.trim()).filter((r) => r !== "");
    return _parsePmListV1(id, lines);
  } catch (error) {
    logPrint(`pmList.catch\n${error}`);
    return [];
  }
}

// package:/data/app/com.speedsoftware.rootexplorer-1/base.apk=com.speedsoftware.rootexplorer
// package:/data/app/cn.wps.moffice_eng-2/base.apk=cn.wps.moffice_eng
function _parsePmListV1(id: string, lines: string[]): IApk[] {
  let res = lines.map<IApk>((line) => {
    const temp = line.split(/=/);
    let name = temp.pop() || "";
    let path = temp.join("=").replace(/package:/g, "");
    return { path, name };
  });
  res.sort((a, b) => (a.name < b.name ? -1 : 1));
  return res;
}
