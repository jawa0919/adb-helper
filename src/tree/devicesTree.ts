/*
 * @FilePath     : /adb-helper/src/tree/devicesTree.ts
 * @Date         : 2021-08-12 18:27:31
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : devicesTree
 */

import { commands, Event, EventEmitter, ExtensionContext, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window, workspace } from "vscode";
import { adbDevices, adbKillServer, adbStartServer, disconnectAll } from "../command/base";
import { connect, screencap, tcpIp, wifiIP } from "../command/device";
import { pull } from "../command/shellFile";
import { IDevice } from "../type";
import { c, waitMoment } from "../util";
import { ExplorerTree } from "./explorerTree";
import { ManagerTree } from "./managerTree";

export class DevicesTree {
  explorerTree?: ExplorerTree;
  managerTree?: ManagerTree;

  constructor(context: ExtensionContext) {
    console.debug("DevicesTree constructor");
    const provider = new DevicesProvider(adbDevices());
    window.registerTreeDataProvider("adb-helper.Devices", provider);

    commands.registerCommand("adb-helper.Devices.Refresh", () => {
      console.log("Devices.Refresh");
      provider.devices = adbDevices();
      provider.refresh();
    });

    commands.registerCommand("adb-helper.Devices.Command", async () => {
      console.log("Devices.Command");
      // TODO 2021-08-26 10:42:24 Command
      let result = await window.showInputBox({
        placeHolder: "ADB Command",
        validateInput: (text) => {
          return text.startsWith("adb") ? "" : text;
        },
      });
      if (result) {
        result = result.trim();
        await c(result);
        const commandHistory = context.globalState.get<string[]>("adb-helper.CommandHistory") ?? [];
        context.globalState.update("adb-helper.CommandHistory", commandHistory.concat([result]));
      }
    });

    commands.registerCommand("adb-helper.Devices.CommandHistory", async () => {
      console.log("Devices.CommandHistory");
      // TODO 2021-08-26 10:42:24 Command
      const commandHistory = context.globalState.get<string[]>("adb-helper.CommandHistory") ?? [];
      await window.showQuickPick(commandHistory, {
        placeHolder: "adb command history",
        onDidSelectItem: (item) => {
          if (typeof item === "string") {
            if (item !== "") {
              c(`${item}`);
            }
          }
        },
      });
    });

    commands.registerCommand("adb-helper.Devices.Disconnect", async () => {
      console.log("Disconnect");
      disconnectAll();
      await waitMoment();
      adbKillServer();
      await waitMoment();
      adbStartServer();
      await waitMoment();
      provider.devices = adbDevices();
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
      provider.devices = adbDevices();
      provider.refresh();
    });

    commands.registerCommand("adb-helper.Devices.Screenshot", async (r) => {
      console.log("Screenshot");
      const device: IDevice = JSON.parse(r.tooltip);
      const path = screencap(device.id);
      window.showOpenDialog({ canSelectFolders: true }).then((res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          window.showInformationMessage("SaveAs......ing");
          let success = pull(device.id, path, fileUri.fsPath);
          if (success) {
            window.showInformationMessage("SaveAs Success");
          } else {
            window.showErrorMessage("SaveAs Error");
          }
        }
      });
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
      let treeItemList = this.ipDevices.map((device: IDevice) => {
        let item = new TreeItem(device.product);
        item.id = device.id;
        item.description = device.id;
        item.tooltip = JSON.stringify(device);
        item.contextValue = "ip";
        item.iconPath = new ThemeIcon("broadcast");
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
    ipGroupItem.iconPath = new ThemeIcon("globe");
    ipGroupItem.collapsibleState = TreeItemCollapsibleState.Expanded;

    return Promise.resolve(treeItemList.concat(ipGroupItem));
  }
}
