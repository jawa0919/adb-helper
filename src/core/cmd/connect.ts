/*
 * @FilePath     : /src/core/cmd/connect.ts
 * @Date         : 2022-05-13 17:56:52
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : connect
 */

import { adbBinPath, scrcpyBinPath } from "../app/AppConfig";
import { simpleSafeSpawn } from "../utils/processes";
import { showErrorMessage } from "../utils/util";

export async function killServer(): Promise<void> {
  let cmd = ["kill-server"];
  const proc = await simpleSafeSpawn("adb", cmd);
}

export async function startServer(): Promise<void> {
  let cmd = ["start-server"];
  const proc = await simpleSafeSpawn("adb", cmd);
}

export async function connect(ip: string, port: string): Promise<boolean> {
  let cmd = ["connect", `${ip}:${port}`];
  const procRes = await simpleSafeSpawn("adb", cmd);
  if (procRes.stdout.includes("connected to")) {
    return true;
  }
  showErrorMessage(procRes.stderr || procRes.stdout);
  return false;
}

export async function tcpIp(devId: string, port: string): Promise<boolean> {
  let cmd = ["-s", devId, "tcpip", `${port}`];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  if (procRes.stdout.includes("restarting")) {
    return true;
  }
  showErrorMessage(procRes.stderr || procRes.stdout);
  return false;
}

export async function reboot(devId: string): Promise<void> {
  let cmd = ["-s", devId, "reboot"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
}

export async function powerOff(devId: string): Promise<void> {
  let cmd = ["-s", devId, "shell", "reboot", "-p"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
}

export async function scrcpy(devId: string, ...args: string[]): Promise<void> {
  let cmd = ["-s", devId, ...args];
  const procRes = await simpleSafeSpawn("scrcpy", cmd, scrcpyBinPath);
}
