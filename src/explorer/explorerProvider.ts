/*
 * @FilePath     : /src/explorer/explorerProvider.ts
 * @Date         : 2021-11-20 23:08:10
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : explorerProvider
 */

import { Event, EventEmitter, FileType, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from "vscode";
import { ls } from "../command/ls";
import { IDevice, IFileStat } from "../type";

export class ExplorerProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }
  constructor(public device?: IDevice, public root = "/sdcard/") {}

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    const deviceId = this.device?.id ?? "";

    if (deviceId === "") {
      return Promise.resolve([new TreeItem("Please choose a device")]);
    }

    if (this.root === "") {
      return Promise.resolve([new TreeItem("Explorer Loading...")]);
    }

    return new Promise<TreeItem[]>(async (resolve) => {
      const path = element?.resourceUri?.path ?? this.root;
      const fileList = ls(deviceId, path);

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
