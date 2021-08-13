/*
 * @FilePath     : /adb-helper/src/command/pm.ts
 * @Date         : 2021-08-13 16:35:18
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : pm
 */

import { IApk } from "../type";
import { cmd } from "../util";

export async function pm(id: string, args: string): Promise<IApk[]> {
  const s = `adb -s ${id} shell pm list packages  -f ${args}`;
  let lines = await cmd(s);
  return _parseV1(id, lines);
}

// package:/data/app/com.speedsoftware.rootexplorer-1/base.apk=com.speedsoftware.rootexplorer
// package:/data/app/cn.wps.moffice_eng-2/base.apk=cn.wps.moffice_eng
function _parseV1(id: string, lines: string[]): IApk[] {
  let res = lines.map<IApk>((line) => {
    const temp = line.split(/=/);
    let path = temp[0].replace(/package:/g, "");
    let name = temp[1];
    return { path, name };
  });
  res.sort((a, b) => (a.name < b.name ? -1 : 1));
  return res;
}
