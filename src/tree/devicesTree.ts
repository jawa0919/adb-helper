/*
 * @FilePath     : /adb-helper/src/tree/devicesTree.ts
 * @Date         : 2021-08-12 18:27:31
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : devicesTree
 */

import { commands, Event, EventEmitter, ExtensionContext, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem, window, workspace } from "vscode";
import { adbDevices, adbKillServer, adbStartServer, disconnectAll } from "../command/base";
import { connect, tcpIp, wifiIP } from "../command/device";
import { IDevice } from "../type";
import { waitMoment } from "../util";
import { ExplorerTree } from "./explorerTree";
import { ManagerTree } from "./managerTree";

export class DevicesTree {
  explorerTree?: ExplorerTree;
  managerTree?: ManagerTree;

  constructor(context: ExtensionContext) {
    console.debug("DevicesTree constructor");
    const provider = new DevicesProvider();
    window.registerTreeDataProvider("adb-helper.Devices", provider);

    commands.registerCommand("adb-helper.Devices.Refresh", () => {
      console.log("Devices.Refresh");
      provider.refresh();
    });
    commands.registerCommand("adb-helper.Devices.Disconnect", async () => {
      console.log("Disconnect");
      disconnectAll();
      await waitMoment();
      adbKillServer();
      await waitMoment();
      adbStartServer();
      await waitMoment();
      provider.refresh();
    });

    commands.registerCommand("adb-helper.Devices.Connect", async (r) => {
      console.log("Connect");
      const device: IDevice = JSON.parse(r.tooltip);
      const ip: string = wifiIP(device.id);
      let port: number = parseInt(workspace.getConfiguration().get("adb-helper.startPort") ?? "5555");
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
    });
    commands.registerCommand("adb-helper.Devices.OpenSDCardExplorer", async (r) => {
      console.log("OpenSDCardExplorer");
      const device: IDevice = JSON.parse(r.tooltip);
      // const uri = Uri.parse(`adbEx://${device.id}/sdcard/`);
      if (this.explorerTree) {
        this.explorerTree.setDevice(device);
        this.explorerTree.refreshTree("/sdcard/");
      } else {
        this.explorerTree = new ExplorerTree(context, device);
        this.explorerTree.refreshTree("/sdcard/");
      }
    });
    commands.registerCommand("adb-helper.Devices.OpenRootExplorer", async (r) => {
      console.log("OpenRootExplorer");
      const device: IDevice = JSON.parse(r.tooltip);
      // const uri = Uri.parse(`adbEx://${device.id}/`);
      if (this.explorerTree) {
        this.explorerTree.setDevice(device);
        this.explorerTree.refreshTree("/");
      } else {
        this.explorerTree = new ExplorerTree(context, device);
        this.explorerTree.refreshTree("/");
      }
    });
    commands.registerCommand("adb-helper.Devices.OpenAppManager", async (r) => {
      console.log("OpenAppManager");
      const device: IDevice = JSON.parse(r.tooltip);
      if (this.managerTree) {
        this.managerTree.setDevice(device);
        this.managerTree.refreshTree("-3");
      } else {
        this.managerTree = new ManagerTree(context, device);
        this.managerTree.refreshTree("-3");
      }
    });
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
