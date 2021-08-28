import axios from "axios";
import JSZip, { } from "jszip"
import { putItems, putServant } from "./db";

// TODO 测试配置文件之后单独分离
export const DOMAIN = "http://localhost:8080"
export const DATASET_TEXT = "/dataset-text.zip"
export const ICONBASE = "/icons"

// The json format of dataset-text
type DataSetText = {
  version: string,
  unavailableSvts: Array<number>,
  servants: object,
  custumes: object,
  crafts: object,
  cmdCodes: object,
  events: object,
  items: object,
  icons: object,
  freeQuests: object,
  svtQuests: object,
  glpk: object,
  mysticCodes: object,
  summons: object,
  fsmSvtIdMapping: object
}

async function fetchTextDataSet(): Promise<{ [key: string]: JSZip.JSZipObject; }> {
  console.log("[data/util.js] Getting text pack...")
  const response = await axios({
    method: 'get',
    url: DOMAIN + DATASET_TEXT,
    responseType: 'arraybuffer'  // 类型必须为arraybuffer
  })

  const zipData = await JSZip.loadAsync(response.data);
  return zipData.files;
}

export async function parseZipDataset() {
  const files = await fetchTextDataSet()
  for (const filename of Object.keys(files)) {
    const file = files[filename]
    switch (filename) {
      case "dataset-text/VERSION":
        // Print Version
        file.async("string").then((result) => {
          console.log("[utils.ts] Current Data Version: ", result)
        })
        break;
      case "dataset-text/dataset.json":
        const result = await file.async("string")
        return storeToDatabase(JSON.parse(result))
      default:
        break;
    }
  }
}

async function storeToDatabase(dataObject: DataSetText) {
  const arr:Promise<void>[] = []
  for (const value of Object.values(dataObject.servants)) {
    arr.push(putServant(value.svtId, value.info.name, value))
  }
  for (const value of Object.values(dataObject.items)) {
    arr.push(putItems(value.id, value.category, value.name, value))
  }
  return Promise.all(arr)
}