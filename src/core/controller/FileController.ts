/*
 * @FilePath     : /src/core/controller/FileController.ts
 * @Date         : 2022-05-14 20:13:09
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : FileController
 */

import { basename, join } from "node:path";
import { commands, Disposable, env, ExtensionContext, TreeItem, TreeItemCollapsibleState, TreeView, ViewColumn } from "vscode";
import { createMirrorUri } from "../app/AppFileSystemProvider";
import { mkdir, mv, rm } from "../cmd/fs";
import { openExplorerWindows, pull, push } from "../cmd/io";
import { stat } from "../cmd/ls";
import { adbJoin, chooseFile, chooseFolder, logPrint, showInformationMessage, showInputBox, showModal, showProgress, waitMoment } from "../utils/util";
import { ExplorerTree } from "../view/ExplorerTree";

export class FileController implements Disposable {
  constructor(public context: ExtensionContext, public treeView: TreeView<TreeItem>) {
    /// commands
    commands.registerCommand("adb-helper.openFile", (res) => this.openFile(res), this);
    commands.registerCommand("adb-helper.openInTheSide", (res) => this.openInTheSide(res), this);
    commands.registerCommand("adb-helper.openInLocalExplorer", (res) => this.openInLocalExplorer(res), this);
    commands.registerCommand("adb-helper.newFolder", (res) => this.newFolder(res), this);
    commands.registerCommand("adb-helper.copyPath", (res) => this.copyPath(res), this);
    commands.registerCommand("adb-helper.rename", (res) => this.rename(res), this);
    commands.registerCommand("adb-helper.delete", (res) => this.delete(res), this);
    commands.registerCommand("adb-helper.uploadFile", (res) => this.uploadFile(res), this);
    commands.registerCommand("adb-helper.uploadFolder", (res) => this.uploadFolder(res), this);
    commands.registerCommand("adb-helper.saveAs", (res) => this.saveAs(res), this);
  }
  async saveAs(res: TreeItem) {
    const devId: string = res.resourceUri?.authority || "";
    const path: string = res.resourceUri?.path || "";
    const uriList = await chooseFolder(false);
    const localPath = uriList?.map((r) => r.fsPath).shift() || "";
    if (localPath === "") return;
    showProgress("SaveAs running!", async () => {
      await waitMoment();
      let success = await pull(devId, path, localPath);
      if (success)
        showInformationMessage(`SaveAs Success \n\n ${localPath}`, ...["Open Explorer"]).then((r) => {
          if (r === "Open Explorer") openExplorerWindows(localPath);
        });
      return;
    });
  }
  async uploadFolder(res: TreeItem) {
    const devId: string = res.resourceUri?.authority || "";
    const path: string = res.resourceUri?.path || "";
    const uriList = await chooseFolder(false);
    const localPath = uriList?.map((r) => r.fsPath).shift() || "";
    if (localPath === "") return;
    showProgress("Upload File running!", async () => {
      await waitMoment();
      let success = await push(devId, localPath, path);
      if (success) {
        commands.executeCommand("adb-helper.refreshExplorerManager");
      }
      return;
    });
  }
  async uploadFile(res: TreeItem) {
    const devId: string = res.resourceUri?.authority || "";
    const path: string = res.resourceUri?.path || "";
    const uriList = await chooseFile(true);
    const localPaths = uriList?.map((r) => r.fsPath) || [];
    if (localPaths.length === 0) return;
    showProgress("Upload File running!", async () => {
      await waitMoment();
      let success = await Promise.all(localPaths.map((p) => push(devId, p, adbJoin(path, basename(p)))));
      if (success.reduce((p, v) => p && v, true)) {
        commands.executeCommand("adb-helper.refreshExplorerManager");
      }
      return;
    });
  }
  async delete(res: TreeItem) {
    const devId: string = res.resourceUri?.authority || "";
    const path: string = res.resourceUri?.path || "";
    if ((await showModal("Do you want delete this?", path, ...["YES", "NO"])) === "YES") {
      await waitMoment();
      let success = await rm(devId, path);
      commands.executeCommand("adb-helper.refreshExplorerManager");
    }
  }
  async rename(res: TreeItem) {
    const devId: string = res.resourceUri?.authority || "";
    const path: string = res.resourceUri?.path || "";
    const newName = (await showInputBox("Rename", "New name", path.split("/").pop())) || "";
    if (newName.length === 0) return;
    await mv(devId, path, adbJoin(path, "..", newName));
    commands.executeCommand("adb-helper.refreshExplorerManager");
  }
  async copyPath(res: TreeItem) {
    logPrint(res);
    const path: string = res.resourceUri?.path || "";
    env.clipboard.writeText(`${path}`);
  }
  async newFolder(res: TreeItem) {
    logPrint(res);
    const devId: string = res.resourceUri?.authority || "";
    const path: string = res.resourceUri?.path || "";
    const newName = (await showInputBox("New Folder", "Input Folder Name")) || "";
    if (newName.length === 0) return;
    let remotePath = adbJoin(path, newName);
    if (res.contextValue === "AdbFile") remotePath = adbJoin(path, "..", newName);
    await mkdir(devId, remotePath);
    await this.treeView.reveal(res, { expand: true });
  }
  async openInLocalExplorer(res: TreeItem) {
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
      openExplorerWindows(join(mirrorUri.fsPath, ".."));
    }
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
