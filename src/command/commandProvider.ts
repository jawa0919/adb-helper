/*
 * @FilePath     : /adb-helper/src/command/commandProvider.ts
 * @Date         : 2021-10-23 11:16:39
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : 命令行历史提供者
 */

import { Event, EventEmitter, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem } from "vscode";

export class CommandProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  constructor(public history: string[] = []) {}

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    if (this.history.length === 0) {
      return Promise.resolve([new TreeItem("No Find Command History")]);
    }

    let treeItemList = this.history.map((val: string) => {
      let item = new TreeItem(val);
      item.iconPath = new ThemeIcon("bookmark");
      return item;
    });

    return Promise.resolve(treeItemList);
  }
}
