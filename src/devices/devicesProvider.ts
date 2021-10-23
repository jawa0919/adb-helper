/*
 * @FilePath     : /adb-helper/src/devices/devicesProvider.ts
 * @Date         : 2021-10-23 10:47:39
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : 设备树的提供者
 */

import { Event, EventEmitter, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window } from "vscode";
import { IDevice } from "../type";

export class DevicesProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  constructor(public devices: IDevice[] = []) {}

  private get ipDevices(): IDevice[] {
    return this.devices.filter((r) => r.ip);
  }

  private get usbDevices(): IDevice[] {
    return this.devices.filter((r) => !r.ip);
  }

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    if (this.devices.length === 0) {
      window.showWarningMessage("Please Connect Android Devices");
      return Promise.resolve([new TreeItem("Please Connect Android Devices")]);
    }

    if (element?.contextValue === "ipGroup") {
      if (this.ipDevices.length === 0) {
        return Promise.resolve([new TreeItem("No Devices Connect Ip")]);
      }
      let treeItemList = this.ipDevices.map((device: IDevice) => {
        let item = new TreeItem(device.product);
        item.id = device.id;
        item.description = device.id;
        item.tooltip = JSON.stringify(device);
        item.contextValue = "ip";
        item.iconPath = new ThemeIcon("device-mobile");
        return item;
      });
      return Promise.resolve(treeItemList);
    }

    let treeItemList = this.usbDevices.map((device: IDevice) => {
      let item = new TreeItem(device.product);
      item.id = device.id;
      item.description = device.id;
      item.tooltip = JSON.stringify(device);
      item.contextValue = "usb";
      item.iconPath = new ThemeIcon("device-mobile");
      return item;
    });

    let ipGroupItem = new TreeItem("IP Connect Group");
    ipGroupItem.contextValue = "ipGroup";
    ipGroupItem.iconPath = new ThemeIcon("broadcast");
    ipGroupItem.collapsibleState = TreeItemCollapsibleState.Expanded;

    return Promise.resolve(treeItemList.concat(ipGroupItem));
  }
}
