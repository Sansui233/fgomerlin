import { Cell } from "./calculator";
import { FreeQuestFormat, ItemsFormat, ServantFormat } from "./dataset-type";

export enum TableNames {
  servants = "servants",
  items = "items",
  user_setting = 'user_setting',
  src_info = 'srcinfo',
  calculator = 'calculator',
  glpk = 'glpk',
  freequests = 'freequests'
}

export type TableServantsRow = { id: number, name: string, detail: ServantFormat }
export type TableItemsRow = { id: number, name: string, category: ItemType, detail: ItemsFormat }
export enum ItemType {
  Stone = 1,
  Material = 2,
  Chess = 3,
}

export type TableUserSettingRow = { id: number, name: string, type: UserSettingType, setting: ServantSetting | ItemSetting }
export enum UserSettingType {
  Servant = "servant",
  Item = "item",
}
export type ServantSetting = {
  isFollow: boolean,
  /** 0-4 */
  ascension: { current: number, target: number },
  /** maxLevel-100 */
  finalLevel: { current: number, target: number },
  /** length 3 */
  skills: { current: number, target: number }[],
  /** length 3 */
  appendSkills: { current: number, target: number }[]
}
export type ItemSetting = {
  count: number
}

export type TableSrcinfoRow = { dataversion: string }

export type TableCalculatoreRow = {
  servantId: number,
  cells: Cell[]
}

export type TableGlpkRow = {
  item: string,
  quests: {
    quest: string,
    appq: number,
    appi: number
  }[],
}

export type TableFreeQuestsRow = {
  questName: string,
  detail: FreeQuestFormat
}