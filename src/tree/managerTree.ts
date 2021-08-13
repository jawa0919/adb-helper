/*
 * @FilePath     : /adb-helper/src/tree/managerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : managerTree
 */

import { commands, Event, EventEmitter, ExtensionContext, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem, window } from "vscode";
import { clear, install, list, uninstall } from "../command/pm";
import { pull } from "../command/shellFile";
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
      window.showOpenDialog({ filters: { apk: ["apk"] } }).then(async (res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          let success = await install(provider.device.id, fileUri.fsPath);
          if (success) {
            provider.refresh();
            window.showInformationMessage("install Success");
          } else {
            window.showErrorMessage("install Error");
          }
        }
      });
    });

    commands.registerCommand("adb-helper.AppManager.Install_r_t", async (r) => {
      console.log("AppManager.Install_r_t");
      window.showOpenDialog({ filters: { apk: ["apk"] } }).then(async (res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          let success = await install(provider.device.id, fileUri.fsPath, "-t -r");
          if (success) {
            provider.refresh();
            window.showInformationMessage("install Success");
          } else {
            window.showErrorMessage("install Error");
          }
        }
      });
    });
    commands.registerCommand("adb-helper.AppManager.Uninstall", async (r) => {
      console.log("AppManager.Uninstall");
      window.showInformationMessage("Do you want uninstall this apk?", { modal: true, detail: r.id }, ...["Yes"]).then(async (answer) => {
        if (answer === "Yes") {
          let success = await uninstall(provider.device.id, r.id);
          if (success) {
            provider.refresh();
            window.showInformationMessage("Delete Success");
          } else {
            window.showErrorMessage("Delete Error");
          }
        }
      });
    });
    commands.registerCommand("adb-helper.AppManager.Uninstall_k", async (r) => {
      console.log("AppManager.Uninstall_k");
      window.showInformationMessage("Do you want uninstall this apk?", { modal: true, detail: r.id }, ...["Yes"]).then(async (answer) => {
        if (answer === "Yes") {
          let success = await uninstall(provider.device.id, r.id, "-k");
          if (success) {
            provider.refresh();
            window.showInformationMessage("Delete Success");
          } else {
            window.showErrorMessage("Delete Error");
          }
        }
      });
    });
    commands.registerCommand("adb-helper.AppManager.Clear", async (r) => {
      console.log("AppManager.Clear");
      window.showInformationMessage("Do you want clear this apk data?", { modal: true, detail: r.id }, ...["Yes"]).then(async (answer) => {
        if (answer === "Yes") {
          let success = await clear(provider.device.id, r.id);
          if (success) {
            provider.refresh();
            window.showInformationMessage("clear Success");
          } else {
            window.showErrorMessage("clear Error");
          }
        }
      });
    });
    commands.registerCommand("adb-helper.AppManager.ExportApk", async (r) => {
      console.log("AppManager.ExportApk");
      let path = r.tooltip;
      window.showOpenDialog({ canSelectFolders: true }).then((res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          let success = pull(provider.device.id, path, fileUri.fsPath + "\\" + r.id + ".apk");
          if (success) {
            window.showInformationMessage("export Success");
          } else {
            window.showErrorMessage("export Error");
          }
        }
      });
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
      const fileList = await list(this.device.id, this.args).catch((err) => {
        resolve([new TreeItem(`${err}`)]);
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
