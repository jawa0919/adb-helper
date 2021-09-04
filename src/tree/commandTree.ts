/*
 * @FilePath     : /adb-helper/src/tree/commandTree.ts
 * @Date         : 2021-09-04 11:58:44
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : 命令树
 */

import { commands, Event, EventEmitter, ExtensionContext, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem, window } from "vscode";
import { c } from "../util";

export class CommandTree {
  constructor(context: ExtensionContext) {
    console.debug("HistoryTree constructor");
    const commandHistory = context.globalState.get<string[]>("adb-helper.CommandHistory") ?? [];
    const provider = new CommandProvider(commandHistory);
    window.registerTreeDataProvider("adb-helper.Command", provider);

    commands.registerCommand("adb-helper.Command.Refresh", () => {
      console.log("Command.Refresh");
      const commandHistory = context.globalState.get<string[]>("adb-helper.CommandHistory") ?? [];
      provider.history = commandHistory;
      provider.refresh();
    });
    commands.registerCommand("adb-helper.Command.RunCommand", async () => {
      console.log("Command.Run");
      let commandString = await window.showInputBox({
        placeHolder: "ADB Command",
        validateInput: (text) => {
          return text.startsWith("adb") ? "" : text;
        },
      });

      if (commandString) {
        commandString = commandString.trim();
        await c(commandString);
        const commandHistory = context.globalState.get<string[]>("adb-helper.CommandHistory") ?? [];
        commandHistory.push(commandString);
        const commandHistorySet = new Set(commandHistory);
        context.globalState.update("adb-helper.CommandHistory", [...commandHistorySet]);
        commands.executeCommand("adb-helper.Devices.Refresh");
        commands.executeCommand("adb-helper.Explorer.Refresh");
        commands.executeCommand("adb-helper.Manager.Refresh");
        commands.executeCommand("adb-helper.Command.Refresh");
      }
    });

    commands.registerCommand("adb-helper.Command.RunHistoryCommand", async (r) => {
      console.log("Command.RunHistory");
      const commandString: string = r.label;

      await c(commandString);
      const commandHistory = context.globalState.get<string[]>("adb-helper.CommandHistory") ?? [];
      commandHistory.push(commandString);
      const commandHistorySet = new Set(commandHistory);
      context.globalState.update("adb-helper.CommandHistory", [...commandHistorySet]);
      commands.executeCommand("adb-helper.Devices.Refresh");
      commands.executeCommand("adb-helper.Explorer.Refresh");
      commands.executeCommand("adb-helper.Manager.Refresh");
      commands.executeCommand("adb-helper.Command.Refresh");
    });
  }
}

export class CommandProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  constructor(public history: string[] = []) {}

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    if (this.history.length === 0) {
      return Promise.resolve([new TreeItem("No Find Command History")]);
    }

    let treeItemList = this.history.map((val: string) => {
      let item = new TreeItem(val);
      item.iconPath = new ThemeIcon("bookmark");
      return item;
    });

    return Promise.resolve(treeItemList);
  }
}
