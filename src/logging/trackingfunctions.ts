import TimeTracker from "./trackingdataclass";
import vscode from "vscode";
import { exec } from "child_process";
import { trackingDataInterface } from "../interface/trackingDataInterface";
import { writeFile, writeFunction } from "./writeFunction";
import path from "path";
import { gitPush } from "./gitpush";
import { checkTime } from "./timeFunctions";

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

export async function startTracking(
  context: vscode.ExtensionContext,
  openedNewDoc: boolean = false
) {
  const editor = vscode.window.activeTextEditor;
  if (editor && openedNewDoc) {
    const document = editor.document;
    fileType.add(getFileType(document));
    console.log("file's opened this session: ");
    console.log(fileType);
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
      checkTime(timeTracker.getTimer, context, timeTracker.toJSON());
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
          timeTracker.addFileType(
            e,
            time + (timeTracker.getTimeForFileType(e) ?? 0)
          );
        } else {
          timeTracker.addFileType(e, time);
        }
      });
      fileType.clear();

      console.log(
        "All the file and time spent on file registered this session : "
      );
      console.log(timeTracker.getFiletype);
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
      await writeFile(timeTracker.toJSON(), cont);
    } catch (err) {
      console.error(err);
    }
  }
}
