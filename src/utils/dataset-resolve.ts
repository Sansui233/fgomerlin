import { message } from "antd";
import axios from "axios";
import JSZip from "jszip"
import { DATASET_TEXT } from "./dataset-conf";
import { DataSetFormat, GlpkFormat } from "./dataset-type";
import { db, putFreeQuest, putGlpkObj, putItem, putServant, putVersion } from "./db";
import { TableGlpkRow, TableNames } from "./db-type";


async function fetchTextDataSet(): Promise<{ [key: string]: JSZip.JSZipObject; }> {
  const msgKey = 'download'
  console.log("[dataset-resolve] getting text pack...")
  const hide = message.loading({ content: '正在获取最新数据...', key: msgKey, duration: 0 })
  try {
    const response = await axios({
      method: 'get',
      url: DATASET_TEXT,
      responseType: 'arraybuffer',  // 类型必须为arraybuffer
      onDownloadProgress: (progressEvent) => {
        const total = (progressEvent.total / 1048576).toFixed(1)
        const loaded = (progressEvent.loaded / 1048576).toFixed(1)
        message.loading({ content: `正在获取最新数据 ${loaded}MB/${total}MB`, key: msgKey, duration: 0 })
      }
    })
    const zipData = await JSZip.loadAsync(response.data);
    message.success({ content: '下载完成', key: msgKey, duration: 1 })
    return zipData.files;
  } catch (error) {
    hide()
    throw error
  }
}

export async function parseZipDataset() {
  const files = await fetchTextDataSet()
  message.info({ content: '正在写入数据...', duration: 1.5 })
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

async function storeToDatabase(dataObject: DataSetFormat) {
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
  return await db.transaction(
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