/*
 * @FilePath     : /src/core/utils/processes.ts
 * @Date         : 2022-05-13 17:48:43
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : processes
 */

import execa, { ExecaChildProcess, ExecaReturnValue } from "execa";
import { logPrint } from "./util";

function quoteAndEscapeArg(arg: string): string {
  let escaped = arg.replace(/"/g, `\\"`);
  if (process.platform.startsWith("win")) escaped = escaped.replace(/([<>])/g, "^$1");
  return `"${escaped}"`;
}

export function safeSpawn(binPath: string, args: string[], cwd?: string, env?: { [key: string]: string | undefined }): ExecaChildProcess<string> {
  const quotedArgs = args.map(quoteAndEscapeArg);
  const customEnv = Object.assign({}, process.env, env);
  logPrint(`🚀 ${binPath} ${quotedArgs.join(" ")}`);
  const proc = execa(`"${binPath}"`, quotedArgs, { cwd: cwd, env: customEnv, shell: true });
  return proc;
}

export async function simpleSafeSpawn(binPath: string, args: string[], cwd?: string, env?: { [key: string]: string | undefined }): Promise<ExecaReturnValue<string>> {
  const procRes = await safeSpawn(binPath, args, cwd, env);
  logPrint(procRes);
  return procRes;
}
