/*
 * @FilePath     : /src/core/utils/processes.ts
 * @Date         : 2022-05-13 17:48:43
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : processes
 */

import execa from "execa";
import { logPrint } from "./util";

export async function ex(binPath: string, args: string[], cwd?: string, env?: { [key: string]: string | undefined }) {
  logPrint(`🚀 ${binPath} ${args.join(" ")}`);
  try {
    const proc = await execa(binPath, args, { cwd, env });
    logPrint(proc);
    return proc?.exitCode === 0 ? proc?.stdout : proc?.stderr;
  } catch (error) {
    console.log("error");
    logPrint(error);
  }
}
