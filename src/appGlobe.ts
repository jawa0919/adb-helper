import { ExtensionContext } from "vscode";

let _ctx: ExtensionContext;

function setContext(context: ExtensionContext) {
  _ctx = context;
}

function getContext(): ExtensionContext {
  return _ctx;
}

export { setContext, getContext };
