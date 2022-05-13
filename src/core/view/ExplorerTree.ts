/*
 * @FilePath     : /src/core/view/ExplorerTree.ts
 * @Date         : 2022-05-13 19:58:40
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : 资源管理器
 */
import { Event, EventEmitter, TreeDataProvider, TreeItem } from "vscode";

export class DeviceTree implements TreeDataProvider<TreeItem> {
  constructor() {}
  eventEmitter: EventEmitter<TreeItem | TreeItem[] | undefined | void> = new EventEmitter<TreeItem | TreeItem[] | undefined | void>();
  onDidChangeTreeData?: Event<void | TreeItem | TreeItem[] | null | undefined> | undefined = this.eventEmitter.event;
  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    return [];
  }
}
