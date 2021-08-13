/*
 * @FilePath     : /adb-helper/src/tree/devicesTree.ts
 * @Date         : 2021-08-12 18:27:31
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : devicesTree
 */

import {
  commands,
  Event,
  EventEmitter,
  ExtensionContext,
  ProviderResult,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  window,
  workspace,
} from "vscode";
import {
  adbDevices,
  adbKillServer,
  adbStartServer,
  disconnectAll,
} from "../command/base";
import { connect, tcpIp, wifiIP } from "../command/device";
import { IDevice } from "../type";
import { waitMoment } from "../util";
import { ExplorerProvider, ExplorerTree } from "./explorerTree";

export class DevicesTree {
  constructor(context: ExtensionContext) {
    console.debug("DevicesTree constructor");
    const provider = new DevicesProvider();
    window.registerTreeDataProvider("adb-helper.Devices", provider);

    commands.registerCommand("adb-helper.Devices.refresh", () => {
      provider.refresh();
    });

    commands.registerCommand("adb-helper.Devices.disconnect", async () => {
      disconnectAll();
      await waitMoment();
      adbKillServer();
      await waitMoment();
      adbStartServer();
      await waitMoment();
      provider.refresh();
    });

    commands.registerCommand("adb-helper.Devices.connect", _connectDevice);
    commands.registerCommand("adb-helper.Devices.openSDCardExplorer", _open1);
    commands.registerCommand("adb-helper.Devices.openRootExplorer", _open2);
    commands.registerCommand("adb-helper.Devices.openAppManager", _open3);

    async function _connectDevice(item: TreeItem) {
      const device: IDevice = JSON.parse(item.tooltip as string);
      const ip: string = wifiIP(device.id);
      let port: number = parseInt(
        workspace.getConfiguration().get("adb-helper.startPort") ?? "5555"
      );
      port = port + device.transportId;

      await waitMoment();
      const isTcp = await tcpIp(device.id, port).catch((err) => {
        window.showErrorMessage(err);
      });
      if (!isTcp) {
        window.showWarningMessage(`tcpIp ${device.id} error`);
        return;
      }

      await waitMoment();
      const isConnect = connect(device.id, ip, port);
      if (!isConnect) {
        window.showWarningMessage(`connect ${device.id} error`);
        return;
      }
      await waitMoment();
      provider.refresh();
    }

    async function _open1(item: TreeItem) {
      const device: IDevice = JSON.parse(item.tooltip as string);
      // const uri = Uri.parse(`adbEx://${device.id}/sdcard/`);
      const provider = new ExplorerProvider(device, "/sdcard/");
      new ExplorerTree(context, provider);
    }

    async function _open2(item: TreeItem) {
      const device: IDevice = JSON.parse(item.tooltip as string);
      // const uri = Uri.parse(`adbEx://${device.id}/`);
      // const provider = new ExplorerTreeDataProvider(device, "/");
      // new ExplorerTree(context, provider);
    }

    async function _open3(item: TreeItem) {
      const device: IDevice = JSON.parse(item.tooltip as string);
      // const provider = new ManagerTreeDataProvider(device);
      // new ManagerTree(context, provider);
    }
  }
}

export class DevicesProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    let devices = adbDevices();
    if (devices.length === 0) {
      window.showWarningMessage("Please Connect Android Devices");
      return Promise.resolve([new TreeItem("Please Connect Android Devices")]);
    }

    console.log(devices);
    let treeItemList = devices.map((device: IDevice) => {
      let item = new TreeItem(device.product);
      item.id = device.id;
      item.description = device.id;
      item.tooltip = JSON.stringify(device);
      item.contextValue = device.ip ? "wifi" : "usb";
      item.iconPath = new ThemeIcon(device.ip ? "broadcast" : "device-mobile");
      return item;
    });
    return Promise.resolve(treeItemList);
  }
}
