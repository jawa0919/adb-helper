/*
 * @FilePath     : /adb-helper/src/tree/explorerTree.ts
 * @Date         : 2021-08-12 18:27:59
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : explorerTree
 */

import { commands, env, Event, EventEmitter, ExtensionContext, FileType, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window } from "vscode";
import { ls } from "../command/ls";
import { mkdir, pull, push, rm } from "../command/shellFile";
import { IDevice, IFileStat } from "../type";

export class ExplorerTree {
  provider: ExplorerProvider;

  constructor(context: ExtensionContext, device: IDevice) {
    console.debug("ExplorerTree constructor");
    const provider = new ExplorerProvider(device);
    context.subscriptions.push(window.createTreeView("adb-helper.Explorer", { treeDataProvider: provider }));
    this.provider = provider;

    commands.registerCommand("adb-helper.Explorer.Refresh", () => {
      console.log("Explorer.Refresh");
      provider.refresh();
    });

    commands.registerCommand("adb-helper.Explorer.NewDirectory", async (r) => {
      console.log("Explorer.NewDirectory");
      const id: string = r.resourceUri.authority;
      const path: string = r.resourceUri.path;
      window.showInputBox({ placeHolder: "Directory Name" }).then((res) => {
        console.log(res);
        let success = mkdir(id, path + `${res}/`);
        if (success) {
          provider.refresh();
        } else {
          window.showErrorMessage("New Directory Error");
        }
      });
    });
    commands.registerCommand("adb-helper.Explorer.SaveAs", async (r) => {
      console.log("Explorer.SaveAs");
      const id: string = r.resourceUri.authority;
      const path: string = r.resourceUri.path;
      window.showOpenDialog({ canSelectFolders: true }).then((res) => {
        let fileUri = res?.shift();
        if (fileUri) {
          window.showInformationMessage("SaveAs......ing");
          let success = pull(id, path, fileUri.fsPath);
          if (success) {
            window.showInformationMessage("SaveAs Success");
          } else {
            window.showErrorMessage("SaveAs Error");
          }
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
          window.showInformationMessage("UploadFile......ing");
          let success = push(id, fileUri.fsPath, path);
          if (success) {
            provider.refresh();
            window.showInformationMessage("Upload File Success");
          } else {
            window.showErrorMessage("Upload File Error");
          }
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
          window.showInformationMessage("UploadDirectory......ing");
          let success = push(id, fileUri.fsPath, path);
          if (success) {
            provider.refresh();
            window.showInformationMessage("Upload Directory Success");
          } else {
            window.showErrorMessage("Upload Directory Error");
          }
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
            provider.refresh();
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
      window.showInformationMessage("file path set your clipboard");
    });
  }

  setDevice(device: IDevice) {
    this.provider.device = device;
  }

  refreshTree(root: string) {
    this.provider.root = root;
    this.provider.refresh();
  }
}

export class ExplorerProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }
  constructor(public device: IDevice, public root = "") {}

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    if (this.root === "") {
      return Promise.resolve([new TreeItem("Explorer Loading...")]);
    }
    return new Promise<TreeItem[]>(async (resolve) => {
      const path = element?.resourceUri?.path ?? this.root;
      const fileList = await ls(this.device.id, path).catch((err) => {
        resolve([new TreeItem(`${err}`)]);
        return [] as IFileStat[];
      });

      const directoryType = [FileType.Directory, FileType.SymbolicLink];
      let treeItemList = fileList.map((r) => {
        let isDirectory = directoryType.includes(r.type);
        let item = new TreeItem(r.uri, isDirectory ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);
        item.contextValue = isDirectory ? "directory" : "file";
        return item;
      });
      resolve(treeItemList);
    });
  }
}
