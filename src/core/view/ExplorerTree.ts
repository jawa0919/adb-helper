/*
 * @FilePath     : /src/core/view/ExplorerTree.ts
 * @Date         : 2022-05-13 19:58:40
 * @Author       : jawa0919 <jawa0919@163.com>
 * @LastEditors  : jawa0919 <jawa0919@163.com>
 * @Description  : 资源管理器
 */
import { Event, EventEmitter, FileType, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { AppConst } from "../app/AppConst";
import { IDevice } from "../cmd/devices";
import { ls } from "../cmd/ls";

export class ExplorerTree implements TreeDataProvider<TreeItem> {
  constructor(public rootPath: string, public device?: IDevice) {}
  eventEmitter: EventEmitter<TreeItem | TreeItem[] | undefined | void> = new EventEmitter<TreeItem | TreeItem[] | undefined | void>();
  onDidChangeTreeData?: Event<void | TreeItem | TreeItem[] | null | undefined> | undefined = this.eventEmitter.event;
  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (this.device === undefined) return [];
    let rootUri = Uri.from({ scheme: AppConst.scheme, authority: this.device.devId, path: this.rootPath });
    let parentUri = element?.resourceUri || rootUri;
    const children = await ls(parentUri.authority, parentUri.path);
    return children.map(([name, type]) => this.bindFileSystemNode(name, type, parentUri));
  }
  bindFileSystemNode(name: string, fileType: FileType, parentUri: Uri): TreeItem {
    let path = Uri.joinPath(parentUri, name).path;
    const uri = parentUri.with({ path });
    let item = new TreeItem(uri);
    item.tooltip = JSON.stringify(uri);
    if (fileType === FileType.File) {
      item.collapsibleState = TreeItemCollapsibleState.None;
      item.contextValue = "AdbFile";
      item.command = { command: "adb-helper.openFile", title: "Open File", arguments: [{ resourceUri: uri }] };
      // item.command = { command: "vscode.open", title: "Open File", arguments: [uri] };
    } else {
      item.contextValue = "AdbFolder";
      item.collapsibleState = TreeItemCollapsibleState.Collapsed;
    }
    return item;
  }
}
