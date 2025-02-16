import * as vscode from "vscode";
import * as data from "./json/trackingdataclass";
import { startTracking, stopTracking } from "./code/trackingfunctions";

let timeout: NodeJS.Timeout | null = null;
const debounceInterval = 5000;
let timer: number = 0;
const trackingdata = data;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "time-tracker" is now active!');

  
  vscode.workspace.onDidOpenTextDocument((event) => {
    startTracking(context, true);
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    startTracking(context);
  });

  vscode.window.onDidChangeWindowState((e) => {
    if (e.focused) {
      if (vscode.window.activeTextEditor) {
        startTracking(context);
      }
    } else {
      stopTracking(context);
    }
  });

  const disposable = vscode.commands.registerCommand(
    "time-tracker.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from time tracker!");
    }
  );

  context.subscriptions.push(disposable);
}
export async function deactivate(context: vscode.ExtensionContext) {
  await stopTracking(context, true);
}
