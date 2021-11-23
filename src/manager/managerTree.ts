/*
 * @FilePath     : /src/manager/managerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : managerTree
 */

import { CancellationToken, commands, ExtensionContext, Progress, ProgressLocation, QuickPickItem, window, workspace } from "vscode";
import { adbDevices, adbDisconnectAll, adbKillServer, adbStartServer } from "../command/base";
import { connect, connectHost, deviceWifiIP, screencap, tcpIp } from "../command/device";
import { pull } from "../command/file";
import { clear, install, uninstall } from "../command/pm";
import { ExplorerTree } from "../explorer/explorerTree";
import { IDevice } from "../type";
import { waitMoment } from "../util/util";
import { ManagerProvider } from "./managerProvider";

export class ManagerTree {
  provider: ManagerProvider;
  explorerTree: ExplorerTree;

  devices: IDevice[] = [];
  currentDevice?: IDevice;

  constructor(context: ExtensionContext, device?: IDevice) {
    console.debug("ManagerTree constructor");
    this.provider = new ManagerProvider(device);
    window.registerTreeDataProvider("adb-helper.Manager", this.provider);
    this.explorerTree = new ExplorerTree(context, device);

    commands.registerCommand("adb-helper.Manager.Refresh", async () => {
      console.log("Manager.Refresh");
      this.showProgress("Manager.Refresh running!", async () => {
        await waitMoment();
        this.devices = adbDevices();
        const inc = this.devices.map((r) => r.id).includes(this.currentDevice?.id ?? "");
        if (!inc) {
          this.currentDevice = this.devices[0];
          this.setDevice(this.currentDevice);
        }
        this.refreshTree("");
        return;
      });
    });

    commands.registerCommand("adb-helper.Manager.Device.Swap", async () => {
      console.log("Manager.Device.Swap");
      const quickPick = window.createQuickPick();
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.placeholder = "Swap Current Device";
      quickPick.items = this.devices.map((d) => {
        const label = d.ip ? "$(broadcast) " : "$(plug) ";
        return { label: label + d.model, description: d.id };
      });
      quickPick.onDidChangeSelection((s) => {
        if (s[0]) {
          quickPick.hide();
          const d = this.devices.find((r) => r.id === s[0].description);
          this.currentDevice = d ?? this.devices[0];
          this.setDevice(this.currentDevice);
          this.refreshTree("");
        }
      });
      quickPick.show();
    });

    commands.registerCommand("adb-helper.Manager.Wifi.Disconnect", async () => {
      console.log("Manager.Wifi.Disconnect");
      this.showProgress("Manager.Wifi.Disconnect running!", async () => {
        if (adbDisconnectAll()) {
          await waitMoment();
          adbKillServer();
          await waitMoment();
          adbStartServer();
          await waitMoment();
          commands.executeCommand("adb-helper.Manager.Refresh");
        }
        return;
      });
    });

    commands.registerCommand("adb-helper.Manager.Wifi.History", async () => {
      console.log("Manager.Wifi.History");
      const wifiHistory = context.globalState.get<string>("adb-helper.wifiHistory") ?? "";
      const wifiDevices: IDevice[] = wifiHistory ? JSON.parse(wifiHistory) : [];
      if (wifiDevices.length > 0) {
        const quickPick = window.createQuickPick();
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.placeholder = "Pick Wifi History Device";
        const clearItem: QuickPickItem = { label: "Clear History", alwaysShow: true };
        const wifItems: QuickPickItem[] = wifiDevices.map((d) => {
          return { label: "$(broadcast) " + d.model, description: d.id };
        });
        quickPick.items = wifItems.concat(clearItem);
        quickPick.onDidChangeSelection((s) => {
          quickPick.hide();
          if (s[0].label === "Clear History") {
            context.globalState.update("adb-helper.WifiHistory", "");
            return;
          }
          const d = wifiDevices.find((r) => r.id === s[0].description);
          if (d) {
            this.showProgress("Device.ConnectWifi running!", async () => {
              await waitMoment();
              const host = d.ip! + d.port!;
              const isConnect = connectHost(host);
              if (!isConnect) {
                window.showErrorMessage(`ConnectWifi ${host} Error`);
                return;
              }
              window.showInformationMessage(`ConnectWifi Success`);
              commands.executeCommand("adb-helper.Manager.Refresh");
              return;
            });
          }
        });
        quickPick.show();
      } else {
        window.showInformationMessage("No Find Wifi History");
      }
    });

    commands.registerCommand("adb-helper.Manager.Wifi.InputIPConnect", async () => {
      console.log("Manager.Wifi.InputIPConnect");
      let host = "";
      const inputBox = window.createInputBox();
      inputBox.onDidHide(() => inputBox.dispose());
      inputBox.placeholder = "Input device connect host. eg: 192.168.1.103:5555";
      inputBox.onDidChangeValue((e) => (host = e));
      inputBox.onDidAccept(() => {
        inputBox.hide();
        this.showProgress("Device.InputIPConnect running!", async () => {
          await waitMoment();
          const isConnect = connectHost(host);
          if (!isConnect) {
            window.showErrorMessage(`InputIPConnect ${host} Error`);
            return;
          }
          window.showInformationMessage(`InputIPConnect Success`);
          commands.executeCommand("adb-helper.Manager.Refresh");
          return;
        });
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
            let success = await install(this.provider.device?.id ?? "", fileUri!.fsPath);
            if (success) {
              window.showInformationMessage("Install Success");
              commands.executeCommand("adb-helper.Manager.Refresh");
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
      const device: IDevice = JSON.parse(r.tooltip);
      const ip: string = deviceWifiIP(device.id);

      let portList = this.devices.map((d) => d.port ?? 5555).sort();
      let port: number = portList.pop() ?? 5555;
      port = port + 1;

      this.showProgress("Device.ConnectWifi running!", async () => {
        await waitMoment();
        const isTcp = tcpIp(device.id, port);
        if (!isTcp) {
          window.showErrorMessage(`ConnectWifi.tcpIp ${device.id} Error,Please Try Again.`);
          return;
        }
        const isConnect = connect(device.id, ip, port);
        if (!isConnect) {
          window.showErrorMessage(`ConnectWifi.connect ${device.id} Error,Please Try Again.`);
          return;
        }
        window.showInformationMessage(`ConnectWifi Success`);

        const wifiHistory = context.globalState.get<string>("adb-helper.wifiHistory") ?? "";
        const wifiDevices: IDevice[] = wifiHistory ? JSON.parse(wifiHistory) : [];
        wifiDevices.push({ ...device, ip, port, id: `${ip}:${port}` });
        context.globalState.update("adb-helper.wifiHistory", JSON.stringify(wifiDevices));

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
            let success = await install(this.provider.device?.id ?? "", fileUri!.fsPath, ["-t", "-r"]);
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
            let success = await uninstall(this.provider.device?.id ?? "", r.id);
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
            let success = await clear(this.provider.device?.id ?? "", r.id);
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
            let success = pull(this.provider.device?.id ?? "", r.tooltip, fileUri!.fsPath + "\\" + r.id + ".apk");
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

  added(id: string): void {
    console.log("Manager.Apk.added");
    this.showProgress("Manager.Refresh running!", async () => {
      await waitMoment();
      this.devices = adbDevices();
      let index = this.devices.findIndex((r) => r.id === id);
      if (index === -1) {
        index = 0;
      }
      this.currentDevice = this.devices[index];
      this.setDevice(this.currentDevice);
      this.refreshTree("");
      return;
    });
  }

  removed(id: string): void {
    console.log("Manager.Apk.removed");
    this.showProgress("Manager.Refresh running!", async () => {
      await waitMoment();
      this.devices = adbDevices();
      this.currentDevice = this.devices[0];
      this.setDevice(this.currentDevice);
      this.refreshTree("");
      return;
    });
  }

  setDevice(device: IDevice) {
    this.provider.device = device;
    this.explorerTree.setDevice(device);
    this.explorerTree.refreshTree("");
  }

  refreshTree(args?: string) {
    this.provider.refresh();
  }

  showProgress<T>(title: string, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Thenable<T>) {
    window.withProgress<T>({ location: ProgressLocation.Notification, title, cancellable: false }, task);
  }
}
