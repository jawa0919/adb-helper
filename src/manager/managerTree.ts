/*
 * @FilePath     : /src/manager/managerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : managerTree
 */

import { CancellationToken, commands, ExtensionContext, Progress, ProgressLocation, window, workspace } from "vscode";
import { adbDevices, adbDisconnectAll } from "../command/base";
import { connect, deviceWifiIP, screencap, tcpIp } from "../command/device";
import { pull } from "../command/file";
import { clear, install, uninstall } from "../command/pm";
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
      this.showProgress("Manager.Refresh running!", async () => {
        await waitMoment();
        this.devices = adbDevices();
        this.currentDevice = this.devices[0];
        this.setDevice(this.currentDevice);
        this.refreshTree("");
      });
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
      // const quickPick = window.createQuickPick();
      // quickPick.onDidHide(() => quickPick.dispose());
      // quickPick.placeholder = "connect device";
      // quickPick.items = this.devices.map((d) => {
      //   return { label: d.model, description: d.id };
      // });
      // quickPick.onDidChangeSelection((s) => {
      //   if (s[0]) {
      //     console.log("Manager.Wifi.History.quickPick" + s[0]);
      //     // TODO 2021-11-20 22:13:08 cmd("")
      //   }
      // });

      // quickPick.show();
    });

    commands.registerCommand("adb-helper.Manager.Wifi.Disconnect", async () => {
      console.log("Manager.Wifi.Disconnect");
      if (adbDisconnectAll()) {
        commands.executeCommand("adb-helper.Manager.Refresh");
      }
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

    commands.registerCommand("adb-helper.Manager.Device.Screenshot", async (r) => {
      console.log("Manager.Device.Screenshot");
      const device: IDevice = JSON.parse(r.tooltip);
      const path = screencap(device.id);
      window.showOpenDialog({ canSelectFolders: true }).then((res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          this.showProgress("Device.Screenshot running!", async () => {
            await waitMoment();
            let success = pull(device.id, path, fileUri?.fsPath ?? "");
            if (success) {
              window.showInformationMessage("Screenshot Success");
            } else {
              window.showErrorMessage("Screenshot Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Manager.Device.Install", async () => {
      console.log("Manager.Device.Install");
      window.showOpenDialog({ filters: { apk: ["apk"] } }).then(async (res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          this.showProgress("Device.Install running!", async () => {
            await waitMoment();
            let success = await install(provider.device?.id ?? "", fileUri!.fsPath);
            if (success) {
              provider.refresh();
              window.showInformationMessage("Install Success");
            } else {
              window.showErrorMessage("Install Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Manager.Device.ConnectWifi", async (r) => {
      console.log("Manager.Device.ConnectWifi");
      // TODO 2021-11-22 21:32:57 same error
      const device: IDevice = JSON.parse(r.tooltip);
      const ip: string = deviceWifiIP(device.id);
      let port: number = parseInt(workspace.getConfiguration().get("adb-helper.startPort") ?? "5555");
      port = port + device.transportId;

      this.showProgress("Device.ConnectWifi running!", async () => {
        await waitMoment();
        const isTcp = tcpIp(device.id, port);
        if (!isTcp) {
          window.showErrorMessage(`tcpIp ${device.id} error`);
          return;
        }

        await waitMoment();
        const isConnect = connect(device.id, ip, port);
        if (!isConnect) {
          window.showErrorMessage(`connect ${device.id} error`);
          return;
        }

        await waitMoment();
        commands.executeCommand("adb-helper.Manager.Refresh");
        return;
      });
    });

    commands.registerCommand("adb-helper.Manager.Apk.Install_r_t", async () => {
      console.log("Manager.Apk.Install_r_t");
      window.showOpenDialog({ filters: { apk: ["apk"] } }).then(async (res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          this.showProgress("Apk.Install_r_t running!", async () => {
            await waitMoment();
            let success = await install(provider.device?.id ?? "", fileUri!.fsPath, ["-t", "-r"]);
            if (success) {
              commands.executeCommand("adb-helper.Manager.Refresh");
              window.showInformationMessage("Install_r_t Success");
            } else {
              window.showErrorMessage("Install_r_t Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Manager.Apk.Uninstall", async (r) => {
      console.log("Manager.Apk.Uninstall");
      window.showInformationMessage("Do you want uninstall this apk?", { modal: true, detail: r.id }, ...["Yes"]).then(async (answer) => {
        if (answer === "Yes") {
          this.showProgress("Apk.Uninstall running!", async () => {
            await waitMoment();
            let success = await uninstall(provider.device?.id ?? "", r.id);
            if (success) {
              commands.executeCommand("adb-helper.Manager.Refresh");
              window.showInformationMessage("Uninstall Success");
            } else {
              window.showErrorMessage("Uninstall Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Manager.Apk.Wipe", async (r) => {
      console.log("Manager.Apk.Wipe");
      window.showInformationMessage("Do you want wipe this apk data?", { modal: true, detail: r.id }, ...["Yes"]).then(async (answer) => {
        if (answer === "Yes") {
          this.showProgress("Apk.Wipe running!", async () => {
            await waitMoment();
            let success = await clear(provider.device?.id ?? "", r.id);
            if (success) {
              commands.executeCommand("adb-helper.Manager.Refresh");
              window.showInformationMessage("Wipe Success");
            } else {
              window.showErrorMessage("Wipe Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Manager.Apk.Export", async (r) => {
      console.log("Manager.Apk.Export");
      window.showOpenDialog({ canSelectFolders: true }).then((res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          this.showProgress("Apk.Export running!", async () => {
            await waitMoment();
            let success = pull(provider.device?.id ?? "", r.tooltip, fileUri!.fsPath + "\\" + r.id + ".apk");
            if (success) {
              window.showInformationMessage("Export Success");
            } else {
              window.showErrorMessage("Export Error");
            }
            return;
          });
        }
      });
    });

    /// Start
    commands.executeCommand("adb-helper.Manager.Refresh");
  }

  setDevice(device: IDevice) {
    this.provider.device = device;
    this.explorerTree.setDevice(device);
    this.explorerTree.refreshTree();
  }

  refreshTree(args: string) {
    this.provider.refresh();
  }

  showProgress<T>(title: string, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Thenable<T>) {
    window.withProgress<T>({ location: ProgressLocation.Notification, title, cancellable: false }, task);
  }
}
