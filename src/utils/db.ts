import { message } from 'antd';
import Dexie from 'dexie';
import cookies from '../lib/cookies';

import { ItemInfo } from '../pages/ItemContents';
import { ServantBasic, ServantDetail } from '../pages/ServantCard';
import { Servant } from '../pages/ServantList';
import { Cell, composeCalcCells } from './calculator';
import { parseZipDataset } from './dataset-resolve';
import { ItemsFormat, ServantFormat } from './dataset-type';
import {
  ItemSetting,
  ItemType,
  ServantSetting,
  TableCalculatoreRow,
  TableFreeQuestsRow,
  TableGlpkRow,
  TableItemsRow,
  TableNames,
  TableServantsRow,
  TableUserSettingRow,
  UserSettingType,
} from './db-type';

export var db: Dexie;
export var version = 2109.1

// Define table key property (indexed property). See db-type.ts for all properties
const SERVANT_TABLE = "id, name"
const ITEM_TABLE = "id, name, category"
const USER_SETTING = "id, name, type"
const SRCINFO_TABLE = "dataversion"
const CALCULATOR_TABLE = "servantId"
const GLPK_TABLE = "item"
const FREEQUESTS_TABLE = "questName"


export function initdb() {
  db = new Dexie("FGOTEST")
  db.version(version).stores({
    [TableNames.servants]: SERVANT_TABLE, // This is key column declaration. you can store any other value.
    [TableNames.items]: ITEM_TABLE,
    [TableNames.user_setting]: USER_SETTING,
    [TableNames.src_info]: SRCINFO_TABLE,
    [TableNames.calculator]: CALCULATOR_TABLE,
    [TableNames.glpk]: GLPK_TABLE,
    [TableNames.freequests]: FREEQUESTS_TABLE
  }).upgrade(async trans => {
    Dexie.ignoreTransaction(() => {
      message.info({ content: "正在更新数据", className: cookies.getCookie('isdark') === 'true' ? 'message-restyle-dark' : '', })
      parseZipDataset().then(() => {
        message.success({ content: `数据版本已更新至${version}, 刷新后生效`, className: cookies.getCookie('isdark') === 'true' ? 'message-restyle-dark' : '' })
        console.log('[db.ts] database upgraded to ' + version)
      }).catch((e) => {
        message.error({ content: "数据版本未更新，请尝试点击右上角手动更新. \n 错误信息：" + e, className: cookies.getCookie('isdark') === 'true' ? 'message-restyle-dark' : '' }, 5)
        throw e
      })
    })
  });

  // When databased is created, initialize data
  db.on("populate", function () {
    Dexie.ignoreTransaction(() => {
      // Init your DB with some default statuses:
      parseZipDataset().then(()=>{
        return reconstructCalctable()
      }).then(() => {
        message.success({ content: "数据导入成功", className: cookies.getCookie('isdark') === 'true' ? 'message-restyle-dark' : '' })
        console.log("[db.ts] Database is successfully created")
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }).catch((e) => {
        message.error({ content: "数据未初始化，错误信息：" + e, className: cookies.getCookie('isdark') === 'true' ? 'message-restyle-dark' : '' })
      })
    })
  });
}

export async function putVersion(dataVer: string) {
  await db.table(TableNames.src_info).put({ dataversion: dataVer })
}
export async function getVersion() {
  return (await db.table(TableNames.src_info).toArray())[0].dataversion
}

export function putServant(id: number, name: string, detail: ServantFormat) {
  // console.debug('[db.ts] putServant')
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  const row: TableServantsRow = { id, name, detail }
  return db.table(TableNames.servants).put(row)
}

