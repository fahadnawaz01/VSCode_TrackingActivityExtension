import * as fs from "fs/promises";
import path from "path";

import { trackingDataInterface } from "../interface/trackingDataInterface";

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


