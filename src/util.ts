/*
 * @FilePath     : /adb-helper/src/util.ts
 * @Date         : 2021-08-12 18:10:55
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : util
 */

import { command, commandSync } from "execa";
import { Uri, window } from "vscode";

const log = window.createOutputChannel("ADB Helper");

export function appendLine(logStr: string): void {
  log.appendLine(logStr);
}

export function cSync(cmd: string): string {
  appendLine(`cSync:${cmd}`);
  try {
    const res = commandSync(cmd);
    if (res.stderr) {
      throw new Error(res.stderr);
    }
    appendLine(`cSync return start---\n${res.stdout}\n---end`);
    return res.stdout;
  } catch (err) {
    console.error(`cSync catch start---\n${err}\n---catch end`);
    return "";
  }
}

export async function c(cmd: string): Promise<string> {
  appendLine(`c:${cmd}`);
  const res = await command(cmd).catch((err) => {
    console.error(`c catch start---\n${err}\n---catch end`);
    return err;
  });
  appendLine(`c return start---\n${res.stdout}\n---end`);
  return res.stdout;
}

export function cmdSync(cmd: string): string[] {
  appendLine(`cmdSync:${cmd}`);
  try {
    const res = commandSync(cmd);
    if (res.stderr) {
      throw new Error(res.stderr);
    }
    let lines = res.stdout.trim().split(/\n|\r\n/);
    lines = lines.map((r) => r.trim());
    appendLine(`cmdSync return start---\n${lines.join("\n")}\n---end`);
    return lines;
  } catch (err) {
    console.error(`cmdSync catch start---\n${err}\n---catch end`);
    return [];
  }
}

export async function cmd(cmd: string): Promise<string[]> {
  appendLine(`cmd:${cmd}`);
  const res = await command(cmd).catch((err) => {
    console.error(`cmd catch start---\n${err}\n---catch end`);
    return err;
  });
  let lines = res.stdout.trim().split(/\n|\r\n/);
  lines = lines.map((r) => r.trim()).filter((r) => r !== "");
  appendLine(`cmd return start-length${lines.length}---\n${lines.join("\n")}\n---end`);
  return lines;
}

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
