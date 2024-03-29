/*
 * @FilePath     : /src/core/utils/processes.ts
 * @Date         : 2022-05-13 17:48:43
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : processes
 */

import * as execa from "execa";
import { logPrint } from "./util";

export function safeSpawn(binPath: string, args: string[], cwd?: string, env?: { [key: string]: string | undefined }): execa.ExecaChildProcess<string> {
  const customEnv = Object.assign({}, process.env, env);
  logPrint(`🚀 ${binPath} ${args.join(" ")}`);
  const proc = execa(`${binPath}`, args, { cwd: cwd, env: customEnv, shell: true });
  return proc;
}

export async function simpleSafeSpawn(binPath: string, args: string[], cwd?: string, env?: { [key: string]: string | undefined }): Promise<execa.ExecaReturnValue<string>> {
  const procRes = await safeSpawn(binPath, args, cwd, env).catch((e) => e);
  console.log(procRes);
  return procRes;
}
