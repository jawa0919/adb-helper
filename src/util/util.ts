/*
 * @FilePath     : /src/util/util.ts
 * @Date         : 2021-08-12 18:10:55
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : util
 */

import { Uri } from "vscode";
import { logPrint } from "./logs";
import * as child_process from "child_process";

import execa = require("execa");

export function ww(bin: string, args: string[], env?: { [key: string]: string | undefined }): execa.ExecaSyncReturnValue {
  logPrint(`\nexeca.sync ${bin} with args ${JSON.stringify(args)}`);
  const quotedArgs = args.map((a) => `${a.replace(/"/g, `\\"`)}`);
  const customEnv = Object.assign({}, process.env, env);
  const res = execa.sync(bin, quotedArgs, { env: customEnv, shell: true });
  logPrint(`execa.sync stdout\n${res.stdout}`);
  return res;
}

export function www(bin: string, args: string[], env?: { [key: string]: string | undefined }): execa.ExecaChildProcess {
  logPrint(`\nexeca.execa ${bin} with args ${JSON.stringify(args)}`);
  const quotedArgs = args.map((a) => `${a.replace(/"/g, `\\"`)}`);
  const customEnv = Object.assign({}, process.env, env);
  const pro = execa(bin, quotedArgs, { env: customEnv, shell: true });
  pro.stdout?.on("data", (data: string) => {
    pro.cancel();
    logPrint("execa.execa stdout\n" + data);
  });
  pro.stderr?.on("data", (data: string) => {
    pro.cancel();
    logPrint("execa.execa stderr\n" + data);
  });
  return pro;
}

export async function waitMoment(ms = 300): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function createUri(authority: string, path: string): Uri {
  const scheme = "adbEx";
  const uri = Uri.from({
    scheme: scheme,
    authority: authority,
    path: path,
  });
  return uri;
}

export function cSync(bin: string, args: string[]): string {
  try {
    const buf = _safeExecFileSync(bin, args, {});
    const res = Buffer.from(buf).toString().trim();
    logPrint("cSync.res " + res);
    return res;
  } catch (error) {
    const res = Buffer.from(error as Buffer).toString();
    logPrint(`cSync.catch ${JSON.stringify(res)}`);
    return "";
  }
}

export function c(bin: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const pro = _safeExecFile(bin, args, {});
    pro.stdout?.on("data", (data: Buffer | string) => {
      const res = Buffer.from(data).toString().trim();
      logPrint("stdout data " + res);
      resolve(res);
    });
    pro.stderr?.on("data", (data: Buffer | string) => {
      const res = Buffer.from(data).toString().trim();
      logPrint("stderr data " + res);
      reject(res);
    });
    pro.on("exit", (code, signal) => {
      logPrint("exit");
    });
    pro.on("error", (error) => {
      logPrint("error");
    });
  });
}

function _safeExecFileSync(bin: string, args: string[], env: { [key: string]: string | undefined } | undefined): Buffer {
  logPrint(`ExecFileSync ${bin} with args ${JSON.stringify(args)}`);
  const quotedArgs = args.map((a) => `"${a.replace(/"/g, `\\"`)}"`);
  const customEnv = Object.assign({}, process.env, env);
  return child_process.execFileSync(`"${bin}"`, quotedArgs, { env: customEnv, shell: true });
}

function _safeExecFile(bin: string, args: string[], env: { [key: string]: string | undefined } | undefined): child_process.ChildProcess {
  logPrint(`ExecFile ${bin} with args ${JSON.stringify(args)}`);
  const quotedArgs = args.map((a) => `"${a.replace(/"/g, `\\"`)}"`);
  const customEnv = Object.assign({}, process.env, env);
  return child_process.execFile(`"${bin}"`, quotedArgs, { env: customEnv, shell: true });
}

function _safeSpawnSync(bin: string, args: string[], env: { [key: string]: string | undefined } | undefined): child_process.SpawnSyncReturns<Buffer> {
  logPrint(`Spawn ${bin} with args ${JSON.stringify(args)}`);
  const quotedArgs = args.map((a) => `"${a.replace(/"/g, `\\"`)}"`);
  const customEnv = Object.assign({}, process.env, env);
  return child_process.spawnSync(`"${bin}"`, quotedArgs, { env: customEnv, shell: true });
}

function _safeSpawn(bin: string, args: string[], env: { [key: string]: string | undefined } | undefined): child_process.ChildProcessWithoutNullStreams {
  logPrint(`Spawn ${bin} with args ${JSON.stringify(args)}`);
  const quotedArgs = args.map((a) => `"${a.replace(/"/g, `\\"`)}"`);
  const customEnv = Object.assign({}, process.env, env);
  return child_process.spawn(`"${bin}"`, quotedArgs, { env: customEnv, shell: true });
}
