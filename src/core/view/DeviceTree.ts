/*
 * @FilePath     : /src/core/view/DeviceTree.ts
 * @Date         : 2022-05-13 18:24:21
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : DeviceTree
 */

import { Event, EventEmitter, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { AppConst } from "../app/AppConst";
import { IDevice } from "../cmd/devices";
import { IApk, pm } from "../cmd/pm";
import { DeviceController } from "../controller/DeviceController";

export class DeviceTree implements TreeDataProvider<TreeItem> {
  constructor(public apkFilter?: string) {}
  eventEmitter: EventEmitter<TreeItem | TreeItem[] | undefined | void> = new EventEmitter<TreeItem | TreeItem[] | undefined | void>();
  onDidChangeTreeData?: Event<void | TreeItem | TreeItem[] | null | undefined> | undefined = this.eventEmitter.event;
  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (element === undefined) return DeviceController.deviceList.map((d) => this.buildDeviceNode(d));
    if (this.apkFilter === undefined) return [];
    const devId = element.description?.toString() || "";
    const apkList = await pm(devId, this.apkFilter);
    return apkList.map((apk) => this.buildApkNode(apk));
  }
  buildDeviceNode(device: IDevice): TreeItem {
    const uri = Uri.from({ scheme: AppConst.scheme, authority: device.devId, path: "/" });
    let item = new TreeItem(`${device.netWorkIp ? "📶" : "📱"} ${device.model}`);
    item.id = uri.toString();
    item.tooltip = JSON.stringify(device);
    item.contextValue = "AdbDevice";
    item.collapsibleState = TreeItemCollapsibleState.Collapsed;
    item.description = device.devId;
    return item;
  }
  buildApkNode(apk: IApk): TreeItem {
    const uri = Uri.from({ scheme: AppConst.scheme, authority: apk.devId, path: `/data/data/${apk.apkId}` });
    let item = new TreeItem(apk.apkId);
    item.id = uri.toString();
    item.tooltip = JSON.stringify(apk);
    item.contextValue = "AdbApk";
    item.collapsibleState = TreeItemCollapsibleState.None;
    item.iconPath = new ThemeIcon("symbol-constructor");
    return item;
  }
}
