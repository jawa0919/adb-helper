/*
 * @FilePath     : /src/manager/managerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : managerTree
 */

import { join } from "path";
import { CancellationToken, commands, ExtensionContext, Progress, ProgressLocation, window, workspace } from "vscode";
import { pull } from "../command/file";
import { clear, install, pmList, uninstall } from "../command/pm";
import { IDevice } from "../type";
import { waitMoment } from "../util/util";
import { ManagerProvider } from "./managerProvider";

export class ManagerTree {
  static defType = "-3"; // Third party package

  private device?: IDevice;
  private type = ManagerTree.defType;
  private provider: ManagerProvider;

  setDevice(currentDevice?: IDevice) {
    this.device = currentDevice;
    this.provider.device = currentDevice;
  }

  refreshTree(args?: any) {
    this.provider.refresh();
  }

  constructor(private context: ExtensionContext, currentDevice?: IDevice, currentType?: string) {
    console.debug("ManagerTree constructor");
    this.device = currentDevice;
    this.type = currentType ?? ManagerTree.defType;
    this.provider = new ManagerProvider(currentDevice);

    window.registerTreeDataProvider("adb-helper.Manager", this.provider);

    this._initCommands();
  }

  private _initCommands() {
    commands.registerCommand("adb-helper.Manager.Refresh", async (r) => {
      console.log("Manager.Refresh");
      if (r === true) {
        this.showProgress("Manager.Refresh running!", async () => {
          await waitMoment();
          if (this.device) {
            this.provider.device = this.device;
            const apkList = pmList(this.device.id, this.type);
            this.provider.apkList.length = 0;
            this.provider.apkList.push(...apkList);
          }
          this.provider.refresh();
          return;
        });
      } else {
        await waitMoment();
        if (this.device) {
          this.provider.device = this.device;
          const apkList = pmList(this.device.id, this.type);
          this.provider.apkList.length = 0;
          this.provider.apkList.push(...apkList);
        }
        this.provider.refresh();
      }
    });

    commands.registerCommand("adb-helper.Manager.Install", async () => {
      console.log("Manager.Install");
      window.showOpenDialog({ filters: { apk: ["apk"] } }).then(async (res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          this.showProgress("Manager.Install running!", async () => {
            await waitMoment();
            let success = await install(this.device?.id ?? "", fileUri!.fsPath);
            if (success) {
              window.showInformationMessage("Install Success");
              commands.executeCommand("adb-helper.Manager.Refresh", true);
            } else {
              window.showErrorMessage("Install Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Manager.Install_r_t", async () => {
      console.log("Manager.Install_r_t");
      window.showOpenDialog({ filters: { apk: ["apk"] } }).then(async (res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          this.showProgress("Manager.Install_r_t running!", async () => {
            await waitMoment();
            let success = await install(this.provider.device?.id ?? "", fileUri!.fsPath, ["-t", "-r"]);
            if (success) {
              window.showInformationMessage("Install_r_t Success");
              commands.executeCommand("adb-helper.Manager.Refresh", true);
            } else {
              window.showErrorMessage("Install_r_t Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Manager.Uninstall", async (r) => {
      console.log("Manager.Uninstall");
      window.showInformationMessage("Do you want uninstall this apk?", { modal: true, detail: r.id }, ...["Yes"]).then(async (v) => {
        if (v === "Yes") {
          this.showProgress("Manager.Uninstall running!", async () => {
            await waitMoment();
            let success = await uninstall(this.device?.id ?? "", r.id);
            if (success) {
              window.showInformationMessage("Uninstall Success");
              commands.executeCommand("adb-helper.Manager.Refresh", true);
            } else {
              window.showErrorMessage("Uninstall Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Manager.Wipe", async (r) => {
      console.log("Manager.Wipe");
      window.showInformationMessage("Do you want wipe this apk data?", { modal: true, detail: r.id }, ...["Yes"]).then(async (v) => {
        if (v === "Yes") {
          this.showProgress("Manager.Wipe running!", async () => {
            await waitMoment();
            let success = await clear(this.device?.id ?? "", r.id);
            if (success) {
              window.showInformationMessage("Wipe Success");
              commands.executeCommand("adb-helper.Manager.Refresh", true);
            } else {
              window.showErrorMessage("Wipe Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Manager.Export", async (r) => {
      console.log("Manager.Export");
      window.showOpenDialog({ canSelectFolders: true }).then((res) => {
        let fileUri = res?.shift();
        let locPath = join(fileUri!.fsPath, r.id + ".apk");
        if (fileUri) {
          this.showProgress("Manager.Export running!", async () => {
            await waitMoment();
            let success = pull(this.device?.id ?? "", r.tooltip, locPath);
            if (success) {
              window.showInformationMessage("Export Success");
            } else {
              window.showErrorMessage("Export Error");
            }
            return;
          });
        }
      });
    });
  }

  showProgress<T>(title: string, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Thenable<T>) {
    window.withProgress<T>({ location: ProgressLocation.Notification, title, cancellable: false }, task);
  }
}
