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

  pathList: string[];
  provider: ExplorerProvider;

  constructor(context: ExtensionContext, device?: IDevice) {
    console.debug("ExplorerTree constructor");

    let path: string[] = workspace.getConfiguration().get("adb-helper.explorerRootPathList") ?? ["/"];
    this.pathList = [ExplorerTree.defPath].concat(path);

    this.provider = new ExplorerProvider(device);
    window.registerTreeDataProvider("adb-helper.Explorer", this.provider);

    commands.registerCommand("adb-helper.Explorer.Refresh", () => {
      console.log("Explorer.Refresh");
      this.showProgress("Explorer.Refresh running!", async () => {
        await waitMoment();
        this.refreshTree("");
        return;
      });
    });

    commands.registerCommand("adb-helper.Explorer.RootPath", () => {
      console.log("Explorer.RootPath");
      const quickPick = window.createQuickPick();
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.placeholder = "Swap RootPath";
      quickPick.items = this.pathList.map((p) => {
        return { label: `$(file-directory) ${p}` };
      });
      quickPick.onDidChangeSelection((s) => {
        quickPick.hide();
        if (s[0]) {
          this.provider.root = s[0].label.split(" ").pop() ?? ExplorerTree.defPath;
          commands.executeCommand("adb-helper.Explorer.Refresh");
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
            commands.executeCommand("adb-helper.Explorer.Refresh");
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
              commands.executeCommand("adb-helper.Explorer.Refresh");
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
              commands.executeCommand("adb-helper.Explorer.Refresh");
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
            commands.executeCommand("adb-helper.Explorer.Refresh");
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
      window.showInformationMessage("filePath set your clipboard");
    });
  }

  setDevice(device: IDevice) {
    this.provider.device = device;
  }

  refreshTree(args: string) {
    this.provider.refresh();
  }

  showProgress<T>(title: string, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Thenable<T>) {
    window.withProgress<T>({ location: ProgressLocation.Notification, title, cancellable: false }, task);
  }
}
