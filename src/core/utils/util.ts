/*
 * @FilePath     : /src/core/utils/util.ts
 * @Date         : 2022-05-13 17:57:31
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : util
 */

import { join } from "node:path";
import { CancellationToken, Progress, ProgressLocation, QuickPickItem, window } from "vscode";

const logOutput = window.createOutputChannel("ADB Helper");

export function logPrint(...optionalParams: any[]): void {
  console.log(...optionalParams);
  optionalParams.forEach((param) => {
    if (typeof param === "object") {
      logOutput.appendLine(JSON.stringify(param));
    } else {
      logOutput.appendLine(`${param}`);
    }
  });
}

export async function showInputBox(title?: string, placeHolder?: string, value?: string): Promise<string | undefined> {
  return await window.showInputBox({ title, placeHolder, value });
}

export async function showQuickPick(fileList: string[]): Promise<string | undefined> {
  return await window.showQuickPick(fileList);
}

export async function showQuickPickItem<T extends QuickPickItem>(fileList: T[]): Promise<T | undefined> {
  return await window.showQuickPick<T>(fileList);
}

export async function showInformationMessage(message: string, detail?: string, ...items: string[]): Promise<string | undefined> {
  return await window.showInformationMessage(message, { detail }, ...items);
}

export async function showWarningMessage(message: string, detail?: string, ...items: string[]): Promise<string | undefined> {
  return await window.showWarningMessage(message, { detail }, ...items);
}

export async function showErrorMessage(message: string, detail?: string, ...items: string[]): Promise<string | undefined> {
  return await window.showErrorMessage(message, { detail }, ...items);
}

export function dateTimeName(): string {
  return new Date().toISOString().substring(0, 19).replace(/[-:T]/g, "");
}

export function showProgress<R>(title: string, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Thenable<R>): Thenable<R> {
  return window.withProgress<R>({ location: ProgressLocation.Notification, title, cancellable: false }, task);
}

export async function showModal(title: string, detail: string, ...items: string[]): Promise<string | undefined> {
  return await window.showWarningMessage(title, { modal: true, detail }, ...items);
}

export async function waitMoment(ms = 300): Promise<void> {
  return new Promise<void>((resolve) => {
    let timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve();
    }, ms);
  });
}

// FIXME 2022-05-05 23:58:28 replace to linux system file separator
export function adbJoin(...paths: string[]): string {
  return join(...paths).replace(/\\/g, "/");
}
