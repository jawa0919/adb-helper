/*
 * @FilePath     : /src/manager/managerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : managerTree
 */

import { commands, ExtensionContext, window } from "vscode";
import { ExplorerTree } from "../explorer/explorerTree";
import { IDevice } from "../type";
import { waitMoment } from "../util/util";
import { ManagerProvider } from "./managerProvider";

export class ManagerTree {
  devices: IDevice[] = [];
  currentDevice?: IDevice;
  provider: ManagerProvider;

  explorerTree: ExplorerTree;

  constructor(context: ExtensionContext, device?: IDevice) {
    console.debug("ManagerTree constructor");
    const provider = new ManagerProvider(device);
    this.provider = provider;
    window.registerTreeDataProvider("adb-helper.Manager", provider);

    this.explorerTree = new ExplorerTree(context, device);

    commands.registerCommand("adb-helper.Manager.Refresh", async () => {
      console.log("Manager.Refresh");
      await waitMoment(1000);
      // TODO 2021-11-20 22:13:08 cmd("adb devices -l");
      // const mock1: IDevice = { id: "192.168.3.105:5556", type: "device", product: "PD1616B", model: "vivo_X9s", device: "PD1616B", transportId: 1, ip: "192.168.3.105", port: 5556 };
      const mock2: IDevice = { id: "89a6bc23", type: "device", product: "PD1616B", model: "vivo_X9s", device: "PD1616B", transportId: 2 };
      const mock3: IDevice = { id: "afc48774", type: "device", product: "MXA4514", model: "MI_8", device: "MXA4514", transportId: 3 };

      this.devices = [mock2, mock3];
      this.currentDevice = this.devices[0];
      this.setDevice(this.currentDevice);
      this.refreshTree("");
    });

    commands.registerCommand("adb-helper.Manager.Device.Swap", async () => {
      console.log("Manager.Device.Swap");
      const quickPick = window.createQuickPick();
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.placeholder = "Swap current device";
      quickPick.items = this.devices.map((d) => {
        const label = d.ip ? "$(broadcast) " : "$(plug) ";
        return { label: label + d.model, description: d.id };
      });
      quickPick.onDidChangeSelection((s) => {
        if (s[0]) {
          console.log("Manager.Device.Swap.quickPick" + s[0]);
          quickPick.hide();
          const d = this.devices.find((r) => r.id === s[0].description);
          this.currentDevice = d ?? this.devices[0];
          this.setDevice(this.currentDevice);
          this.refreshTree("");
        }
      });

      quickPick.show();
    });

    commands.registerCommand("adb-helper.Manager.Wifi.History", async () => {
      console.log("Manager.Wifi.History");
      const quickPick = window.createQuickPick();
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.placeholder = "connect device";
      quickPick.items = this.devices.map((d) => {
        return { label: d.model, description: d.id };
      });
      quickPick.onDidChangeSelection((s) => {
        if (s[0]) {
          console.log("Manager.Wifi.History.quickPick" + s[0]);
          // TODO 2021-11-20 22:13:08 cmd("")
        }
      });

      quickPick.show();
    });

    commands.registerCommand("adb-helper.Manager.Wifi.Disconnect", async () => {
      console.log("Manager.Wifi.Disconnect");
      await waitMoment(1000);
      // TODO 2021-11-20 22:13:08 cmd("")
      commands.executeCommand("adb-helper.Manager.Refresh");
    });

    commands.registerCommand("adb-helper.Manager.Wifi.InputIPConnect", async () => {
      console.log("Manager.Wifi.InputIPConnect");
      let ip = "";
      const inputBox = window.createInputBox();
      inputBox.onDidHide(() => inputBox.dispose());
      inputBox.placeholder = "Input device ip. eg:192.168.1.103";
      inputBox.onDidChangeValue((e) => (ip = e));
      inputBox.onDidAccept(() => {
        console.log("Manager.Device.InputIPConnect.inputBox" + ip);
        // inputBox.validationMessage = "pls ip";
        inputBox.hide();
        // TODO 2021-11-20 22:13:08 cmd("")
        // commands.executeCommand("adb-helper.Manager.Refresh");
      });
      inputBox.show();
    });

    commands.registerCommand("adb-helper.Manager.Device.Screenshot", async () => {
      console.log("Manager.Device.Screenshot");
      await waitMoment(1000);
      // TODO 2021-11-20 22:13:08 cmd("");
    });

    commands.registerCommand("adb-helper.Manager.Device.Install", async () => {
      console.log("Manager.Device.Install");
      await waitMoment(1000);
      // TODO 2021-11-20 22:13:08 cmd("");
    });

    commands.registerCommand("adb-helper.Manager.Device.ConnectWifi", async () => {
      console.log("Manager.Device.ConnectWifi");
      await waitMoment(1000);
      // TODO 2021-11-20 22:13:08 cmd("");
    });

    commands.registerCommand("adb-helper.Manager.Apk.Install_r_t", async () => {
      console.log("Manager.Apk.Install_r_t");
      await waitMoment(1000);
      // TODO 2021-11-20 22:13:08 cmd("");
    });

    commands.registerCommand("adb-helper.Manager.Apk.Uninstall", async () => {
      console.log("Manager.Apk.Uninstall");
      await waitMoment(1000);
      // TODO 2021-11-20 22:13:08 cmd("");
    });

    commands.registerCommand("adb-helper.Manager.Apk.Wipe", async () => {
      console.log("Manager.Apk.Wipe");
      await waitMoment(1000);
      // TODO 2021-11-20 22:13:08 cmd("");
    });

    commands.registerCommand("adb-helper.Manager.Apk.Export", async () => {
      console.log("Manager.Apk.Export");
      await waitMoment(1000);
      // TODO 2021-11-20 22:13:08 cmd("");
    });

    /// Start
    commands.executeCommand("adb-helper.Manager.Refresh");
  }

  setDevice(device: IDevice) {
    this.provider.device = device;
    this.explorerTree.setDevice(device);
    this.explorerTree.refreshTree("");
  }

  refreshTree(args: string) {
    this.provider.refresh();
  }
}
