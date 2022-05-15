/*
 * @FilePath     : /src/core/controller/FileController.ts
 * @Date         : 2022-05-14 20:13:09
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : FileController
 */

import { commands, Disposable, ExtensionContext, TreeItem, ViewColumn } from "vscode";
import { createMirrorUri } from "../app/AppFileSystemProvider";
import { pull } from "../cmd/io";
import { stat } from "../cmd/ls";
import { showInformationMessage, waitMoment } from "../utils/util";

export class FileController implements Disposable {
  constructor(public context: ExtensionContext) {
    /// commands
    commands.registerCommand("adb-helper.openFile", (res) => this.openFile(res), this);
    commands.registerCommand("adb-helper.openInTheSide", (res) => this.openInTheSide(res), this);
  }
  async openInTheSide(res: TreeItem) {
    const devId: string = res.resourceUri?.authority || "";
    const path: string = res.resourceUri?.path || "";
    const st = await stat(devId, path);
    if (st.size > 10 * 1024 * 1024) {
      showInformationMessage("Big File Please Use `Save as..`");
      return;
    }
    await waitMoment();
    const mirrorUri = createMirrorUri(res.resourceUri!);
    let successPull = await pull(devId, path, mirrorUri?.fsPath!);
    if (successPull) {
      commands.executeCommand("vscode.open", mirrorUri, ViewColumn.Beside);
    }
  }
  async openFile(res: TreeItem) {
    const devId: string = res.resourceUri?.authority || "";
    const path: string = res.resourceUri?.path || "";
    const st = await stat(devId, path);
    if (st.size > 10 * 1024 * 1024) {
      showInformationMessage("Big File Please Use `Save as..`");
      return;
    }
    await waitMoment();
    const mirrorUri = createMirrorUri(res.resourceUri!);
    let successPull = await pull(devId, path, mirrorUri?.fsPath!);
    if (successPull) {
      commands.executeCommand("vscode.open", mirrorUri);
    }
  }
  dispose() {}
}
