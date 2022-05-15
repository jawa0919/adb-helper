/*
 * @FilePath     : /src/core/controller/ExplorerController.ts
 * @Date         : 2022-05-14 20:06:12
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : ExplorerController
 */

import { commands, Disposable, ExtensionContext, QuickPickItem, Uri, window, workspace } from "vscode";
import { explorerRootPathList } from "../app/AppConfig";
import { AppConst } from "../app/AppConst";
import { logPrint, showQuickPickItem } from "../utils/util";
import { ExplorerTree } from "../view/ExplorerTree";
import { AdbController } from "./AdbController";
import { FileController } from "./FileController";

export class ExplorerController implements Disposable {
  fileController: FileController;
  tree: ExplorerTree;
  constructor(public context: ExtensionContext) {
    this.fileController = new FileController(context);
    this.tree = new ExplorerTree(explorerRootPathList[0]);
    window.createTreeView("adb-helper.ExplorerManager", { treeDataProvider: this.tree });
    /// commands
    commands.registerCommand("adb-helper.refreshExplorerManager", () => this.refreshExplorerManager());
    commands.registerCommand("adb-helper.chooseDevice", () => this.chooseDevice());
    commands.registerCommand("adb-helper.chooseRootPath", () => this.chooseRootPath());
    commands.registerCommand("adb-helper.openInNewWorkspace", () => this.openInNewWorkspace());
  }
  // FIXME 2022-05-14 21:53:17 FileSystemProvider
  async openInNewWorkspace() {
    const device = this.tree.device;
    if (device === undefined) return;
    let rootUri = Uri.from({ scheme: AppConst.scheme });
    // // let rootUri = Uri.from({ scheme: AppConst.scheme, path: device.devId });
    logPrint(rootUri);
    // AppFileSystemProvider.init(this.context, AppConst.scheme, AppConst.mirrorPath);
    // workspace.updateWorkspaceFolders(workspace.workspaceFolders ? workspace.workspaceFolders.length : 0, null, { uri: rootUri, name: device.devId });
    // commands.executeCommand("vscode.openFolder", rootUri, { forceNewWindow: true });
    // const device: IDevice = JSON.parse(res.tooltip?.toString() || "");
    // let rootUri = Uri.from({ scheme: AppConst.scheme, authority: device.devId, path: "/" });
    // // let rootUri = Uri.from({ scheme: AppConst.scheme, path: device.devId });
    // logPrint(rootUri);
    // workspace.updateWorkspaceFolders(0, 0, { uri: rootUri, name: device.devId });
    // // commands.executeCommand("vscode.openFolder", rootUri, { forceNewWindow: true });
    // const devId = this.explorerCtrl.tree.device?.devId || "";
    // const rootPath = this.explorerCtrl.tree.rootPath || "";
    // const win = await showModal("Open Storage", `Open Storage Use newFile/cut/copy/paste.\nWhere would you like to open the storage`, ...["This Window", "New Window"]);
    // const uri = createUri(devId, rootPath);
    // console.log(uri);
    // // TODO 2022-05-07 00:00:52 must impl FileSystemProvider
    // // if (win === "This Window") {
    // //   workspace.updateWorkspaceFolders(0, 0, { uri, name: "Android Device Files" });
    // // } else if (win === "New Window") {
    // //   commands.executeCommand("vscode.openFolder", uri);
    // // }
  }
  async chooseRootPath() {
    const description = this.tree.device?.model;
    const items = explorerRootPathList.map<QuickPickItem>((p) => {
      return { label: `$(file-directory) ${p}`, description, detail: p };
    });
    let item = await showQuickPickItem(items);
    if (item?.detail) {
      this.tree.rootPath = item.detail;
      this.tree.eventEmitter.fire(undefined);
    }
  }
  async chooseDevice() {
    const items = AdbController.deviceList.map((d) => {
      const label = d.netWorkIp ? "$(broadcast) " : "$(plug) ";
      return { ...d, label: label + d.model, description: d.devId };
    });
    let item = await showQuickPickItem(items);
    if (item) {
      this.tree.device = item;
      this.tree.eventEmitter.fire(undefined);
    }
  }
  refreshExplorerManager() {
    this.tree.eventEmitter.fire(undefined);
  }
  dispose() {}
}
