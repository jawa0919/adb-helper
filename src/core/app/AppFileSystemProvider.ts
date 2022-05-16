/*
 * @FilePath     : /src/core/app/AppFileSystemProvider.ts
 * @Date         : 2022-05-14 21:39:51
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : AppFileSystemProvider
 */

import { Disposable, Event, EventEmitter, FileChangeEvent, FileStat, FileSystemProvider, FileType, Uri } from "vscode";
import { ensureDirSync } from "fs-extra";
import { join, sep } from "node:path";
import { logPrint } from "../utils/util";
import { AppConst } from "./AppConst";

export function createMirrorUri(resourceUri: Uri, mirrorPath = AppConst.mirrorPath): Uri {
  const mirrorUri = Uri.joinPath(Uri.file(mirrorPath), resourceUri.authority.replace(":", "_"), resourceUri.path);
  if (mirrorUri.fsPath.endsWith(sep)) ensureDirSync(mirrorUri.fsPath);
  else ensureDirSync(join(mirrorUri.fsPath, ".."));
  return mirrorUri;
}

class AppFileSystemProvider implements FileSystemProvider {
  eventEmitter = new EventEmitter<FileChangeEvent[]>();
  onDidChangeFile: Event<FileChangeEvent[]> = this.eventEmitter.event;

  constructor(public scheme: string, public mirrorPath: string) {
    logPrint("constructor", scheme, mirrorPath);
  }

  watch(uri: Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[] }): Disposable {
    console.log("watch", uri, options);
    return new Disposable(() => {});
  }
  async stat(uri: Uri): Promise<FileStat> {
    console.log("stat", uri);
    return { type: FileType.Unknown, size: 0, ctime: 0, mtime: 0 };
  }
  async readDirectory(uri: Uri): Promise<[string, FileType][]> {
    console.log("readDirectory", uri);
    return [];
  }
  createDirectory(uri: Uri): Promise<void> {
    console.log("createDirectory", uri);
    return new Promise<void>((resolve, reject) => {});
  }
  async readFile(uri: Uri): Promise<Uint8Array> {
    console.log("readFile", uri);
    return Buffer.from("");
  }
  writeFile(uri: Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean }): Promise<void> {
    console.log("writeFile", uri, content, options);
    return new Promise<void>((resolve, reject) => {});
  }
  delete(uri: Uri, options: { readonly recursive: boolean }): Promise<void> {
    console.log("delete", uri, options);
    return new Promise<void>((resolve, reject) => {});
  }
  rename(oldUri: Uri, newUri: Uri, options: { readonly overwrite: boolean }): Promise<void> {
    console.log("rename", oldUri, newUri, options);
    return new Promise<void>((resolve, reject) => {});
  }
}
