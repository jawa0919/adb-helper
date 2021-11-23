/*
 * @FilePath     : /src/command/base.ts
 * @Date         : 2021-11-21 12:21:06
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : base
 */

import { IDevice } from "../type";
import { logPrint } from "../util/logs";
import { ww } from "../util/util";

export function adbVersion(): string {
  try {
    const res = ww("adb", ["version"]);
    return res.stdout;
  } catch (error) {
    logPrint(`adbVersion.catch\n${error}`);
    return "";
  }
}

export function flutterVersion(): string {
  try {
    const res = ww("flutter", ["--version"]);
    return res.stdout;
  } catch (error) {
    logPrint(`flutterVersion.catch\n${error}`);
    return "";
  }
}

export function adbDevices(): IDevice[] {
  try {
    const res = ww("adb", ["devices", "-l"]);
    let lines = res.stdout.trim().split(/\n|\r\n/);
    lines = lines.map((r) => r.trim()).filter((r) => r !== "");
    return _adbDevicesParse(lines);
  } catch (error) {
    logPrint(`adbDevices.catch\n${error}`);
    return [];
  }
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

export function adbDisconnectAll(): boolean {
  try {
    const res = ww("adb", ["disconnect"]);
    return res.stdout === `disconnected everything`;
  } catch (error) {
    logPrint(`disconnectAll.catch\n${error}`);
    return false;
  }
}

export function adbKillServer(): void {
  try {
    ww("adb", ["kill-server"]);
  } catch (error) {
    logPrint(`adbKillServer.catch\n${error}`);
  }
}

export function adbStartServer(): void {
  try {
    ww("adb", ["start-server"]);
  } catch (error) {
    logPrint(`adbStartServer.catch\n${error}`);
  }
}