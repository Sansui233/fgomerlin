import axios from "axios";
import JSZip, { } from "jszip"

// TODO 测试配置文件抽离吧
export const DOMAIN = "http://localhost:8080"
export const DATASET_TEXT = "/dataset-text.zip"
export const ICONBASE = "/icons"

/**
 * @return {JSZip.files} zip.files
 */
async function fetchTextDataSet() {
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
                        console.log(result)
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

// TODO
function storeToDatabase(dataObject) {
    for (const servantKey of dataObject.servants) {

    }
}