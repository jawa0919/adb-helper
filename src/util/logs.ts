/*
 * @FilePath     : /src/util/logs.ts
 * @Date         : 2021-10-23 11:02:23
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : 日志打印
 */

import { window } from "vscode";

const logOutput = window.createOutputChannel("ADB Helper");

export function logPrint(obj: any): void {
  logOutput.appendLine(`${obj}`);
}
