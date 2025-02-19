import * as fs from "fs/promises";
import path from "path";
import vscode from "vscode";

import { trackingDataInterface } from "../interface/trackingDataInterface";
import { gitPush } from "./gitpush";

export async function writeFunction(
  filePath: string,
  myData: trackingDataInterface
) {
  try {
    const jsonData = JSON.stringify(myData, null, 2);
    console.log(jsonData);
    await fs.writeFile(filePath, jsonData, "utf-8");
    console.log(`succesfully wrote data on ${filePath}`);
  } catch (err) {
    console.error(`Unable to write data on ${filePath}: ${err}`);
  }
}

export async function writeFile(
  jsonData: trackingDataInterface,
  context: vscode.ExtensionContext
) {
  const filePath = path.join(
    context.extensionPath,
    "src",
    "json",
    "trackingData.json"
  );
  await writeFunction(filePath, jsonData);
  await gitPush(filePath);
}
