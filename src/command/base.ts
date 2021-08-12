/*
 * @FilePath     : /adb-helper/src/command/base.ts
 * @Date         : 2021-08-12 18:26:33
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : base
 */

import { commandSync } from "execa";

export function adbVersion(): string {
  console.debug(`adb version`);
  try {
    const res = commandSync("adb version");
    if (res.stderr) {
      throw new Error(res.stderr);
    }
    return res.stdout;
  } catch (err) {
    console.error(err);
    return "";
  }
}
