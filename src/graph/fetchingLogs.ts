import vscode from "vscode";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

async function fetchLogsFromGitHub(
  owner: string,
  repo: string,
  token: string,
  basePath = ""
): Promise<any[]> {
  const { Octokit } = await import("@octokit/rest");
  const octokit = new Octokit({ auth: token });
  const logs: any = {}; // Array to store all JSON logs

  async function traverseDirectory(path: string) {
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(response.data)) {
        for (const item of response.data) {
          if (
            (item.type === "dir" && /^\d{4}$/.test(item.name)) ||
            months.includes(item.name) ||
            /^\d{2}$/.test(item.name)
          ) {
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
                const pathSplit = item.path.split("/");
                const year = pathSplit[0];
                const month = pathSplit[1];
                const day = pathSplit[2];

                if (!logs[year]) {
                  logs[year] = {};
                }
                if (!logs[year][month]) {
                  logs[year][month] = {};
                }
                if (!logs[year][month][day]) {
                  logs[year][month][day] = [];
                }

                console.log(item.path);
                logs[year][month][day].push(JSON.parse(content));
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

const data: Record<string, number> = {};
function transformData(logs: any): Record<string, number> {
  if (!Array.isArray(logs)) {
    console.log(logs);
    for (const key in logs) {
      allTimeTransformData(logs[key]);
    }
  } else {
    for (const log of logs) {
      for (const i in log.fileType) {
        if (data[log.fileType[i][0]] && Array.isArray(log.fileType[i])) {
          data[log.fileType[i][0]] += log.fileType[i][1];
        } else if (Array.isArray(log.fileType[i])) {
          data[log.fileType[i][0]] = log.fileType[i][1];
        }
      }
    }
  }

  return data;
}

function allTimeTransformData(logs: any): {
  labels: string[];
  values: number[];
} {
  const labels: string[] = [];
  const values: number[] = [];
  const data: Record<string, number> = transformData(logs);

  for (const label in data) {
    if (data.hasOwnProperty(label)) {
      labels.push(label);
      values.push(data[label]);
    }
  }

  return { labels, values };
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
      panel.webview.postMessage({
        command: "updateData",
        data: allTimeTransformData(logs),
      });
    }
  }
}
