/*
 * @FilePath     : /adb-helper/src/tree/managerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : managerTree
 */

import { commands, Event, EventEmitter, ExtensionContext, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem, window } from "vscode";
import { pm } from "../command/pm";
import { IApk, IDevice } from "../type";

export class ManagerTree {
  provider: ManagerProvider;

  constructor(context: ExtensionContext, device: IDevice) {
    console.debug("ManagerTree constructor");
    const provider = new ManagerProvider(device);
    context.subscriptions.push(window.createTreeView("adb-helper.AppManager", { treeDataProvider: provider }));
    this.provider = provider;

    commands.registerCommand("adb-helper.AppManager.Refresh", () => {
      console.log("AppManager.Refresh");
      provider.refresh();
    });
    commands.registerCommand("adb-helper.AppManager.Install", () => {
      console.log("AppManager.Install");
    });

    commands.registerCommand("adb-helper.AppManager.Install_r_t", async (r) => {
      console.log("AppManager.Install_r_t");
    });
    commands.registerCommand("adb-helper.AppManager.Uninstall", async (r) => {
      console.log("AppManager.Uninstall");
    });
    commands.registerCommand("adb-helper.AppManager.Uninstall_k", async (r) => {
      console.log("AppManager.Uninstall_k");
    });
    commands.registerCommand("adb-helper.AppManager.Clear", async (r) => {
      console.log("AppManager.Clear");
    });
    commands.registerCommand("adb-helper.AppManager.ExportApk", async (r) => {
      console.log("AppManager.ExportApk");
    });
  }

  refreshTree(args: string) {
    this.provider.args = args;
    this.provider.refresh();
  }
}

export class ManagerProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  constructor(readonly device: IDevice, public args = "") {}

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    if (this.args === "") {
      return Promise.resolve([new TreeItem("Explorer Loading...")]);
    }
    return new Promise<TreeItem[]>(async (resolve) => {
      const fileList = await pm(this.device.id, this.args).catch((err) => {
        resolve([new TreeItem(err)]);
        return [] as IApk[];
      });
      let treeItemList = fileList.map((r) => {
        let item = new TreeItem(r.name);
        item.iconPath = new ThemeIcon("symbol-constructor");
        item.id = r.name;
        item.tooltip = r.path;
        return item;
      });
      resolve(treeItemList);
    });
  }
}
