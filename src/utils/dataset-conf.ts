export const DOMAIN = "http://localhost:8080"
export const DATASET_TEXT = "/dataset-text.zip"
export const ICONBASE = "/icons"

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
  glpk: object,
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
  "effects": SkillEffectFormat[]
}

type SkillEffectFormat = {
  "description": string,
  "descriptionJp": string | null,
  "descriptionEn": string | null,
  "lvData": string[] // length = 10
}

