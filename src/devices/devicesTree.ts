/*
 * @FilePath     : /adb-helper/src/devices/devicesTree.ts
 * @Date         : 2021-08-12 18:27:31
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : 设备树
 */

import { commands, ExtensionContext, window, workspace } from "vscode";
import { adbDevices, adbKillServer, adbStartServer, disconnectAll } from "../api/base";
import { connect, screencap, tcpIp, wifiIP } from "../api/device";
import { pull } from "../api/shellFile";
import { ExplorerTree } from "../explorer/explorerTree";
import { ManagerTree } from "../manager/managerTree";
import { IDevice } from "../type";
import { waitMoment } from "../util/util";
import { DevicesProvider } from "./devicesProvider";

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

    commands.registerCommand("adb-helper.Devices.Disconnect", async () => {
      console.log("Devices.Disconnect");
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
      console.log("Devices.Connect");
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

    commands.registerCommand("adb-helper.Devices.OpenSDCardExplorer", async (r) => {
      console.log("Devices.OpenSDCardExplorer");
      const device: IDevice = JSON.parse(r.tooltip);
      // const uri = Uri.parse(`adbEx://${device.id}/sdcard/`);
      if (this.explorerTree) {
        this.explorerTree.setDevice(device);
        this.explorerTree.refreshTree("/sdcard/");
      } else {
        await commands.executeCommand("setContext", "adb-helper:showExplorer", true);
        this.explorerTree = new ExplorerTree(context, device);
        this.explorerTree.refreshTree("/sdcard/");
      }
    });
    commands.registerCommand("adb-helper.Devices.OpenRootExplorer", async (r) => {
      console.log("Devices.OpenRootExplorer");
      const device: IDevice = JSON.parse(r.tooltip);
      // const uri = Uri.parse(`adbEx://${device.id}/`);
      if (this.explorerTree) {
        this.explorerTree.setDevice(device);
        this.explorerTree.refreshTree("/");
      } else {
        await commands.executeCommand("setContext", "adb-helper:showExplorer", true);
        this.explorerTree = new ExplorerTree(context, device);
        this.explorerTree.refreshTree("/");
      }
    });
    commands.registerCommand("adb-helper.Devices.OpenAppManager", async (r) => {
      console.log("Devices.OpenAppManager");
      const device: IDevice = JSON.parse(r.tooltip);
      if (this.managerTree) {
        this.managerTree.setDevice(device);
        this.managerTree.refreshTree("-3");
      } else {
        await commands.executeCommand("setContext", "adb-helper:showManager", true);
        this.managerTree = new ManagerTree(context, device);
        this.managerTree.refreshTree("-3");
      }
    });
    commands.registerCommand("adb-helper.Devices.Screenshot", async (r) => {
      console.log("Devices.Screenshot");
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
  }
}
