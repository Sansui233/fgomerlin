import axios from "axios";
import JSZip from "jszip"
import { DataSetFormat, DATASET_TEXT, GlpkFormat } from "./dataset-conf";
import { db, putGlpkObj, putItem, putServant, putVersion } from "./db";
import { TableGlpkRow } from "./db-type";


async function fetchTextDataSet(): Promise<{ [key: string]: JSZip.JSZipObject; }> {
  console.log("[dataset-resolve] Getting text pack...")
  const response = await axios({
    method: 'get',
    url: DATASET_TEXT,
    responseType: 'arraybuffer'  // 类型必须为arraybuffer
  })

  const zipData = await JSZip.loadAsync(response.data);
  return zipData.files;
}

export async function parseZipDataset() {
  const files = await fetchTextDataSet()
  console.debug('[dataset-resolve] Parsing files')
  for (const filename of Object.keys(files)) {
    console.debug('[dataset-resolve] Parsing', filename)
    const file = files[filename]
    switch (filename) {
      case "VERSION":
      case "dataset-text/VERSION":
        // Print Version
        const version = await file.async("string")
        console.log("[dataset-resolve] Current Data Version: ", version)
        await putVersion(version)
        break;
      case "dataset.json":
      case "dataset-text/dataset.json":
        const result = await file.async("string")
        return storeToDatabase(JSON.parse(result))
      default:
        break;
    }
  }
}

async function storeToDatabase(dataObject: DataSetFormat) {
  const arr: (() => Promise<any>)[] = []
  for (const value of Object.values(dataObject.servants)) {
    arr.push(() => putServant(value.svtId, value.info.name, value))
  }
  for (const value of Object.values(dataObject.items)) {
    arr.push(() => putItem(value.id, value.name, value.category, value))
  }
  for (const obj of composeGlpkObj(dataObject.glpk)) {
    arr.push(() => putGlpkObj(obj))
  }
  return db.transaction('rw', db.table('servants'), db.table('items'), db.table('glpk'), async () => {
    for (const putPromise of arr) {
      putPromise()
    }
  })
}

function composeGlpkObj(glpk: GlpkFormat) {
  const objs: TableGlpkRow[] = []
  glpk.matrix.forEach((appi_arr, row) => {
    const newRow: TableGlpkRow = {
      item: glpk.rowNames[row],
      quests: []
    }
    appi_arr.forEach((appi, col) => {
      newRow.quests.push({
        quest: glpk.colNames[col], 
        appq: glpk.costs[col],
        appi
      })
    })
    objs.push(newRow)
  })
  return objs
}