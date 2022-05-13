/*
 * @FilePath     : /src/core/cmd/connect.ts
 * @Date         : 2022-05-13 17:56:52
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : connect
 */

import { adbBinPath } from "../app/AppConfig";
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

export async function tcpIp(port: string): Promise<boolean> {
  let cmd = ["tcpip", `${port}`];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  if (procRes.stdout.includes("restarting")) {
    return true;
  }
  showErrorMessage(procRes.stderr || procRes.stdout);
  return false;
}
