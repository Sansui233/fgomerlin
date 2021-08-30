import axios from "axios";
import JSZip, { } from "jszip"
import { DataSetFormat, DATASET_TEXT, DOMAIN } from "./dataset-conf";
import { putItems, putServant, putVersion } from "./db";


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
          putVersion(result)
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

async function storeToDatabase(dataObject: DataSetFormat) {
  const arr:Promise<void>[] = []
  for (const value of Object.values(dataObject.servants)) {
    arr.push(putServant(value.svtId, value.info.name, value))
  }
  for (const value of Object.values(dataObject.items)) {
    arr.push(putItems(value.id, value.name,value.category,  value))
  }
  return Promise.all(arr)
}