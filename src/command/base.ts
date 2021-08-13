/*
 * @FilePath     : /adb-helper/src/command/base.ts
 * @Date         : 2021-08-12 18:26:33
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : base
 */

import { IDevice } from "../type";
import { cmdSync, cSync } from "../util";

export function adbVersion(path?: string): string {
  const s = `adb version`;
  const res = cSync(s);
  return res;
}

export function adbDevices(): IDevice[] {
  const s = `adb devices -l`;
  const res = cmdSync(s);
  return _adbDevicesParse(res);
}

function _adbDevicesParse(lines: string[]): IDevice[] {
  // parse
  lines.shift();
  const infoList = lines.map<IDevice>((line) => {
    const temp = line.split(/\s+/);
    const id = temp[0];
    const type = temp[1];
    const product = temp[2].split(":").pop() || "";
    const model = temp[3].split(":").pop() || "";
    const device = temp[4].split(":").pop() || "";
    const transportId = parseInt(temp[5].split(":").pop() || "0");
    if (id.indexOf(":") !== -1) {
      const ip = id.split(":").shift() || "";
      const port = parseInt(id.split(":").pop() || "0");
      return { id, type, product, model, device, transportId, ip, port };
    }
    return { id, type, product, model, device, transportId };
  });
  // sort
  infoList.sort((a, b) => a.transportId - b.transportId);
  return infoList;
}

export function disconnectAll(): boolean {
  const s = `adb disconnect`;
  const res = cSync(s);
  /// parse
  return res === `disconnected everything`;
}

export function adbKillServer(): void {
  const s = `adb kill-server`;
  cSync(s);
}

export function adbStartServer(): void {
  console.debug(`adb start-server`);
  const s = `adb start-server`;
  cSync(s);
}