export function putItem(id: number, name: string, category: ItemType, detail: ItemsFormat) {
  // console.debug('[db.ts] putItem')
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  if (typeof (category) == "string") {
    category = parseInt(category, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  const row: TableItemsRow = { id, name, category, detail }
  return db.table(TableNames.items).put(row)
}

export function putFreeQuest(freequest: TableFreeQuestsRow) {
  // console.debug('[db.ts] putFreequest')
  return db.table(TableNames.freequests).put(freequest)
}

/**
 * calcCells is for servant setting. Item don't need it
 * DO NOT USE EMPTY ARRAY When putting servant setting without cell update (such as when change isFollow), just leave calcCell undefined
 * When putting item, you can set id = -1 if you don't know it. Name is always neccessary
 */
export async function putSetting(id: number, name: string, settingType: UserSettingType, setting: ServantSetting | ItemSetting, calcCells?: Cell[]) {

  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  if (settingType === UserSettingType.Servant && id !== -1) {
    // put servant setting
    return db.transaction('rw', db.table(TableNames.user_setting), db.table(TableNames.calculator), async () => {

      const row: TableUserSettingRow = { id, name, type: settingType, setting }
      db.table(TableNames.user_setting).put(row)

      if (calcCells !== undefined) {
        const calcRow: TableCalculatoreRow = { servantId: id, cells: calcCells }
        db.table(TableNames.calculator).where('servantId').equals(id).delete()
        db.table(TableNames.calculator).put(calcRow)
        console.debug('cell length', calcCells.length)
      }

    }).catch((e: Error) => {
      console.error('[db.ts]', e)
      throw e
    })

  } else if (settingType === UserSettingType.Item && !calcCells) {
    // put item setting
    let realId = id
    if (id === -1) {
      const item = await db.table(TableNames.items).where('name').equals(name).toArray()
      if (item.length !== 0) {
        realId = (item[0] as ItemInfo).id
      } else {
        throw new Error(`[db.ts] item ${name} not found`)
      }
    }
    // put item setting
    const row: TableUserSettingRow = { id: realId, name, type: settingType, setting }
    return db.table(TableNames.user_setting).put(row)
  } else {
    throw new Error(`[db.ts] [putSetting] Params Invalid: id: ${id}, name: ${name}, type: ${settingType}, cells: ${calcCells?.length}`)
  }
}

export function putGlpkObj(row: TableGlpkRow) {
  // console.debug('[db.ts] putGlpk')
  return db.table(TableNames.glpk).put(row)
}

export async function getServantList(): Promise<Servant[]> {
  const results = (await db.table(TableNames.servants).toArray()) as TableServantsRow[]
  return mapServantItems(results)
}

export async function getServantBasic(id: number): Promise<ServantBasic> {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  const s = (await db.table(TableNames.servants).get(id)) as TableServantsRow
  const detail = s.detail
  return {
    sId: s.id,
    sNo: detail.no,
    sName: s.name,
    sNameJp: detail.info.nameJp,
    sClass: detail.info.className,
    sImg: detail.icon,
    sRarity: detail.info.rarity2 ? detail.info.rarity2 : detail.info.rarity,
    sObtain: detail.info.obtain,
    mcLink: detail.mcLink,
    activeSkills: detail.activeSkills,
    appendedSkills: detail.appendSkills,
    itemCost: detail.itemCost,
  }
}

export async function getServantSetting(id: number): Promise<ServantSetting> {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  const settings = await db.table(TableNames.user_setting).where("id").equals(id).toArray()
  return mapServantSetting(settings)
}

export async function getServantDetail(id: number): Promise<ServantDetail> {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  const s = await db.table(TableNames.servants).where("id").equals(id).toArray()
  const settings = await db.table(TableNames.user_setting).where("id").equals(id).toArray()
  return mapServantDetail(s, settings)
}

export async function getItemList(category: ItemType): Promise<ItemInfo[]> {
  const results = (await db.table(TableNames.items).where("category").equals(category).toArray()) as TableItemsRow[]
  return mapItemList(results)
}

/**
 * Get from item detail from database according to id or name  
 * id = -1 means name only
 */
export async function getItemInfo(id?: number, name?: string): Promise<ItemInfo> {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  if (id && id !== -1) {
    const item = (await db.table(TableNames.items).where('id').equals(id).toArray())[0]
    if (!item) {
      throw new Error('Unknow item ' + id + 'in database')
    }
    const itemSetting = (await db.table(TableNames.user_setting).where('id').equals(id).toArray())[0]
    return mapItemInfo(item, itemSetting)
  }
  if (name && name !== "") {
    const item = (await db.table(TableNames.items).where('name').equals(name).toArray())[0]
    if (!item) {
      throw new Error('Unknow item ' + name + 'in database')
    }
    const itemSetting = (await db.table(TableNames.user_setting).where('name').equals(name).toArray())[0]
    return mapItemInfo(item, itemSetting)
  }
  throw new Error('No item key matched in database')
}

export async function getItemSetting(name: string): Promise<{ id: number, name: number, type: UserSettingType, setting: ItemSetting }> {
  const result = await db.table(TableNames.user_setting).get({ name })
  if (!result) {
    const items = await db.table(TableNames.items).where('name').equals(name).toArray()
    if (items.length === 0) {
      throw new Error(`[db.ts] item${name} not in database`)
    }
    return {
      id: items[0].id,
      name: items[0].name,
      type: UserSettingType.Item,
      setting: { count: 0 }
    }
  }
  return result
}

export function getItemSettings(): Promise<{ id: number, name: string, type: UserSettingType, setting: ItemSetting }[]> {
  return db.table(TableNames.user_setting).where('type').equals(UserSettingType.Item).toArray()
}

export async function getCalcCells(): Promise<Cell[]> {
  const rows = (await db.table(TableNames.calculator).toArray()) as TableCalculatoreRow[]
  return rows.flatMap(r => {
    return r.cells
  })
}

export async function getAllSettings(): Promise<TableUserSettingRow[]> {
  return (await db.table(TableNames.user_setting).toArray()) as TableUserSettingRow[]
}

export function putAllSettings(rows: TableUserSettingRow[], mode: 'merge' | 'overlay') {
  return db.transaction('rw', db.table(TableNames.user_setting), async () => {
    if (mode === "overlay") {
      db.table(TableNames.user_setting).clear()
    }
    db.table(TableNames.user_setting).bulkPut(rows)
  })
}

export async function getGlpkObj(itemName: string): Promise<TableGlpkRow> {
  const result = await db.table(TableNames.glpk).where('item').equals(itemName).toArray()
  if (result.length === 0) {
    throw new Error(`[db.ts] Item "${itemName}" not found`)
  }
  return result[0]
}

export async function getFreeQuest(questName: string): Promise<TableFreeQuestsRow> {
  const result = await db.table(TableNames.freequests).where('questName').equals(questName).toArray()
  if (result.length === 0) {
    throw new Error(`[db.ts] Free quest "${questName}" not found`)
  }
  return result[0]
}

export async function reconstructCalctable() {
  const settings = (await db.table(TableNames.user_setting)
    .where('type')
    .equals(UserSettingType.Servant)
    .toArray()) as TableUserSettingRow[]
  Promise.all(settings.map(setting => getServantBasic(setting.id))).then(sInfos => {
    const cellRows: TableCalculatoreRow[] = sInfos.map((info, i) => {
      if (info.sId !== settings[i].id) {
        throw new Error(`Info and setting not match error:
        info: ${info.sId},${info.sName}
        setting: ${settings[i].id}, ${settings[i].name}`)
      }
      return {
        servantId: info.sId,
        cells: composeCalcCells({ basicInfo: info, userSettings: mapServantSetting(settings[i]) })
      }
    })
    db.transaction('rw', db.table(TableNames.calculator), async () => {
      await db.table(TableNames.calculator).clear()
      cellRows.forEach((r) => {
        db.table(TableNames.calculator).put(r)
      })
    })
  })
}

async function mapServantItems(results: TableServantsRow[]): Promise<Servant[]> {
  const queries = results.map(result => db.table(TableNames.user_setting).where("id").equals(result.id).toArray())
  return Promise.all(queries).then((queries_res) => {
    return results.map((result, i) => {
      // queries_res[i] 为一个 query 查询完毕的结果，是个长度为 0 或 1 的数组，where stores the value corresponded to id in this query
      // 用 Promise.all 是为了合并结果为 Promise<Servant[]> 的形式
      const setting = queries_res[i].length !== 0 ? (queries_res[i][0].setting) as ServantSetting : undefined;
      const phantasmColor = result.detail.noblePhantasm.map(n => {
        return n.color
      }).filter((color, index, arr) => {
        return arr.indexOf(color, 0) === index;
      })
      const phantasmCategory = result.detail.noblePhantasm.map(n => {
        return n.category
      }).filter((category, index, arr) => {
        return arr.indexOf(category, 0) === index;
      })
      return {
        sNo: result.detail.no,
        sId: result.id,
        sName: result.detail.info.name,
        sNickNames: result.detail.info.nicknames,
        sNameJp: result.detail.info.nameJp,
        sClass: result.detail.info.className,
        sRarity: result.detail.info.rarity2 ? result.detail.info.rarity2 : result.detail.info.rarity,
        sImg: result.detail.icon,
        skill1: setting ? setting.skills[0].current : 1,
        skill2: setting ? setting.skills[1].current : 1,
        skill3: setting ? setting.skills[2].current : 1,
        phantasmColor,
        phantasmCategory,
        isFollow: setting ? setting.isFollow : false
      }
    })
  })
}

function mapServantDetail(s: TableServantsRow[], settings: TableUserSettingRow[]): ServantDetail {
  if (s.length === 0) {
    throw new Error("[db.ts] No servant result")
  }
  const setting = settings.length !== 0 ? (settings[0].setting as ServantSetting) : undefined;
  const detail = s[0].detail
  return {
    basicInfo: {
      sId: s[0].id,
      sNo: detail.no,
      sName: detail.info.name,
      sNameJp: detail.info.nameJp,
      sClass: detail.info.className,
      sImg: detail.icon,
      sRarity: detail.info.rarity2 ? detail.info.rarity2 : detail.info.rarity,
      sObtain: detail.info.obtain,
      mcLink: detail.mcLink,
      activeSkills: detail.activeSkills,
      appendedSkills: detail.appendSkills,
      itemCost: detail.itemCost,
    },
    userSettings: {
      isFollow: setting ? setting.isFollow : false,
      ascension: {
        current: setting ? setting.ascension.current : 0,
        target: setting ? setting.ascension.target : 0
      },
      finalLevel: {
        current: setting ? setting.finalLevel.current : 0,
        target: setting ? setting.finalLevel.target : 0
      },
      skills: [
        { current: setting ? setting.skills[0].current : 1, target: setting ? setting.skills[0].target : 1 }, //1-10
        { current: setting ? setting.skills[1].current : 1, target: setting ? setting.skills[1].target : 1 },
        { current: setting ? setting.skills[2].current : 1, target: setting ? setting.skills[2].target : 1 },
      ],
      appendSkills: [
        { current: setting ? setting.appendSkills[0].current : 0, target: setting ? setting.appendSkills[0].target : 0 }, //0-10
        { current: setting ? setting.appendSkills[1].current : 0, target: setting ? setting.appendSkills[1].target : 0 },
        { current: setting ? setting.appendSkills[2].current : 0, target: setting ? setting.appendSkills[2].target : 0 },
      ]
    }
  }
}

/**
 * 
 * @param results an array containes up to 1 servant info
 * @returns 
 */
function mapServantSetting(results: TableUserSettingRow[] | TableUserSettingRow): ServantSetting {
  const setting = results instanceof Array ?
    (results.length !== 0 ?
      (results[0].setting as ServantSetting) : undefined
    )
    : results.setting as ServantSetting;
  return {
    isFollow: setting ? setting.isFollow : false,
    ascension: {
      current: setting ? setting.ascension.current : 0,
      target: setting ? setting.ascension.target : 0
    },
    finalLevel: {
      current: setting ? setting.finalLevel.current : 0,
      target: setting ? setting.finalLevel.target : 0
    },
    skills: [
      { current: setting ? setting.skills[0].current : 1, target: setting ? setting.skills[0].target : 1 }, //1-10
      { current: setting ? setting.skills[1].current : 1, target: setting ? setting.skills[1].target : 1 },
      { current: setting ? setting.skills[2].current : 1, target: setting ? setting.skills[2].target : 1 },
    ],
    appendSkills: [
      { current: setting ? setting.appendSkills[0].current : 0, target: setting ? setting.appendSkills[0].target : 0 }, //0-10
      { current: setting ? setting.appendSkills[1].current : 0, target: setting ? setting.appendSkills[1].target : 0 },
      { current: setting ? setting.appendSkills[2].current : 0, target: setting ? setting.appendSkills[2].target : 0 },
    ]
  }
}

async function mapItemList(results: TableItemsRow[]): Promise<ItemInfo[]> {
  if (results.length === 0) {
    throw new Error("[db.ts] No item result")
  }
  // get user num settings
  const queries = results.map(result => db.table(TableNames.user_setting).where("id").equals(result.id).toArray())
  return Promise.all(queries).then((queries_res) => {
    return results.map((result, i) => {
      const setting = queries_res[i].length !== 0 ? queries_res[i][0].setting : undefined;
      return {
        id: result.id,
        name: result.name,
        count: setting ? setting.count : 0,
        category: result.category,
        rarity: result.detail.rarity,
        iconWithSuffix: `${result.name}.jpg`,
      }
    })
  })
}

function mapItemInfo(item: TableItemsRow, itemSetting: TableUserSettingRow): ItemInfo {
  return {
    id: item.id,
    name: item.name,
    category: item.detail.category,
    rarity: item.detail.rarity,
    count: itemSetting ? (itemSetting.setting as ItemSetting).count : 0,
    iconWithSuffix: `${item.name}.jpg`,
  }
}
