/*
 * @FilePath     : /src/core/cmd/ls.ts
 * @Date         : 2022-05-14 20:24:03
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : ls
 */

import { FileStat, FileType } from "vscode";
import { adbBinPath } from "../app/AppConfig";
import { simpleSafeSpawn } from "../utils/processes";
import { runAsLs, runAsStat } from "./run_as";
import { lsParse } from "../utils/parseString";

export async function ls(devId: string, remotePath: string): Promise<[string, FileType][]> {
  if (remotePath.startsWith("/data/data")) return runAsLs(devId, remotePath);
  let cmd = ["-s", devId, "shell", "ls", remotePath, "-l"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  let res: [string, FileType][] = [];
  procRes.stdout.split(/\n|\r\n/).forEach((line) => {
    let t = lsParse(line.trim());
    if (t) res.push(t);
  });
  res.sort(_sort);
  if (res.length === 0 && procRes.stderr) {
    return [[procRes.stderr, FileType.Unknown]];
  }
  return res;
}

export function _sort(a: [string, FileType], b: [string, FileType]): number {
  if (a[1] === FileType.File) return 1;
  if (b[1] === FileType.File) return -1;
  if (a[1] === b[1]) {
    return a[0].localeCompare(b[0]);
  } else {
    return b[1].valueOf() - a[1].valueOf();
  }
}

export async function stat(devId: string, remotePath: string): Promise<FileStat> {
  if (remotePath.startsWith("/data/data")) return runAsStat(devId, remotePath);
  let cmd = ["-s", devId, "shell", "stat", remotePath, "-c", "%f=%s=%X=%Y"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  return _statParse(procRes.stdout);
}

// 81b0=71976=1651771061=1651771061
export function _statParse(line: string): FileStat {
  const temp = line.split(/=/);
  return {
    type: temp[0] === "81b0" ? FileType.File : FileType.Directory,
    size: parseInt(temp[1]),
    ctime: parseInt(temp[2]),
    mtime: parseInt(temp[3]),
  };
}

export function noneFileStat(type: FileType): FileStat {
  return { type, size: 0, ctime: 0, mtime: 0 };
}
