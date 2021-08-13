/*
 * @FilePath     : /adb-helper/src/tree/explorerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : explorerTree
 */

import {
  Event,
  EventEmitter,
  ExtensionContext,
  FileType,
  ProviderResult,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  window,
} from "vscode";
import { ls } from "../command/ls";
import { IDevice, IFileStat } from "../type";

export class ExplorerTree {
  constructor(context: ExtensionContext, provider: ExplorerProvider) {
    context.subscriptions.push(
      window.createTreeView("adb-helper.Explorer", {
        treeDataProvider: provider,
      })
    );
  }
}

export class ExplorerProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }
  constructor(readonly device: IDevice, readonly root: string) {}

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    return new Promise<TreeItem[]>(async (resolve) => {
      const path = element?.resourceUri?.path ?? this.root;
      const fileList = await ls(this.device.id, path).catch((err) => {
        resolve([new TreeItem(err)]);
        return [] as IFileStat[];
      });
      let treeItemList = fileList.map((r) => {
        let item = new TreeItem(
          r.uri,
          r.type === FileType.Directory
            ? TreeItemCollapsibleState.Collapsed
            : r.type === FileType.SymbolicLink
            ? TreeItemCollapsibleState.Collapsed
            : TreeItemCollapsibleState.None
        );
        item.contextValue =
          r.type === FileType.Directory
            ? "directory"
            : r.type === FileType.SymbolicLink
            ? "directory"
            : "file";
        return item;
      });
      resolve(treeItemList);
    });
  }
}
