import * as vscode from "vscode";
import * as data from "./json/trackingdataclass";
import { startTracking, stopTracking } from "./code/trackingfunctions";
import { fetchLogs } from "./graph/fetchingLogs";
import path from "path";

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

  let disposable = vscode.commands.registerCommand(
    "time-tracker.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from time tracker!");
    }
  );

  // disposable = vscode.commands.registerCommand(
  //   "time-tracker.showGraph",
  //   async () => {
  //     const graphFolderPath = path.posix.join(
  //       context.extensionPath,
  //       "src",
  //       "graph"
  //     );
  //     const graphFolderUri = vscode.Uri.parse(`file://${graphFolderPath}`);

  //     console.log("Graph Folder Path (String):", graphFolderPath);
  //     console.log("Graph Folder URI:", graphFolderUri);

  //     const panel = vscode.window.createWebviewPanel(
  //       "timeTrackerGraph",
  //       "Time Tracker Graph",
  //       vscode.ViewColumn.One,
  //       {
  //         enableScripts: true,
  //         localResourceRoots: [graphFolderUri], // The crucial fix: Put the Uri in an ARRAY!
  //       }
  //     );
  //     const graphJsUri = panel.webview.asWebviewUri(
  //       vscode.Uri.joinPath(graphFolderUri, "graph.js")
  //     ); // Get URI for graph.js
  //     console.log("graph.js URI:", graphJsUri); // Log it for debugging

  //     await fetchLogs(panel);
  //     // Set the HTML content of the webview:
  //     panel.webview.html = `<!DOCTYPE html>
  //   <html>
  //   <head>
  //       <title>Time Tracker Graph</title>
  //   </head>
  //      <body>
  //       <h1>Time Spent on Languages</h1>
  //       <div id="graph-container"></div>
  //       <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  //       <script src="graph.js"></script> </body>
  //   </html>`;

  //     // Handle messages from the webview (if needed):
  //     panel.webview.onDidReceiveMessage(
  //       (message) => {
  //         // ... handle messages from the webview ...
  //       },
  //       undefined,
  //       context.subscriptions
  //     );

  //     // Send a message to the webview (if needed):
  //     panel.webview.postMessage({
  //       command: "updateData",
  //       data: {
  //         /* your data here */
  //       },
  //     });
  //   }
  // );

  context.subscriptions.push(disposable);
}
export async function deactivate(context: vscode.ExtensionContext) {
  await stopTracking(context, true);
}
