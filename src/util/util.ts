/*
 * @FilePath     : /adb-helper/src/util.ts
 * @Date         : 2021-08-12 18:10:55
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : util
 */

import { Uri } from "vscode";

export async function waitMoment(ms = 300): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function createUri(authority: string, path: string): Uri {
  const scheme = "adbEx";
  const uri = Uri.from({
    scheme: scheme,
    authority: authority,
    path: path,
  });
  return uri;
}
