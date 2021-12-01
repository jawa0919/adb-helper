/*
 * @FilePath     : /src/device/deviceDaemon.ts
 * @Date         : 2021-11-26 10:34:46
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : deviceDaemon
 */

import { CancellationToken, commands, ExtensionContext, Progress, ProgressLocation, QuickPickItem, window } from "vscode";
import { adbDevices, adbDisconnectAll, adbKillServer, adbStartServer } from "../command/base";
import { connect, connectHost, screencap, shellIp, tcpIp } from "../command/device";
import { pull } from "../command/file";
import { ExplorerTree } from "../explorer/explorerTree";
import { ManagerTree } from "../manager/managerTree";
import { IDevice } from "../type";
import { waitMoment } from "../util/util";
import execa = require("execa");

export class DeviceDaemon {
  private devices: IDevice[] = [];
  private currentDevice?: IDevice;

  private managerTree: ManagerTree;
  private explorerTree: ExplorerTree;

  private flutterDaemon: execa.ExecaChildProcess;
  private nextId = 10;

  public setDevice(device?: IDevice) {
    this.currentDevice = device;
    this.managerTree.setDevice(device);
    this.explorerTree.setDevice(device);
  }

  public constructor(private context: ExtensionContext) {
    console.debug("DeviceDaemon constructor");
    this.managerTree = new ManagerTree(context, this.currentDevice);
    this.explorerTree = new ExplorerTree(context, this.currentDevice);

    this.flutterDaemon = this._initFlutterDaemon();

    this._initCommands();

    /// Start
    commands.executeCommand("adb-helper.Device.Refresh");
    this._sendReq("device.enable");
  }

