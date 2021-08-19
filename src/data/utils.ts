import axios from "axios";
import JSZip, { } from "jszip"
import { putServant } from "./db";

// TODO 测试配置文件之后单独分离
export const DOMAIN = "http://localhost:8080"
export const DATASET_TEXT = "/dataset-text.zip"
export const ICONBASE = "/icons"

// The json format of dataset-text
type DataSetText = {
    version:string,
    unavailableSvts:Array<number>,
    servants:object,
    custumes:object,
    crafts:object,
    cmdCodes:object,
    events: object,
    items:object,
    icons:object,
    freeQuests:object, 
    svtQuests:object,
    glpk:object,
    mysticCodes:object,
    summons:object,
    fsmSvtIdMapping:object
}

async function fetchTextDataSet(): Promise<{[key: string]: JSZip.JSZipObject;}>{
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
    try {
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
                    file.async("string").then((result) => {
                        storeToDatabase(JSON.parse(result))
                    })
                    break;
                default:
                    break;
            }
        }
    } catch (error) {
        console.log("[util.js] ", error)
    }
}

// TODO NEXT
function storeToDatabase(dataObject: DataSetText) {
    for (const [num, value] of Object.entries(dataObject.servants)) {
        putServant(value.svtId, value.info.name, value)
    }
}