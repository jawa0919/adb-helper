/*
 * @FilePath     : /adb-helper/src/util/util.ts
 * @Date         : 2021-08-12 18:10:55
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : util
 */

import { command } from "execa";
import { Uri } from "vscode";
import { log } from "./logs";

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

export async function cmd(cmd: string): Promise<string[]> {
  log(`cmd.start:${cmd}`);
  const res = await command(cmd).catch((err) => {
    log(`cmd.error:${cmd}`);
    log(`error:${err}`);
    return { stdout: "" };
  });
  log(`cmd.end:${cmd}`);
  let lines = res.stdout.trim().split(/\n|\r\n/);
  lines = lines.map((r) => r.trim()).filter((r) => r !== "");
  return lines;
}
