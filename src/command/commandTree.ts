/*
 * @FilePath     : /adb-helper/src/command/commandTree.ts
 * @Date         : 2021-09-04 11:58:44
 * @Author       : jawa0919 <jawa0919@163.com>
 * @Description  : 命令行历史树
 */

import { commands, ExtensionContext, window } from "vscode";
import { c } from "../util/c";
import { CommandProvider } from "./commandProvider";

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
