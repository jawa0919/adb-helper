/*
 * @FilePath     : /src/core/cmd/devices.ts
 * @Date         : 2022-05-13 17:56:21
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : devices
 */

import { adbBinPath } from "../app/AppConfig";
import { simpleSafeSpawn } from "../utils/processes";
import { showErrorMessage } from "../utils/util";

export type IDevice = {
  devId: string;
  devType: string;
  product: string;
  model: string;
  device: string;
  transportId: string;
  devIp?: string;
  adbTcpPort?: string;
};

// 🚀 adb devices -l
// A10EBMM2DENC           device product:m1metal model:m1_metal device:m1metal transport_id:1
// CVH7N15B10000216       device product:angler model:Nexus_6P device:angler transport_id:2
//
export async function devices(): Promise<IDevice[]> {
  let cmd = ["devices", "-l"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  let res: IDevice[] = [];
  procRes.stdout.split(/\n|\r\n/).forEach((line) => {
    let t = _deviceParse(line.trim());
    if (t) res.push(t);
  });
  return res;
}

function _deviceParse(line: string): IDevice | undefined {
  if (line.length < 1) return undefined;
  if (line.startsWith("List of devices attached")) return undefined;
  const temp = line.split(/\s+/).map((r) => r.trim());
  const devId = temp.shift() || "";
  const devType = temp.shift() || "";
  const product = _findValue(temp, "product");
  const model = _findValue(temp, "model");
  const device = _findValue(temp, "device");
  const transportId = _findValue(temp, "transport_id");
  if (devId.indexOf(":") !== -1) {
    const devIp = devId.split(":").shift();
    const adbTcpPort = devId.split(":").pop();
    return { devId, devType, product, model, device, transportId, devIp, adbTcpPort };
  }
  return { devId, devType, product, model, device, transportId };
}

function _findValue(array: string[], key: string, def = ""): string {
  const temp = array.find((e) => e.startsWith(key));
  const value = temp?.split(":").pop()?.trim();
  return value || def;
}

export async function loadDeviceSystem(devId: string): Promise<{ androidId: string; ip: string }> {
  const androidId = await getAndroidId(devId);
  const ip = await getDeviceIp(devId);
  return { androidId, ip };
}

export async function getAndroidId(devId: string): Promise<string> {
  let cmd = ["-s", devId, "shell", "settings", "get", "secure", "android_id"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  if (procRes.exitCode === 0) {
    return procRes.stdout;
  }
  return "";
}

export async function getDeviceIp(devId: string): Promise<string> {
  let cmd = ["-s", devId, "shell", "ip", "addr", "show", "wlan0"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  let res: string[] = [];
  procRes.stdout.split(/\n|\r\n/).forEach((line) => {
    let t = _shellIpParse(line.trim());
    if (t) res.push(t);
  });
  return res[0];
}

// 5: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
//     link/ether 24:df:6a:ad:8e:fc brd ff:ff:ff:ff:ff:ff
//     inet 192.168.205.83/24 brd 192.168.205.255 scope global wlan0
//        valid_lft forever preferred_lft forever
//     inet6 fe80::26df:6aff:fead:8efc/64 scope link
//        valid_lft forever preferred_lft forever
function _shellIpParse(line: string): string | undefined {
  if (line.length < 1) return undefined;
  if (!line.startsWith("inet")) return undefined;
  const temp = line.split(/\s+/).map((r) => r.trim());
  const ip = temp[1].split("/").shift() || "";
  return ip;
}

export async function systemProperty(devId: string): Promise<boolean> {
  let cmd = ["-s", devId, "shell", "getprop"];
  const procRes = await simpleSafeSpawn("adb", cmd, adbBinPath);
  if (procRes.stdout.includes("Success")) {
    return true;
  }
  return false;
}
