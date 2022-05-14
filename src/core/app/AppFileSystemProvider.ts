/*
 * @FilePath     : /src/core/app/AppFileSystemProvider.ts
 * @Date         : 2022-05-14 21:39:51
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : AppFileSystemProvider
 */

import { Disposable, Event, EventEmitter, ExtensionContext, FileChangeEvent, FileStat, FileSystemError, FileSystemProvider, FileType, Uri, workspace } from "vscode";
import { ls, stat as adbStat } from "../cmd/ls";
import { ensureDirSync, readFile } from "fs-extra";
import { join, sep } from "node:path";
import { pull } from "../cmd/io";
import { logPrint } from "../utils/util";

export class AppFileSystemProvider implements FileSystemProvider {
  static init(context: ExtensionContext, scheme: string, mirrorPath: string) {
    logPrint("AppFileSystemProvider.init");
    const appFileSystemProvider = new AppFileSystemProvider(scheme, mirrorPath);
    workspace.registerFileSystemProvider(scheme, appFileSystemProvider, { isCaseSensitive: true, isReadonly: true });
  }

  fileUri2RemoteUri(fileUri: Uri): Uri {
    return fileUri;
  }

  createMirrorUri(mirrorPath: string, resourceUri: Uri): Uri {
    const mirrorUri = Uri.joinPath(Uri.file(mirrorPath), resourceUri.authority, resourceUri.path);
    if (mirrorUri.fsPath.endsWith(sep)) ensureDirSync(mirrorUri.fsPath);
    else ensureDirSync(join(mirrorUri.fsPath, ".."));
    return mirrorUri;
  }

  eventEmitter = new EventEmitter<FileChangeEvent[]>();
  onDidChangeFile: Event<FileChangeEvent[]> = this.eventEmitter.event;

  constructor(public scheme: string, public mirrorPath: string) {
    logPrint("constructor", scheme, mirrorPath);
  }

  watch(uri: Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[] }): Disposable {
    // console.log("watch", uri, options);
    return new Disposable(() => {});
  }
  async stat(uri: Uri): Promise<FileStat> {
    console.log("stat", uri);
    if (uri.fsPath.startsWith("/.vscode")) throw new Error("No File");
    const res = await adbStat(uri.fragment, uri.path);
    logPrint("stat-res", res);
    return res;
  }
  async readDirectory(uri: Uri): Promise<[string, FileType][]> {
    console.log("readDirectory", uri);
    if (uri.fsPath.startsWith("/.vscode")) throw new Error("No File");
    const res = await ls(uri.fragment, uri.path + "/");
    logPrint("readDirectory-res", uri, res);
    return res;
    // return [];
  }
  createDirectory(uri: Uri): Promise<void> {
    console.log("createDirectory", uri);
    return new Promise<void>((resolve, reject) => {});
  }
  async readFile(uri: Uri): Promise<Uint8Array> {
    console.log("readFile", uri);
    if (uri.fsPath.startsWith("/.vscode")) throw new Error("No File");
    let mirrorUri = this.createMirrorUri(this.mirrorPath, uri);
    await pull(uri.fragment, uri.path, mirrorUri.fsPath);
    logPrint("readFile-res", uri, mirrorUri);
    return await readFile(mirrorUri.path!);
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
