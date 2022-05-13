/*
 * @FilePath     : /src/core/view/DeviceTree.ts
 * @Date         : 2022-05-13 18:24:21
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : DeviceTree
 */

import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { IDevice } from "../cmd/devices";
import { DeviceManager } from "./DeviceManager";

export class DeviceTree implements TreeDataProvider<TreeItem> {
  constructor() {}
  eventEmitter: EventEmitter<TreeItem | TreeItem[] | undefined | void> = new EventEmitter<TreeItem | TreeItem[] | undefined | void>();
  onDidChangeTreeData?: Event<void | TreeItem | TreeItem[] | null | undefined> | undefined = this.eventEmitter.event;
  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (element === undefined) return DeviceManager.deviceList.map((d) => this.buildDeviceNode(d));
    return [];
  }
  buildDeviceNode(device: IDevice): TreeItem {
    const uri = Uri.from({ scheme: "adb-helper", authority: device.devId, path: "/" });
    let item = new TreeItem(`${device.devIp ? "📶" : "📱"} ${device.model}`);
    item.id = uri.toString();
    item.tooltip = JSON.stringify(device);
    item.contextValue = "AdbDevice";
    item.collapsibleState = TreeItemCollapsibleState.Collapsed;
    item.description = device.devId;
    return item;
  }
}
