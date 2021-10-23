/*
 * @FilePath     : /adb-helper/src/manager/managerProvider.ts
 * @Date         : 2021-10-23 11:22:09
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : App管理树的提供者
 */

import { Event, EventEmitter, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem } from "vscode";
import { list } from "../api/pm";
import { IApk, IDevice } from "../type";

export class ManagerProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  constructor(public device?: IDevice, public args = "") {}

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    const deviceId = this.device?.id ?? "";

    if (deviceId === "") {
      return Promise.resolve([new TreeItem("Please choose a device")]);
    }
    if (this.args === "") {
      return Promise.resolve([new TreeItem("Explorer Loading...")]);
    }
    return new Promise<TreeItem[]>(async (resolve) => {
      const fileList = await list(deviceId, this.args).catch((err) => {
        resolve([new TreeItem(`${err}`)]);
        return [] as IApk[];
      });
      let treeItemList = fileList.map((r) => {
        let item = new TreeItem(r.name);
        item.iconPath = new ThemeIcon("symbol-constructor");
        item.id = r.name;
        item.tooltip = r.path;
        return item;
      });
      resolve(treeItemList);
    });
  }
}
