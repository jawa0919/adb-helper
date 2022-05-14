/*
 * @FilePath     : /src/core/controller/FileController.ts
 * @Date         : 2022-05-14 20:13:09
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : FileController
 */

import { commands, Disposable, ExtensionContext } from "vscode";

export class FileController implements Disposable {
  constructor(public context: ExtensionContext) {
    /// commands
  }
  dispose() {}
}
