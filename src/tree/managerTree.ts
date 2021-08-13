/*
 * @FilePath     : /adb-helper/src/tree/managerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : managerTree
 */

import { ExtensionContext } from "vscode";
import { IDevice } from "../type";

export class ManagerTree {
  constructor(context: ExtensionContext, device: IDevice) {
    console.debug("ManagerTree constructor");
  }

  refreshTree(args?: any) {}
}
