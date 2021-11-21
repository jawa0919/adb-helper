/*
 * @FilePath     : /src/manager/managerProvider.ts
 * @Date         : 2021-10-23 11:22:09
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : managerProvider
 */

import { Event, EventEmitter, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem, TreeItemLabel } from "vscode";
import { pmList } from "../command/pm";
import { IApk, IDevice } from "../type";

export class ManagerProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  public refresh(): any {
    this.apkList = pmList(this.device?.id ?? "", "-3");
    this._onDidChangeTreeData.fire(undefined);
  }

  constructor(public device?: IDevice, public apkList: IApk[] = []) {
    this.refresh();
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    if (this.device) {
      let currentDeviceItem = this._bindCurrentDevice(this.device);
      let apkItem = this._bindApkItem3(this.device);
      return [currentDeviceItem, ...apkItem];
    } else {
      return Promise.resolve([new TreeItem("Please choose a device")]);
    }
  }

  _bindCurrentDevice(device: IDevice): TreeItem {
    let item = new TreeItem(device.model);
    item.id = device.id;
    item.iconPath = new ThemeIcon("chevron-down");
    item.description = device.id;
    item.tooltip = JSON.stringify(this.device);
    item.command = {
      command: "adb-helper.Manager.Device.Swap",
      title: "Swap current device",
    };
    item.contextValue = "currentDevice";
    return item;
  }

  _bindApkItem3(device: IDevice): TreeItem[] {
    let treeItemList = this.apkList.map((r) => {
      let item = new TreeItem(r.name);
      item.iconPath = new ThemeIcon("symbol-constructor");
      item.id = r.name;
      item.tooltip = r.path;
      item.contextValue = "apk";
      return item;
    });
    return treeItemList;
  }
}
