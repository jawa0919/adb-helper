/*
 * @FilePath     : /adb-helper/src/tree/explorerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : explorerTree
 */

import { commands, Event, EventEmitter, ExtensionContext, FileType, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window } from "vscode";
import { ls } from "../command/ls";
import { IDevice, IFileStat } from "../type";

export class ExplorerTree {
  provider: ExplorerProvider;

  constructor(context: ExtensionContext, device: IDevice) {
    console.debug("ExplorerTree constructor");
    const provider = new ExplorerProvider(device);
    context.subscriptions.push(window.createTreeView("adb-helper.Explorer", { treeDataProvider: provider }));
    this.provider = provider;

    commands.registerCommand("adb-helper.Explorer.Refresh", () => {
      console.log("Explorer.Refresh");
      provider.refresh();
    });

    commands.registerCommand("adb-helper.Explorer.NewDirectory", async (r) => {
      console.log("Explorer.NewDirectory");
    });
    commands.registerCommand("adb-helper.Explorer.SaveAs", async (r) => {
      console.log("Explorer.SaveAs");
    });
    commands.registerCommand("adb-helper.Explorer.UploadFile", async (r) => {
      console.log("Explorer.UploadFile");
    });
    commands.registerCommand("adb-helper.Explorer.UploadDirectory", async (r) => {
      console.log("Explorer.UploadDirectory");
    });
    commands.registerCommand("adb-helper.Explorer.Delete", async (r) => {
      console.log("Explorer.Delete");
    });
    commands.registerCommand("adb-helper.Explorer.CopyPath", async (r) => {
      console.log("Explorer.CopyPath");
    });
  }

  refreshTree(root: string) {
    this.provider.root = root;
    this.provider.refresh();
  }
}

export class ExplorerProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }
  constructor(readonly device: IDevice, public root = "") {}

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    if (this.root === "") {
      return Promise.resolve([new TreeItem("Explorer Loading...")]);
    }
    return new Promise<TreeItem[]>(async (resolve) => {
      const path = element?.resourceUri?.path ?? this.root;
      const fileList = await ls(this.device.id, path).catch((err) => {
        resolve([new TreeItem(err)]);
        return [] as IFileStat[];
      });

      const directoryType = [FileType.Directory, FileType.SymbolicLink];
      let treeItemList = fileList.map((r) => {
        let isDirectory = directoryType.includes(r.type);
        let item = new TreeItem(r.uri, isDirectory ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);
        item.contextValue = isDirectory ? "directory" : "file";
        return item;
      });
      resolve(treeItemList);
    });
  }
}
