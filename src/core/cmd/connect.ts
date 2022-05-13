/*
 * @FilePath     : /src/core/cmd/connect.ts
 * @Date         : 2022-05-13 17:56:52
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : connect
 */

import { simpleSafeSpawn } from "../utils/processes";

export async function killServer(): Promise<void> {
  let cmd = ["kill-server"];
  const proc = await simpleSafeSpawn("adb", cmd);
}

export async function startServer(): Promise<void> {
  let cmd = ["start-server"];
  const proc = await simpleSafeSpawn("adb", cmd);
}
