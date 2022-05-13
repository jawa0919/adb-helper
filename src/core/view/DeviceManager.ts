/*
 * @FilePath     : /src/core/view/DeviceManager.ts
 * @Date         : 2022-05-13 16:38:20
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : 设备管理器
 */

import { ExecaChildProcess } from "execa";
import { commands, Disposable, ExtensionContext, window } from "vscode";
import { flutterBinPath } from "../app/AppConfig";
import { killServer, startServer } from "../cmd/connect";
import { devices, IDevice } from "../cmd/devices";
import { safeSpawn } from "../utils/processes";
import { showProgress, waitMoment } from "../utils/util";
import { DeviceTree } from "./DeviceTree";

export class DeviceManager implements Disposable {
  static deviceList: IDevice[] = [];
  tree: DeviceTree;
  constructor(public context: ExtensionContext) {
    this.tree = new DeviceTree();
    window.registerTreeDataProvider("adb-helper.DeviceManager", this.tree);
    /// commands
    commands.registerCommand("adb-helper.restartAdb", () => this.restartAdb());
    commands.registerCommand("adb-helper.refreshDeviceManager", () => this.refreshDeviceManager());
    commands.registerCommand("adb-helper.ipConnect", () => this.ipConnect());
    commands.registerCommand("adb-helper.ipConnectHistory", () => this.ipConnectHistory());
  }
  ipConnectHistory() {
    console.log("ipConnectHistory");
  }
  ipConnect() {
    console.log("ipConnect");
  }
  async refreshDeviceManager() {
    DeviceManager.deviceList = await devices();
    this.tree.eventEmitter.fire();
  }
  async restartAdb() {
    showProgress("Restart Adb running!", async () => {
      await killServer();
      await waitMoment();
      await startServer();
      await waitMoment();
      DeviceManager.deviceList = await devices();
      this.tree.eventEmitter.fire();
      return;
    });
  }
  dispose() {
    const req = { id: this.daemonId, method: "daemon.shutdown" };
    const cmd = "[" + JSON.stringify(req) + "]\r\n";
    this.process?.stdin?.write(cmd);
    this.process?.disconnect();
    this.daemonId === undefined;
  }

  private process: ExecaChildProcess | undefined;
  private daemonId: number | undefined;
  createFlutterDaemon() {
    if (flutterBinPath === "") return;
    this.process = safeSpawn("flutter", ["daemon"], flutterBinPath);
    this.process.stderr?.on("data", (err) => this._errDataListener(err));
    this.process.stdout?.on("data", (chunk) => this._outDataListener(chunk));
    this.process.on("error", (err) => this._errDataListener(err));
    this.daemonId = Math.round(Math.random() * 1000 + 1);
    // FIXME 2022-05-04 15:21:40 https://github.com/Dart-Code/Dart-Code/blob/master/src/extension/flutter/flutter_daemon.ts#L206
    const req = { id: this.daemonId, method: "device.enable" };
    const cmd = "[" + JSON.stringify(req) + "]\r\n";
    this.process?.stdin?.write(cmd);
  }
  private _errDataListener(data: any) {
    const res = Buffer.from(data).toString();
    console.error("errDataListener", res);
  }
  private _outDataListener(data: any) {
    const res = Buffer.from(data).toString();
    const messageList = res.split("\n").filter((m) => m.trim() !== "");
    const ids = messageList.map((m) => this._messageLineParse(m));
    if (ids.filter((id) => id !== "").length > 0) {
      this.refreshDeviceManager();
    }
  }
  // "[{"event":"device.removed","params":{"id":"CVH7N15B10000216","name":"Nexus 6P","platform":"android-arm","emulator":false,"category":"mobile","platformType":"android","ephemeral":true,"emulatorId":null}}]"
  private _messageLineParse(line: string): string {
    const data = [JSON.parse(line)].flat()?.shift();
    if (data.event) {
      let event: string = data.event;
      let platformType: string = data.params.platformType;
      if (event === "device.added" && platformType === "android") {
        console.log("device.added", data.params.id);
        return data.params.id || "";
      }
      if (event === "device.removed" && platformType === "android") {
        console.log("device.removed", data.params.id);
        return data.params.id || "";
      }
    }
    return "";
  }
}
