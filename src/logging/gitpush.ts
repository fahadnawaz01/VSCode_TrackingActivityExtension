import * as fs from "fs";
import * as path from "path";
import vscode from "vscode";
import { getFullDate, getFullMonth, getFullYear, getTime } from "./timeFunctions";

async function uploadFile(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  fileContent: string,
  commitMessage: string,
  githubToken: string
) {
  const { Octokit } = await import("@octokit/rest");
  const octokit = new Octokit({ auth: githubToken });


  const refResponse = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const latestCommitSha = refResponse.data.object.sha;


  const commitResponse = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  });
  const treeSha = commitResponse.data.tree.sha;


  const blobResponse = await octokit.git.createBlob({
    owner,
    repo,
    content: fileContent,
    encoding: "utf-8",
  });
  const blobSha = blobResponse.data.sha;


  const newTreeResponse = await octokit.git.createTree({
    owner,
    repo,
    tree: [
      {
        path: filePath,
        mode: "100644", // file (blob)
        type: "blob",
        sha: blobSha,
      },
    ],
    base_tree: treeSha,
  });
  const newTreeSha = newTreeResponse.data.sha;

  
  const newCommitResponse = await octokit.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: newTreeSha,
    parents: [latestCommitSha],
  });
  const newCommitSha = newCommitResponse.data.sha;

  
  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommitSha,
  });

  console.log(`File "${filePath}" uploaded successfully.`);
}


export async function gitPush(absoluteFilePath: string) {
  const config = vscode.workspace.getConfiguration("timeTracker");
  const logFileName = config.get<string>("logFileName");

  const owner = config.get<string>("gitUsername");
  const repo = config.get<string>("repo"); 
  const branch = "main";
  const filePath = `${getFullYear()}/${getFullMonth()}/${getFullDate()}/${getTime()}`;
  const fileContent = fs.readFileSync(absoluteFilePath, "utf-8");
  const commitMessage = "Upload file via API";
  const githubToken = config.get<string>("gitHubToken"); 

  if (owner && repo && githubToken) {
    await uploadFile(
      owner,
      repo,
      branch,
      filePath,
      fileContent,
      commitMessage,
      githubToken
    );
  }
}
