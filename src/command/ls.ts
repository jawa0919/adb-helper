/*
 * @FilePath     : /src/command/ls.ts
 * @Date         : 2021-11-21 18:21:10
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : ls
 */

import { FileType } from "vscode";
import { IFileStat } from "../type";
import { logPrint } from "../util/logs";
import { createUri, ww } from "../util/util";

export function ls(id: string, path: string): IFileStat[] {
  try {
    const res = ww("adb", ["-s", id, "shell", "ls", "-l", path]);
    let lines = res.stdout.trim().split(/\n|\r\n/);
    lines = lines.map((r) => r.trim()).filter((r) => r !== "");
    if (lines.length > 0 && lines[0].startsWith("total")) {
      lines.shift();
      lines = lines.map((r) => r.trim());
      return _parseV2(id, path, lines);
    } else {
      lines = lines.map((r) => r.trim());
      return _parseV1(id, path, lines);
    }
  } catch (error) {
    logPrint(`ls.catch\n${error}`);
    let lines = `${error}`.trim().split(/\n|\r\n/);
    lines = lines.map((r) => r.trim()).filter((r) => r !== "");
    lines = lines.filter((r) => !r.startsWith("Error"));
    lines = lines.filter((r) => !r.endsWith("Permission denied"));
    if (lines.length > 0 && lines[0].startsWith("total")) {
      lines.shift();
      lines = lines.map((r) => r.trim());
      return _parseV2(id, path, lines);
    } else {
      lines = lines.map((r) => r.trim());
      return _parseV1(id, path, lines);
    }
  }
}

// lrwxrwxrwx root     root              2021-07-30 15:23 etc -> /system/etc
// -rw-r--r-- root     root        35854 1970-01-01 08:00 file_contexts
function _parseV1(id: string, path: string, lines: string[]): IFileStat[] {
  let res = lines.map<IFileStat>((line) => {
    const permissionsStr = line.substr(0, 10).trim();
    const userStr = line.substr(11, 19).trim();
    const userGroupStr = line.substr(20, 28).trim();
    const sizeStr = line.substr(29, 37).trim();
    const modificationTimeStr = line.substr(38, 54).trim();
    const nameStr = line.substr(55).trim();

    let type = _parseFileType(permissionsStr.substr(0, 1));
    let size = parseInt(sizeStr);
    let name = (nameStr.split("->").shift() || "").trim();
    let link = (nameStr.split("->").pop() || "").trim();
    let mtime = Date.parse(modificationTimeStr);
    let ctime = Date.now();

    let uriPath = `${path}${name}${type === FileType.Directory ? "/" : ""}`;
    let uri = createUri(id, uriPath);
    if (type === FileType.SymbolicLink) {
      uri = createUri(id, `${link}/`);
      type = FileType.Directory;
    }
    return { size, mtime, type, ctime, name, link, uri };
  });
  res.sort(_sort);
  return res;
}

// drwxr-xr-x   1 root   root     27 2018-08-08 00:01 3rdmodem
function _parseV2(id: string, path: string, lines: string[]): IFileStat[] {
  let res = lines.map<IFileStat>((line) => {
    const temp = line.split(/\s+/);
    const permissionsStr = temp[0];
    const codeStr = temp[1];
    const userStr = temp[2];
    const userGroupStr = temp[3];
    const sizeStr = temp[4];
    const modificationTimeStr = [temp[5], temp[6]].join(" ");
    const nameStr = temp.length > 8 ? [temp[7], temp[8], temp[9]].join(" ") : temp[7];

    let type = _parseFileType(permissionsStr.substr(0, 1));
    let size = parseInt(sizeStr);
    let name = (nameStr.split("->").shift() || "").trim();
    let link = (nameStr.split("->").pop() || "").trim();
    let mtime = Date.parse(modificationTimeStr);
    let ctime = Date.now();

    let uriPath = `${path}${name}${type === FileType.Directory ? "/" : ""}`;
    let uri = createUri(id, uriPath);
    if (type === FileType.SymbolicLink) {
      uri = createUri(id, `${link}/`);
      type = FileType.Directory;
    }
    return { size, mtime, type, ctime, name, link, uri };
  });
  res.sort(_sort);
  return res;
}

function _parseFileType(key: string): FileType {
  let type = FileType.Unknown;
  switch (key) {
    case "-":
      type = FileType.File;
      break;
    case "d":
      type = FileType.Directory;
      break;
    case "l":
      type = FileType.SymbolicLink;
      break;
    case "b":
    case "c":
    case "p":
    case "s":
    default:
      type = FileType.Unknown;
      break;
  }
  return type;
}

function _sort(a: IFileStat, b: IFileStat): number {
  if (a.type === b.type) {
    return a.name < b.name ? -1 : 1;
  } else {
    return b.type.valueOf() - a.type.valueOf();
  }
}
