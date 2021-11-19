/*
 * @FilePath     : /src/AdbDaemon.ts
 * @Date         : 2021-11-19 15:23:35
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  :
 */

import { StdIOService } from "./stdio_service";

export class AdbDaemon extends StdIOService<string> {
  constructor() {
    super();
    this.createProcess("E:/sdk/flutter2.5.3/bin", "flutter", ["daemon"]);
  }

  public deviceEnable(): Thenable<void> {
    return this.sendRequest("device.enable");
  }
}
