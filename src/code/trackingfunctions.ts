import TimeTracker from "../json/trackingdataclass";
import vscode from "vscode";
import { exec } from "child_process";
import { trackingDataInterface } from "../interface/trackingDataInterface";
import { writeFunction } from "./writeFunction";
import path from "path";
import { gitPush } from "./gitpush";

let tracking: boolean = true;
let stoppedtracking: boolean = false;
let startTime: Date | null = null;
let timer: number = 0;
let cont: vscode.ExtensionContext;
let fileType: Set<string> = new Set<string>();

const timeTracker = new TimeTracker();

function getFileType(document: vscode.TextDocument): string {
  return document.languageId;
}

async function checkTime() {
  if (timeTracker.getTimer >= 30) {
    await writeFile();
  }
}

export async function startTracking(
  context: vscode.ExtensionContext,
  openedNewDoc: boolean = false
) {
  const editor = vscode.window.activeTextEditor;
  if (editor && openedNewDoc) {
    const document = editor.document;
    fileType.add(getFileType(document));
    console.log("file's opened this session: " + fileType);
  }

  if (tracking) {
    cont = context;
    startTime = new Date();
    console.log(`tracking started ${startTime.getTime()}`);
    tracking = false;
    stoppedtracking = false;

    timeTracker.setMyDate = new Date();
    console.log("Date registered : " + timeTracker.getMyDate);

    const intervalId = setInterval(() => {
      checkTime();
    }, 5 * 60 * 1000);
  }
}

export async function stopTracking(
  context: vscode.ExtensionContext,
  pushData: boolean = false
) {
  if (!stoppedtracking) {
    const endTime = new Date();

    if (startTime) {
      let time = (endTime.getTime() - startTime.getTime()) / (60 * 1000);

      stoppedtracking = true;
      tracking = true;

      console.log(`tracking stopped ${endTime.getTime()}`);

      fileType.forEach((e) => {
        if (timeTracker.getTimeForFileType(e)) {
          time += timeTracker.getTimeForFileType(e) ?? time;
          timeTracker.addFileType(e, time);
        } else {
          timeTracker.addFileType(e, time);
        }
      });
      fileType.clear();

      console.log(
        "All the file and time spent on file registered this session : " +
          timeTracker.getFiletype
      );
      timer += (endTime.getTime() - startTime.getTime()) / (60 * 1000);
      console.log(timer);
      if (timer < 35) {
        timeTracker.setTimer = timer;
      } else {
        timeTracker.setTimer = 30;
      }
    }
  }

  if (pushData) {
    try {
      await writeFile();
    } catch (err) {
      console.error(err);
    }
  }
}

async function writeFile() {
  const jsonData: trackingDataInterface = {
    timer: timeTracker.getTimer,
    date: timeTracker.getMyDate,
    fileType: Object.entries(timeTracker.getFiletype),
  };
  const filePath = path.join(
    cont.extensionPath,
    "src",
    "json",
    "trackingData.json"
  );
  await writeFunction(filePath, jsonData);
  await gitPush(filePath);
}
