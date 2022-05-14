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

export async function ls(devId: string, devicePath: string): Promise<[string, FileType][]> {
  let cmd = ["-s", devId, "shell", "ls", devicePath, "-F"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  let res: [string, FileType][] = [];
  procRes.stdout.split(/\n|\r\n/).forEach((line) => {
    let t = _lsParse(line.trim());
    if (t) res.push(t);
  });
  res.sort(_sort);
  return res;
}

// acct/
// bin@
// bugreports@
// cache/
// charger@
// config/
// custom@
// d@
// data/
// default.prop@
// dev/
// etc@
// lost+found/
// mnt/
// odm/
// ls: //fstab.enableswap: Permission denied
// ls: //init: Permission denied
// ls: //init.environ.rc: Permission denied
// ls: //init.oppo.debug.rc: Permission denied
// ls: //init.oppo.face.rc: Permission denied
// ls: //init.oppo.fingerprints.rc: Permission denied
// ls: //init.oppo.seccommon.rc: Permission denied
// ls: //init.rc: Permission denied
// ls: //init.usb.configfs.rc: Permission denied
// ls: //init.usb.rc: Permission denied
// ls: //init.zygote32.rc: Permission denied
// ls: //init.zygote64_32.rc: Permission denied
// ls: //ueventd.rc: Permission denied
// ls: //ueventd.reserve.rc: Permission denied
// oem/
// proc/
// product@
// sbin/
// sdcard@
// storage/
// sys/
// system/
// vendor/
function _lsParse(line: string): [string, FileType] | undefined {
  if (line.length < 1) return undefined;
  if (line.startsWith("total")) return undefined;
  if (line.endsWith("Permission denied")) return undefined;

  if (line.endsWith("@")) {
    return [line.substring(0, line.length - 1) + "/", FileType.Directory];
  } else if (line.endsWith("/")) {
    return [line.substring(0, line.length - 1), FileType.Directory];
  } else {
    return [line, FileType.File];
  }
}

function _sort(a: [string, FileType], b: [string, FileType]): number {
  if (a[1] === b[1]) {
    return a[0].localeCompare(b[0]);
  } else {
    return b[1].valueOf() - a[1].valueOf();
  }
}

export async function stat(devId: string, devicePath: string): Promise<FileStat> {
  let cmd = ["-s", devId, "shell", "stat", devicePath, "-c", "%f=%s=%X=%Y"];
  const proc = await simpleSafeSpawn("adb", cmd, adbBinPath);
  return _statParse(proc.stdout.trim());
}

// 81b0=71976=1651771061=1651771061
function _statParse(line: string): FileStat {
  const temp = line.split(/=/);
  return {
    type: temp[0] === "81b0" ? FileType.File : FileType.Directory,
    size: parseInt(temp[1]),
    ctime: parseInt(temp[2]),
    mtime: parseInt(temp[3]),
  };
}
