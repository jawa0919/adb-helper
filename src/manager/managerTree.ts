/*
 * @FilePath     : /adb-helper/src/manager/managerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : managerTree
 */

import { commands, ExtensionContext, window } from "vscode";
import { clear, install, uninstall } from "../api/pm";
import { pull } from "../api/shellFile";
import { IDevice } from "../type";
import { ManagerProvider } from "./managerProvider";

export class ManagerTree {
  provider: ManagerProvider;

  constructor(context: ExtensionContext, device?: IDevice) {
    console.debug("ManagerTree constructor");
    const provider = new ManagerProvider(device);
    context.subscriptions.push(window.createTreeView("adb-helper.Manager", { treeDataProvider: provider }));
    this.provider = provider;

    commands.registerCommand("adb-helper.Manager.Refresh", () => {
      console.log("AppManager.Refresh");
      provider.refresh();
    });
    commands.registerCommand("adb-helper.Manager.Install", () => {
      console.log("AppManager.Install");
      window.showOpenDialog({ filters: { apk: ["apk"] } }).then(async (res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          let success = await install(provider.device?.id ?? "", fileUri.fsPath);
          if (success) {
            provider.refresh();
            window.showInformationMessage("install Success");
          } else {
            window.showErrorMessage("install Error");
          }
        }
      });
    });

    commands.registerCommand("adb-helper.Manager.Install_r_t", async (r) => {
      console.log("AppManager.Install_r_t");
      window.showOpenDialog({ filters: { apk: ["apk"] } }).then(async (res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          let success = await install(provider.device?.id ?? "", fileUri.fsPath, "-t -r");
          if (success) {
            provider.refresh();
            window.showInformationMessage("install Success");
          } else {
            window.showErrorMessage("install Error");
          }
        }
      });
    });
    commands.registerCommand("adb-helper.Manager.Uninstall", async (r) => {
      console.log("AppManager.Uninstall");
      window.showInformationMessage("Do you want uninstall this apk?", { modal: true, detail: r.id }, ...["Yes"]).then(async (answer) => {
        if (answer === "Yes") {
          let success = await uninstall(provider.device?.id ?? "", r.id);
          if (success) {
            provider.refresh();
            window.showInformationMessage("Delete Success");
          } else {
            window.showErrorMessage("Delete Error");
          }
        }
      });
    });
    commands.registerCommand("adb-helper.Manager.Uninstall_k", async (r) => {
      console.log("AppManager.Uninstall_k");
      window.showInformationMessage("Do you want uninstall this apk?", { modal: true, detail: r.id }, ...["Yes"]).then(async (answer) => {
        if (answer === "Yes") {
          let success = await uninstall(provider.device?.id ?? "", r.id, "-k");
          if (success) {
            provider.refresh();
            window.showInformationMessage("Delete Success");
          } else {
            window.showErrorMessage("Delete Error");
          }
        }
      });
    });
    commands.registerCommand("adb-helper.Manager.Clear", async (r) => {
      console.log("AppManager.Clear");
      window.showInformationMessage("Do you want clear this apk data?", { modal: true, detail: r.id }, ...["Yes"]).then(async (answer) => {
        if (answer === "Yes") {
          let success = await clear(provider.device?.id ?? "", r.id);
          if (success) {
            provider.refresh();
            window.showInformationMessage("clear Success");
          } else {
            window.showErrorMessage("clear Error");
          }
        }
      });
    });
    commands.registerCommand("adb-helper.Manager.ExportApk", async (r) => {
      console.log("AppManager.ExportApk");
      let path = r.tooltip;
      window.showOpenDialog({ canSelectFolders: true }).then((res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          let success = pull(provider.device?.id ?? "", path, fileUri.fsPath + "\\" + r.id + ".apk");
          if (success) {
            window.showInformationMessage("export Success");
          } else {
            window.showErrorMessage("export Error");
          }
        }
      });
    });
  }

  setDevice(device: IDevice) {
    this.provider.device = device;
  }

  refreshTree(args: string) {
    this.provider.args = args;
    this.provider.refresh();
  }
}
