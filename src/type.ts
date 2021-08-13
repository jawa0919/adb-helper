/*
 * @FilePath     : /adb-helper/src/type.ts
 * @Date         : 2021-08-12 18:25:54
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : type
 */

import { FileStat, Uri } from "vscode";

export type IDevice = {
  id: string;
  type: string;
  product: string;
  model: string;
  device: string;
  transportId: number;
  ip?: string;
  port?: number;
};

export interface IFileStat extends FileStat {
  name: string;
  link: string;
  uri: Uri;
}

export interface IApk {
  name: string;
  path: string;
}
