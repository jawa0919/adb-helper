/*
 * @FilePath     : /src/command/device.ts
 * @Date         : 2021-11-21 17:10:55
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : device
 */

import { logPrint } from "../util/logs";
import { ww } from "../util/util";

export function deviceWifiIP(id: string): string {
  try {
    const res = ww("adb", ["-s", id, "shell", "ip", "addr", "show", "wlan0"]);
    let lines = res.stdout.trim().split(/\n|\r\n/);
    lines = lines.map((r) => r.trim()).filter((r) => r !== "");
    return _wifiIPParse(lines);
  } catch (error) {
    logPrint(`deviceWifiIP.catch\n${error}`);
    return "";
  }
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

export function tcpIp(id: string, port: number): boolean {
  try {
    const res = ww("adb", ["-s", id, "tcpip", `${port}`]);
    return res.stdout === `restarting in TCP mode port: ${port}`;
  } catch (error) {
    logPrint(`deviceTcpIp.catch\n${error}`);
    return false;
  }
}

export function connect(id: string, ip: string, port: number): boolean {
  try {
    const pro = ww("adb", ["-s", id, "connect", `${ip}:${port}`]);
    return pro.stdout.startsWith("connected to");
  } catch (error) {
    logPrint(`connect.catch\n${error}`);
    return false;
  }
}

export function connectHost(host: string): boolean {
  try {
    const pro = ww("adb", ["connect", host]);
    return pro.stdout.startsWith("connected to");
  } catch (error) {
    logPrint(`connectHost.catch\n${error}`);
    return false;
  }
}

export function screencap(id: string): string {
  const path = `/sdcard/screen${Date.now()}.png`;
  try {
    ww("adb", ["-s", id, "shell", "screencap", `${path}`]);
    return path;
  } catch (error) {
    logPrint(`screencap.catch\n${error}`);
    return "";
  }
}
