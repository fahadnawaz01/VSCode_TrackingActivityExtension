import * as vscode from "vscode";
import * as data from "./logging/trackingdataclass";
import { startTracking, stopTracking } from "./logging/trackingfunctions";
import { fetchLogs } from "./graph/fetchingLogs";
import path from "path";

let timeout: NodeJS.Timeout | null = null;
const debounceInterval = 5000;
let timer: number = 0;
const trackingdata = data;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "time-tracker" is now active!');
  vscode.window.showInformationMessage("Activity tracking is on!");
  startTracking(context, true);

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
    "time-tracker.showGraph",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "timeTrackerGraph",
        "Time Tracker Graph",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, "src")),
          ], // The crucial fix: Put the Uri in an ARRAY!
        }
      );
      const graphJsUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "src", "graph", "graph.js")
      );

      const html = getWebviewContent(panel.webview, graphJsUri);
      console.log("Generated HTML:", html); // Log the HTML!

      await fetchLogs(panel);
      // Set the HTML content of the webview:
      panel.webview.html = html;

      // Handle messages from the webview (if needed):
      panel.webview.onDidReceiveMessage(
        (message) => {
          // ... handle messages from the webview ...
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}
export async function deactivate(context: vscode.ExtensionContext) {
  await stopTracking(context, true);
}

// ... (Your extension.ts code)

function getWebviewContent(
  webview: vscode.Webview,
  graphJsUri: vscode.Uri
): string {
  return `<!DOCTYPE html>
<html>
<head>
    <title>Time Tracker Graph</title>
    </head>
<body>
    <h1>Time Spent on Languages</h1>

    <div id="controls">
        <label for="graph-type">Graph Type:</label>
        <select id="graph-type">
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
        </select>

        <label for="year-select">Year:</label>
        <select id="year-select">
            </select>

        <label for="month-select">Month:</label>
        <select id="month-select">
            </select>
    </div>

    <canvas id="graph-container"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="${graphJsUri}" defer></script> </body>
</html>`;
}
// ... (rest of your code)
