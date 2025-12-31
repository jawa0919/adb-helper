/*
 * @FilePath     : /src/core/utils/processes.ts
 * @Date         : 2022-05-13 17:48:43
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : processes
 */

import * as execa from "execa";
import { logPrint } from "./util";
import { adbBinPath, flutterBinPath, scrcpyBinPath } from "../app/AppConfig";
import { delimiter } from "node:path";

export function safeSpawn(binPath: string, args: string[], cwd?: string, env?: { [key: string]: string | undefined }): execa.ExecaChildProcess<string> {
  const customEnv = Object.assign({}, process.env, env);
  logPrint(`🚀 ${binPath} ${args.join(" ")}`);
  const proc = execa(`${binPath}`, args, { env: customEnv, shell: true });
  return proc;
}

export async function simpleSafeSpawn(binPath: string, args: string[], cwd?: string): Promise<execa.ExecaReturnValue<string>> {
  const customPaths = [adbBinPath, flutterBinPath, scrcpyBinPath];
  const newPath = [...customPaths, process.env.PATH].join(delimiter);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const proc = execa(`${binPath}`, args, { env: { ...process.env, "PATH": newPath }, shell: true });
  return proc;
}
