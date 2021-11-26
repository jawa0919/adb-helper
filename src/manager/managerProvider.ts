/*
 * @FilePath     : /src/manager/managerProvider.ts
 * @Date         : 2021-10-23 11:22:09
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : managerProvider
 */

import { Event, EventEmitter, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem } from "vscode";
import { IApk, IDevice } from "../type";

export class ManagerProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;
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

  constructor(public device?: IDevice, public apkList: IApk[] = []) {}

  public refresh(args?: any): void {
    console.log("ManagerProvider.refresh", this.device, this.apkList);
    this._onDidChangeTreeData.fire(undefined);
  }

  _bindCurrentDevice(device: IDevice): TreeItem {
    const label = device.ip ? "📶 " : "📱 ";
    let item = new TreeItem(label + device.model);
    item.id = device.id;
    item.iconPath = new ThemeIcon("chevron-down");
    item.description = device.id;
    item.tooltip = JSON.stringify(this.device);
    item.command = { command: "adb-helper.Device.Swap", title: "Swap Current Device" };
    item.contextValue = "currentDevice";
    return item;
  }

  _bindApkItem3(device: IDevice): TreeItem[] {
    let treeItemList = this.apkList.map((r) => {
      let item = new TreeItem(r.name);
      item.id = r.name;
      item.iconPath = new ThemeIcon("symbol-constructor");
      item.tooltip = r.path;
      item.contextValue = "apk";
      return item;
    });
    return treeItemList;
  }
}
