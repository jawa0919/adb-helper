/*
 * @FilePath     : /src/core/cmd/bonjour_find.ts
 * @Date         : 2022-05-21 17:42:55
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : bonjour_find
 */

import * as bonjour from "bonjour";
import { logPrint } from "../utils/util";

export function bonjourConnect(onUp?: (service: bonjour.RemoteService) => void): bonjour.Browser {
  logPrint(`🚀 bonjourConnect`);
  return bonjour().find({ type: "adb-tls-connect" }, (service) => {
    console.log(`bonjourConnect`, service);
    onUp?.(service);
  });
}

export function bonjourPairing(onUp?: (service: bonjour.RemoteService) => void): bonjour.Browser {
  logPrint(`🚀 bonjourPairing`);
  return bonjour().find({ type: "adb-tls-pairing" }, (service) => {
    console.log(`bonjourPairing`, service);
    onUp?.(service);
  });
}

export async function simpleBonjourConnect(timeout = 30000): Promise<string[]> {
  logPrint(`🚀 simpleBonjourConnect`);
  return await new Promise((resolve) => {
    const browser = bonjour().find({ type: "adb-tls-connect" }, (service) => {
      console.log(`simpleBonjourConnect`, service);
      resolve([service.name, service.addresses[0], `${service.port}`]);
      browser.stop();
    });
    setTimeout(() => {
      resolve([]);
      logPrint(`🚀 simpleBonjourConnect timeout`);
      browser.stop();
    }, timeout);
  });
}

export async function simpleBonjourPairing(timeout = 30000): Promise<string[]> {
  logPrint(`🚀 simpleBonjourPairing`);
  return await new Promise((resolve) => {
    const browser = bonjour().find({ type: "adb-tls-pairing" }, (service) => {
      console.log(`simpleBonjourPairing`, service);
      resolve([service.name, service.addresses[0], `${service.port}`]);
      browser.stop();
    });
    setTimeout(() => {
      resolve([]);
      logPrint(`🚀 simpleBonjourPairing timeout`);
      browser.stop();
    }, timeout);
  });
}
