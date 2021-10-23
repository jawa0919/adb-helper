/*
 * @FilePath     : /adb-helper/src/api/device.ts
 * @Date         : 2021-08-13 11:40:50
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : device
 */

import { c, cmdSync, cSync } from "../util/c";

export function wifiIP(id: string): string {
  const s = `adb -s ${id} shell ip addr show wlan0`;
  const res = cmdSync(s);
  return _wifiIPParse(res);
}

//  9: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1400 qdisc pfifo_fast state UP qlen 1000
//     link/ether 84:db:ac:f2:58:24 brd ff:ff:ff:ff:ff:ff
//     inet 192.168.205.94/24 brd 192.168.205.255 scope global wlan0
//        valid_lft forever preferred_lft forever
//     inet6 fe80::86db:acff:fef2:5824/64 scope link
//        valid_lft forever preferred_lft forever
function _wifiIPParse(lines: string[]): string {
  // parse
  lines = lines.filter((r) => r.startsWith("inet"));
  const ips = lines.map<string>((line) => {
    const temp = line.split(/\s+/);
    const ip = temp[1].split("/").shift() || "";
    return ip;
  });
  // remove ipv6
  const ip = ips.filter((r) => r.indexOf("::") === -1).shift() || "";
  return ip;
}

export async function tcpIp(id: string, port: number): Promise<boolean> {
  const s = `adb -s ${id} tcpip ${port}`;
  const res = await c(`adb -s ${id} tcpip ${port}`);
  return res === `restarting in TCP mode port: ${port}`;
}

export function connect(id: string, ip: string, port: number): boolean {
  const s = `adb -s ${id} connect ${ip}:${port}`;
  const res = cSync(s);
  return res === `connected to ${ip}:${port}`;
}

export function screencap(id: string): string {
  const path = `/sdcard/screen${Date.now()}.png`;
  const s = `adb -s ${id} shell screencap ${path}`;
  cmdSync(s);
  return path;
}
