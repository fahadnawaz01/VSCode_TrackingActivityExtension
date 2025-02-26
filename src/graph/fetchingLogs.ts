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

let logFlag = false; //true when the data is already present in the log

let yearList: string[] = [];
let monthList: string[] = [];

async function fetchLogsFromGitHub(
  owner: string,
  repo: string,
  token: string,
  basePath = ""
): Promise<any[]> {
  const { Octokit } = await import("@octokit/rest");
  const octokit = new Octokit({ auth: token });
  const logs: any = {};

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
                  yearList.push(year);
                  logs[year] = {};
                }
                if (!logs[year][month]) {
                  monthList.push(`${month}-${year}`);
                  logs[year][month] = {};
                }
                if (!logs[year][month][day]) {
                  logs[year][month][day] = [];
                }

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

  await traverseDirectory(basePath);
  return logs;
}

let data: Record<string, number> = {};
function transformData(logs: any): Record<string, number> {
  if (!Array.isArray(logs)) {
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

function yearlyTransformData(logs: any, year: string): Record<string, number> {
  const yearlyData: Record<string, number> = {};

  for (const key in logs) {
    if (key === year) {
      data = transformData(logs[key]);
    }
  }

  return data;
}

export function allTimeTransformData(logs: any): {
  labels: string[];
  values: number[];
  year: string[];
} {
  const labels: string[] = [];
  const values: number[] = [];
  const data: Record<string, number> = transformData(logs);
  const year = yearList;

  for (const label in data) {
    if (data.hasOwnProperty(label)) {
      labels.push(label);
      values.push(data[label]);
    }
  }

  return { labels, values, year };
}

export async function fetchLogs(panel: vscode.WebviewPanel) {
  const config = vscode.workspace.getConfiguration("timeTracker");
  const owner = config.get<string>("gitUsername");
  const repo = config.get<string>("repo");
  const githubToken = config.get<string>("gitHubToken");

  yearList = [];
  monthList = [];

  if (owner && repo && githubToken) {
    const logs = await fetchLogsFromGitHub(owner, repo, githubToken);

    if (logs) {
      panel.webview.postMessage({
        command: "updateData",
        data: { month: monthList, year: yearList, logs },
      });
    }
  }
}
