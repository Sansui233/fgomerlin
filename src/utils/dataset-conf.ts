export const DATASET_TEXT = "http://localhost:8080/dataset-text.zip"
export const ICONBASE = "http://localhost:8080/icons"

// The json format of dataset-text
export type DataSetFormat = {
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
  glpk: GlpkFormat,
  mysticCodes: object,
  summons: object,
  fsmSvtIdMapping: object
}

export type SkillDetailFormat = {
  "state": string,
  "name": string,
  "nameJp": string | null,
  "nameEn": string | null,
  "rank": string,
  "icon": string,
  "cd": number,
  "effects": {
    "description": string,
    "descriptionJp": string | null,
    "descriptionEn": string | null,
    "lvData": string[] // length = 10
  }[]
}

export type GlpkFormat = {
  'freeCounts': { [key: string]: number },
  'colNames': string[], // quest name
  'rowNames': string[], // Item names
  'costs': number[],  // quest ap cost. ap per quest
  'matrix': number[][], // quest efficiency cost. unit: ap per item
  'weeklyMissionData': object[],
}