  private _initCommands() {
    commands.registerCommand("adb-helper.Device.Refresh", async () => {
      console.log("Device.Refresh");
      this.showProgress("Device.Refresh running!", async () => {
        await waitMoment();
        this.devices = adbDevices();
        if (!this.currentDevice) {
          this.setDevice(this.devices[0]);
        }
        await commands.executeCommand("adb-helper.Manager.Refresh");
        await commands.executeCommand("adb-helper.Explorer.Refresh");
        return;
      });
    });

    commands.registerCommand("adb-helper.Device.Swap", async () => {
      console.log("Device.Swap");
      const quickPick = window.createQuickPick();
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.placeholder = "Swap Current Device";
      quickPick.items = this.devices.map((d) => {
        const label = d.port ? "$(broadcast) " : "$(plug) ";
        return { label: label + d.model, description: d.id };
      });
      quickPick.onDidChangeSelection((e) => {
        if (e[0]) {
          quickPick.hide();
          const d = this.devices.find((r) => r.id === e[0].description) ?? this.devices[0];
          if (d.id !== this.currentDevice?.ip) {
            this.setDevice(d);
            this.explorerTree.setRoot();
          }
          commands.executeCommand("adb-helper.Manager.Refresh");
          commands.executeCommand("adb-helper.Explorer.Refresh");
        }
      });
      quickPick.show();
    });

    commands.registerCommand("adb-helper.Device.DisconnectWifi", async () => {
      console.log("Device.DisconnectWifi");
      this.showProgress("Device.DisconnectWifi running!", async () => {
        await waitMoment();
        let success = adbDisconnectAll();
        if (success) {
          await waitMoment();
          adbKillServer();
          await waitMoment();
          adbStartServer();
          await waitMoment();
          window.showInformationMessage(`DisconnectWifi Success`);
          if (this.currentDevice?.port) {
            this.currentDevice = undefined;
          }
          commands.executeCommand("adb-helper.Device.Refresh");
        } else {
          window.showErrorMessage(`DisconnectWifi Error`);
        }
        return;
      });
    });

    commands.registerCommand("adb-helper.Device.WifiHistory", async () => {
      console.log("Device.WifiHistory");
      // TODO 2021-11-26 14:37:57 bug
      const wifiHistory = this.context.globalState.get<string>("adb-helper.wifiHistory") ?? "";
      const wifiDevices: IDevice[] = wifiHistory ? JSON.parse(wifiHistory) : [];
      if (wifiDevices.length === 0) {
        window.showInformationMessage("No Find Wifi History");
        return;
      }
      const quickPick = window.createQuickPick();
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.placeholder = "Pick Wifi History Device";
      const clearItem: QuickPickItem = { label: "Clear History", alwaysShow: true };
      const wifItems: QuickPickItem[] = wifiDevices.map((d) => {
        return { label: "$(broadcast) " + d.model, description: JSON.stringify(d) };
      });
      quickPick.items = wifItems.concat(clearItem);
      quickPick.onDidChangeSelection((e) => {
        quickPick.hide();
        if (e[0].label === "Clear History") {
          this.context.globalState.update("adb-helper.wifiHistory", "");
          return;
        }
        const d = wifiDevices.find((r) => r.id === JSON.parse(e[0].description ?? "").id);
        if (d) {
          this.showProgress("Device.WifiHistory.ConnectWifi running!", async () => {
            await waitMoment();
            const host = d.ip ?? "" + d.port ?? "";
            const isConnect = connectHost(host);
            if (!isConnect) {
              window.showErrorMessage(`ConnectWifi ${host} Error`);
              return;
            }
            window.showInformationMessage(`ConnectWifi Success`);
            commands.executeCommand("adb-helper.Device.Refresh");
            return;
          });
        }
      });
      quickPick.show();
    });

    commands.registerCommand("adb-helper.Device.InputIPConnect", async () => {
      console.log("Device.InputIPConnect");
      // TODO 2021-11-26 14:37:57 bug
      let host = "";
      const inputBox = window.createInputBox();
      inputBox.onDidHide(() => inputBox.dispose());
      inputBox.placeholder = "Input device connect host. eg: 192.168.1.103:5555";
      inputBox.onDidChangeValue((e) => (host = e));
      inputBox.onDidAccept(() => {
        inputBox.hide();
        if (!host) {
          return;
        }
        this.showProgress("Device.InputIPConnect running!", async () => {
          await waitMoment();
          const isConnect = connectHost(host);
          if (!isConnect) {
            window.showErrorMessage(`InputIPConnect ${host} Error`);
            return;
          }
          window.showInformationMessage(`InputIPConnect Success`);
          commands.executeCommand("adb-helper.Device.Refresh");
          return;
        });
      });
      inputBox.show();
    });

    commands.registerCommand("adb-helper.Device.ConnectWifi", async (r) => {
      console.log("Device.ConnectWifi");
      const device: IDevice = JSON.parse(r.tooltip);
      this.showProgress("Manager.ConnectWifi running!", async () => {
        await waitMoment();

        const ip = shellIp(device.id);
        if (!ip) {
          window.showErrorMessage(`ConnectWifi.shellIp ${device.id} Error`);
          return;
        }

        const devices = adbDevices();
        let portList = devices.map((d) => d.port ?? 5555).sort();
        let port = portList.pop() ?? 5555;
        port = port + 1;
        const isTcp = tcpIp(device.id, port);
        if (!isTcp) {
          window.showErrorMessage(`ConnectWifi.tcpIp ${device.id} Error`);
          return;
        }

        const isConnect = connect(device.id, ip, port);
        if (!isConnect) {
          window.showErrorMessage(`ConnectWifi.connect ${device.id} Error`);
          return;
        }

        const wifiHistory = this.context.globalState.get<string>("adb-helper.wifiHistory") ?? "";
        let wifiDevices: IDevice[] = wifiHistory ? JSON.parse(wifiHistory) : [];
        wifiDevices.push({ ...device, ip, port, id: `${ip}:${port}` });
        wifiDevices = [...new Set(wifiDevices)];
        this.context.globalState.update("adb-helper.wifiHistory", JSON.stringify(wifiDevices));

        await waitMoment();
        this.devices = adbDevices();

        window.showInformationMessage(`Manager.ConnectWifi Success`);
        return;
      });
    });

    commands.registerCommand("adb-helper.Device.Screenshot", async (r) => {
      console.log("Device.Screenshot");
      const d: IDevice = JSON.parse(r.tooltip);
      const path = screencap(d.id);
      window.showOpenDialog({ canSelectFolders: true }).then((res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          this.showProgress("Device.Screenshot running!", async () => {
            await waitMoment();
            let success = pull(d.id, path, fileUri?.fsPath ?? "");
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
  }

  showProgress<T>(title: string, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Thenable<T>) {
    window.withProgress<T>({ location: ProgressLocation.Notification, title, cancellable: false }, task);
  }

  private _initFlutterDaemon(): execa.ExecaChildProcess {
    const pro = execa("flutter", ["daemon"]);
    pro.stdout?.on("data", (data: Buffer | string) => {
      const res = Buffer.from(data).toString();
      console.log(`_initFlutterDaemon stdout data`, res);
      try {
        const msgList = res.split("\n").filter((m) => m.trim() !== "");
        msgList.forEach((m) => this._handleRes(m));
      } catch (error) {
        console.log(`_initFlutterDaemon stdout data catch`, error);
      }
    });
    pro.stderr?.on("data", (data: Buffer | string) => {
      const res = Buffer.from(data).toString();
      console.log(`_initFlutterDaemon stderr data`, res);
      try {
        const msgList = res.split("\n").filter((m) => m.trim() !== "");
        msgList.forEach((m) => this._handleRes(m));
      } catch (error) {
        console.log(`_initFlutterDaemon stderr data catch`, error);
      }
    });
    pro.on("exit", (code, signal) => {
      console.log(`_initFlutterDaemon exit`, code, signal);
    });
    pro.on("error", (error) => {
      console.log(`_initFlutterDaemon error`, error);
    });
    return pro;
  }

  private _sendReq(method: string): void {
    const req = { id: this.nextId++, method };
    const json = "[" + JSON.stringify(req) + "]\r\n";
    this.flutterDaemon.stdin?.write(json);
  }

  private _handleRes(res: string): void {
    console.log(`_handleRes`, res);
    let msg = JSON.parse(res);
    if (msg && msg.length === 1) {
      msg = msg[0];
    }
    if (msg.event) {
      let event: string = msg.event;
      let platformType: string = msg.params.platformType;
      if (event === "device.added" && platformType === "android") {
        this._deviceAdded(msg.params.id);
      }
      if (event === "device.removed" && platformType === "android") {
        this._deviceRemoved(msg.params.id);
      }
    }
  }

  private _deviceAdded(deviceId: string) {
    this.devices = adbDevices();
    if (this.devices.length === 1) {
      commands.executeCommand("adb-helper.Device.Refresh");
    }
  }

  private _deviceRemoved(deviceId: string) {
    this.devices = adbDevices();
    if (this.currentDevice?.id === deviceId) {
      this.currentDevice = undefined;
      commands.executeCommand("adb-helper.Device.Refresh");
    }
  }
}
