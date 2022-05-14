/*
 * @FilePath     : /src/core/controller/ExplorerController.ts
 * @Date         : 2022-05-14 20:06:12
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : ExplorerController
 */

import { commands, Disposable, ExtensionContext, QuickPickItem, window } from "vscode";
import { explorerRootPathList } from "../app/AppConfig";
import { showProgress, showQuickPickItem } from "../utils/util";
import { ExplorerTree } from "../view/ExplorerTree";
import { AdbController } from "./AdbController";
import { FileController } from "./FileController";

export class ExplorerController implements Disposable {
  fileController: FileController;
  tree: ExplorerTree;
  constructor(public context: ExtensionContext) {
    this.fileController = new FileController(context);
    this.tree = new ExplorerTree(explorerRootPathList[0]);
    window.registerTreeDataProvider("adb-helper.ExplorerManager", this.tree);
    /// commands
    commands.registerCommand("adb-helper.refreshExplorerManager", () => this.refreshExplorerManager());
    commands.registerCommand("adb-helper.chooseDevice", () => this.chooseDevice());
    commands.registerCommand("adb-helper.chooseRootPath", () => this.chooseRootPath());
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
