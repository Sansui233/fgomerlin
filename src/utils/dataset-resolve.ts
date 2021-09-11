import axios from "axios";
import JSZip from "jszip"
import { DataSetFormat, DATASET_TEXT, GlpkFormat } from "./dataset-conf";
import { db, putFreeQuest, putGlpkObj, putItem, putServant, putVersion } from "./db";
import { TableGlpkRow, TableNames } from "./db-type";


async function fetchTextDataSet(): Promise<{ [key: string]: JSZip.JSZipObject; }> {
  console.log("[dataset-resolve] getting text pack...")
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
  console.debug('[dataset-resolve] parsing files...')
  for (const filename of Object.keys(files)) {
    console.debug('[dataset-resolve] parsing', filename)
    const file = files[filename]
    switch (filename) {
      case "VERSION":
      case "dataset-text/VERSION":
        // Print Version
        const version = await file.async("string")
        console.log("[dataset-resolve] current dataset version: ", version)
        await putVersion(version)
        console.debug('[dataset-resolve] version put complete')
        break;
      case "dataset.json":
      case "dataset-text/dataset.json":
        const result = await file.async("string")
        await storeToDatabase(JSON.parse(result))
        console.debug('[dataset-resolve] storing transaction completed')
        break;
      default:
        break;
    }
  }
}

function storeToDatabase(dataObject: DataSetFormat) {
  console.debug('[dataset-resolve] storeToDatabase...')
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
  for (const [k, v] of Object.entries(dataObject.freeQuests)) {
    arr.push(() => putFreeQuest({ questName: k, detail: v }))
  }
  return db.transaction(
    'rw',
    db.table(TableNames.servants), 
    db.table(TableNames.items), 
    db.table(TableNames.glpk),
    db.table(TableNames.freequests),
    async () => {
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