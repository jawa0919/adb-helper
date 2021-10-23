/*
 * @FilePath     : /adb-helper/src/explorer/explorerProvider.ts
 * @Date         : 2021-10-23 11:19:54
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : 文件管理器的提供者
 */

import { Event, EventEmitter, FileType, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from "vscode";
import { ls } from "../api/ls";
import { IDevice, IFileStat } from "../type";

export class ExplorerProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }
  constructor(public device: IDevice, public root = "") {}

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
        resolve([new TreeItem(`${err}`)]);
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
