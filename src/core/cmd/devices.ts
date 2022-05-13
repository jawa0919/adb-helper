/*
 * @FilePath     : /src/core/cmd/devices.ts
 * @Date         : 2022-05-13 17:56:21
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : devices
 */

import { ex } from "../utils/processes";

export type IDevice = {
  devId: string;
  devType: string;
  product: string;
  model: string;
  device: string;
  transportId: string;
  devIp?: string;
  devPort?: string;
};

// 🚀 adb devices -l
// A10EBMM2DENC           device product:m1metal model:m1_metal device:m1metal transport_id:1
// CVH7N15B10000216       device product:angler model:Nexus_6P device:angler transport_id:2
//
export async function devices(): Promise<IDevice[]> {
  let cmd = ["devices", "-l"];
  const proc = await ex("adb", cmd);
  let res: IDevice[] = [];
  proc?.split(/\n|\r\n/).forEach((line) => {
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
    const devPort = devId.split(":").pop();
    return { devId, devType, product, model, device, transportId, devIp, devPort };
  }
  return { devId, devType, product, model, device, transportId };
}

function _findValue(array: string[], key: string, def = ""): string {
  const temp = array.find((e) => e.startsWith(key));
  const value = temp?.split(":").pop()?.trim();
  return value || def;
}
