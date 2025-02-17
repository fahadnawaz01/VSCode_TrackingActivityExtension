import vscode from "vscode";

async function fetchLogsFromGitHub(
  owner: string,
  repo: string,
  token: string,
  basePath = ""
): Promise<any[]> {
  const { Octokit } = await import("@octokit/rest");
  const octokit = new Octokit({ auth: token });
  const logs: any[] = []; // Array to store all JSON logs

  async function traverseDirectory(path: string) {
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.type === "dir") {
            await traverseDirectory(item.path);
          } else if (
            item.type === "file" &&
            /^\d{2}-\d{2}-\d{2}-\d{3}$/.test(item.name)
          ) {
            // Check for JSON files
            try {
              const fileResponse = await octokit.repos.getContent({
                owner,
                repo,
                path: item.path,
              });
              if (fileResponse.data && "content" in fileResponse.data) {
                const content = Buffer.from(
                  fileResponse.data.content,
                  "base64"
                ).toString();
                logs.push(JSON.parse(content));
              } else {
                console.error(`Invalid response for file: ${item.path}`);
              }
            } catch (fileError) {
              console.error(`Error fetching file ${item.path}:`, fileError);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching content for path ${path}:`, error);
    }
  }

  await traverseDirectory(basePath); // Start the recursive traversal from the base path
  return logs;
}

export async function fetchLogs(panel: vscode.WebviewPanel) {
  const config = vscode.workspace.getConfiguration("timeTracker");
  const owner = config.get<string>("gitUsername");
  const repo = config.get<string>("repo");
  const githubToken = config.get<string>("gitHubToken");

  if (owner && repo && githubToken) {
    const logs = await fetchLogsFromGitHub(owner, repo, githubToken);
    console.log("Fetched logs:", logs);
    // ... now you have all your JSON logs in the 'logs' array ...
    if (logs) {
      // Send logs to the webview
      panel.webview.postMessage({ command: "updateData", data: logs });
    }
  }
}
