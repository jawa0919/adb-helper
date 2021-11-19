/*
 * @FilePath     : /src/util/c.ts
 * @Date         : 2021-10-23 11:04:39
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : 命令行封装
 */

import { command, commandSync } from "execa";
import { log } from "./logs";

export function cSync(cmd: string): string {
  log(`cSync:${cmd}`);
  try {
    const res = commandSync(cmd);
    if (res.stderr) {
      throw new Error(res.stderr);
    }
    return res.stdout;
  } catch (err) {
    console.debug("cSync ~ err", err);
    return "";
  }
}

export async function c(cmd: string): Promise<string> {
  log(`c:${cmd}`);
  const res = await command(cmd);
  return res.stdout;
}

export function cmdSync(cmd: string): string[] {
  log(`cmdSync:${cmd}`);
  try {
    const res = commandSync(cmd);
    if (res.stderr) {
      throw new Error(res.stderr);
    }
    let lines = res.stdout.trim().split(/\n|\r\n/);
    lines = lines.map((r) => r.trim());
    return lines;
  } catch (err) {
    console.debug("cmdSync ~ err", err);
    return [];
  }
}

export async function cmd(cmd: string): Promise<string[]> {
  log(`cmd:${cmd}`);
  const res = await command(cmd);
  let lines = res.stdout.trim().split(/\n|\r\n/);
  lines = lines.map((r) => r.trim()).filter((r) => r !== "");
  return lines;
}
