/*
 * @FilePath     : /src/explorer/explorerTree.ts
 * @Date         : 2021-11-20 23:07:26
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : explorerTree
 */

import { CancellationToken, commands, env, ExtensionContext, Progress, ProgressLocation, window, workspace } from "vscode";
import { mkdir, pull, push, rm } from "../command/file";
import { IDevice } from "../type";
import { waitMoment } from "../util/util";
import { ExplorerProvider } from "./explorerProvider";

export class ExplorerTree {
  static defPath = "/sdcard/";

  device?: IDevice;

  pathList: string[];
  provider: ExplorerProvider;

  setRoot(root?: string) {
    this.provider.root = root ?? ExplorerTree.defPath;
  }

  setDevice(currentDevice?: IDevice) {
    this.device = currentDevice;
    this.provider.device = currentDevice;
  }

  refreshTree(args?: any) {
    this.provider.refresh();
  }

  constructor(private context: ExtensionContext, currentDevice?: IDevice) {
    console.debug("ExplorerTree constructor");

    let path: string[] = workspace.getConfiguration().get("adb-helper.explorerRootPathList") ?? [];
    this.pathList = [ExplorerTree.defPath].concat(path);

    this.device = currentDevice;

    this.provider = new ExplorerProvider(ExplorerTree.defPath);
    window.registerTreeDataProvider("adb-helper.Explorer", this.provider);

    this._initCommands();
  }

  private _initCommands() {
    commands.registerCommand("adb-helper.Explorer.Refresh", async (r) => {
      console.log("Explorer.Refresh");
      if (r === true) {
        this.showProgress("Explorer.Refresh running!", async () => {
          await waitMoment();
          this.refreshTree();
          return;
        });
      } else {
        await waitMoment();
        this.refreshTree();
      }
    });

    commands.registerCommand("adb-helper.Explorer.SwapRootPath", () => {
      console.log("Explorer.SwapRootPath");
      const quickPick = window.createQuickPick();
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.placeholder = "Swap RootPath";
      quickPick.items = this.pathList.map((p) => {
        return { label: `$(file-directory) ${p}` };
      });
      quickPick.onDidChangeSelection((s) => {
        quickPick.hide();
        if (s[0]) {
          this.setRoot(s[0].label.split(" ").pop() ?? ExplorerTree.defPath);
          commands.executeCommand("adb-helper.Explorer.Refresh", true);
        }
      });
      quickPick.show();
    });

    commands.registerCommand("adb-helper.Explorer.NewDirectory", async (r) => {
      console.log("Explorer.NewDirectory");
      const id: string = r.resourceUri.authority;
      const path: string = r.resourceUri.path;
      window.showInputBox({ placeHolder: "Directory Name" }).then(async (res) => {
        this.showProgress("Explorer.NewDirectory running!", async () => {
          await waitMoment();
          let success = mkdir(id, path + `${res}/`);
          if (success) {
            commands.executeCommand("adb-helper.Explorer.Refresh", true);
            window.showInformationMessage("NewDirectory Success");
          } else {
            window.showErrorMessage("NewDirectory Error");
          }
          return;
        });
      });
    });

    commands.registerCommand("adb-helper.Explorer.SaveAs", async (r) => {
      console.log("Explorer.SaveAs");
      const id: string = r.resourceUri.authority;
      const path: string = r.resourceUri.path;
      window.showOpenDialog({ canSelectFolders: true }).then((res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          this.showProgress("Explorer.SaveAs running!", async () => {
            await waitMoment();
            let success = pull(id, path, fileUri!.fsPath);
            if (success) {
              window.showInformationMessage("SaveAs Success");
            } else {
              window.showErrorMessage("SaveAs Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Explorer.UploadFile", async (r) => {
      console.log("Explorer.UploadFile");
      const id: string = r.resourceUri.authority;
      const path: string = r.resourceUri.path;
      window.showOpenDialog().then((res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          this.showProgress("Explorer.UploadFile running!", async () => {
            await waitMoment();
            let success = push(id, fileUri!.fsPath, path);
            if (success) {
              commands.executeCommand("adb-helper.Explorer.Refresh", true);
              window.showInformationMessage("UploadFile Success");
            } else {
              window.showErrorMessage("UploadFile Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Explorer.UploadDirectory", async (r) => {
      console.log("Explorer.UploadDirectory");
      const id: string = r.resourceUri.authority;
      const path: string = r.resourceUri.path;
      window.showOpenDialog({ canSelectFolders: true }).then((res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          this.showProgress("Explorer.UploadDirectory running!", async () => {
            await waitMoment();
            let success = push(id, fileUri!.fsPath, path);
            if (success) {
              commands.executeCommand("adb-helper.Explorer.Refresh", true);
              window.showInformationMessage("UploadDirectory Success");
            } else {
              window.showErrorMessage("UploadDirectory Error");
            }
            return;
          });
        }
      });
    });

    commands.registerCommand("adb-helper.Explorer.Delete", async (r) => {
      console.log("Explorer.Delete");
      const id: string = r.resourceUri.authority;
      const path: string = r.resourceUri.path;
      window.showInformationMessage("Do you want delete this file/directory?", { modal: true, detail: path }, ...["Yes"]).then((answer) => {
        if (answer === "Yes") {
          let success = rm(id, path);
          if (success) {
            commands.executeCommand("adb-helper.Explorer.Refresh", true);
            window.showInformationMessage("Delete Success");
          } else {
            window.showErrorMessage("Delete Error");
          }
        }
      });
    });

    commands.registerCommand("adb-helper.Explorer.CopyPath", async (r) => {
      console.log("Explorer.CopyPath");
      const path: string = r.resourceUri.path;
      env.clipboard.writeText(`${path}`);
      window.showInformationMessage("FilePath Set Your Clipboard");
    });
  }

  showProgress<T>(title: string, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Thenable<T>) {
    window.withProgress<T>({ location: ProgressLocation.Notification, title, cancellable: false }, task);
  }
}
