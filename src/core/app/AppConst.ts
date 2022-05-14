/*
 * @FilePath     : /src/core/app/AppConst.ts
 * @Date         : 2022-05-13 21:52:24
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : AppConst
 */

import { homedir } from "node:os";
import { join } from "node:path";

export class AppConst {
  static readonly isWin = process.platform.startsWith("win");
  static readonly scheme = "adbhelper";
  static readonly homePath = join(homedir(), `.${AppConst.scheme}`);
  static readonly mirrorPath = join(AppConst.homePath, `ExplorerMirror`);
  static readonly apkFilterList = ["-3", "-s", "-e", "-d"];
}
