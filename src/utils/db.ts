import Dexie from 'dexie';
import { message } from 'antd';
import { ItemInfo } from '../pages/ItemContents';
import { ServantBasic, ServantDetail } from '../pages/ServantCard';
import { Servant } from '../pages/ServantList'
import { parseZipDataset } from './dataset-resolve';
import { Cell } from './calculator';
import { ItemType, TableGlpkRow, TableNames, TableServantsRow, TableUserSettingRow, UserSettingType, ServantSetting, ItemSetting, TableItemsRow, TableFreeQuestsRow } from "./db-type";
import { ItemsFormat, ServantsFormat } from './dataset-conf';

export var db: Dexie;
export var version = 2109.1

// Define table key property (indexed property). See db-type.ts for all properties
const SERVANT_TABLE = "id, name"
const ITEM_TABLE = "id, name, category"
const USER_SETTING = "id, name, type"
const SRCINFO_TABLE = "dataversion"
const CALCULATOR_TABLE = "[servantId+cellType+cellTargetLevel+itemName]" // See doc for details
const GLPK_TABLE = "item" // See dataset-conf
const FREEQUESTS_TABLE = "questName" // See dataset-conf


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
    Dexie.ignoreTransaction(()=> {
      message.info("正在更新数据")
      parseZipDataset().then(() => {
        message.success(`数据版本已更新至${version}, 刷新内容生效`)
        console.log('[db.ts] database upgraded to ' + version)
      }).catch((e) => {
        message.error("数据版本未更新，错误信息：" + e +".请尝试点击右上角更新", 3000)
        throw e
      })
    })
  });

  // When databased is created, initialize data
  db.on("populate", function () {
    Dexie.ignoreTransaction(() => {
      // Init your DB with some default statuses:
      message.info("正在获取并导入数据……")
      parseZipDataset().then(() => {
        message.success("数据导入成功")
        console.log("[db.ts] Database is successfully created")
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }).catch((e) => {
        message.error("数据未初始化，错误信息：" + e)
      })
    })
  });
}

export async function putVersion(dataVer: string) {
  await db.table(TableNames.src_info).put({ dataversion: dataVer })
}

export function putServant(id: number, name: string, detail: ServantsFormat) {
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

// if id = -1 when putting items, it will be auto repeat
export async function putSetting(id: number, name: string, settingType: UserSettingType, setting: ServantSetting | ItemSetting, calcCells?: Cell[]) {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  if (calcCells) {
    // put servant setting
    await db.transaction('rw', db.table(TableNames.user_setting), db.table(TableNames.calculator), async () => {
      const row: TableUserSettingRow = { id, name, type: settingType, setting }
      await db.table(TableNames.user_setting).put(row)
      // Delete servant-related setting
      await db.table(TableNames.calculator).where('[servantId+cellType+cellTargetLevel+itemName]').between(
        [id, Dexie.minKey, Dexie.minKey, Dexie.minKey],
        [id, Dexie.maxKey, Dexie.maxKey, Dexie.maxKey]
      ).delete().then((deleteCount) => {
        // console.debug(`[db.ts] delete ${deleteCount} calc cells for servant ${id}`)
      })
      calcCells.forEach(async (c) => {
        await db.table(TableNames.calculator).put(c)
      })
    }).catch((e: Error) => {
      console.error('[db.ts]', e)
      throw e
    })
  } else {
    if (id === -1) {
      const item = await db.table(TableNames.items).where('name').equals(name).toArray()
      if (item.length !== 0) {
        id = (item[0] as ItemInfo).id
      } else {
        throw new Error(`[db.ts] item ${name} not found`)
      }
    }
    // put item setting
    const row: TableUserSettingRow = { id, name, type: settingType, setting }
    return db.table(TableNames.user_setting).put(row)
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

export function getCalcCells(): Promise<Cell[]> {
  return db.table(TableNames.calculator).toArray()
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

async function mapServantItems(results: TableServantsRow[]): Promise<Servant[]> {
  const queries = results.map(result => db.table(TableNames.user_setting).where("id").equals(result.id).toArray())
  return Promise.all(queries).then((queries_res) => {
    return results.map((result, i) => {
      // queries_res[i] 为一个 query 查询完毕的结果，是个长度为 0 或 1 的数组，where stores the value corresponded to id in this query
      // 用 Promise.all 是为了合并结果为 Promise<Servant[]> 的形式
      const setting = queries_res[i].length !== 0 ? (queries_res[i][0].setting) as ServantSetting : undefined;
      return {
        sNo: result.detail.no,
        sId: result.id,
        sName: result.detail.info.name,
        sNickNames: result.detail.info.nicknames,
        sNameJp: result.detail.info.nameJp,
        sClass: result.detail.info.className,
        sImg: result.detail.icon,
        skill1: setting ? setting.skills[0].current : 1,
        skill2: setting ? setting.skills[1].current : 1,
        skill3: setting ? setting.skills[2].current : 1,
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
      appendedSkills: [
        { current: setting ? setting.appendedSkills[0].current : 0, target: setting ? setting.appendedSkills[0].target : 0 }, //0-10
        { current: setting ? setting.appendedSkills[1].current : 0, target: setting ? setting.appendedSkills[1].target : 0 },
        { current: setting ? setting.appendedSkills[2].current : 0, target: setting ? setting.appendedSkills[2].target : 0 },
      ]
    }
  }
}

function mapServantSetting(results: TableUserSettingRow[]): ServantSetting {
  const setting = results.length !== 0 ? (results[0].setting as ServantSetting) : undefined;
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
    appendedSkills: [
      { current: setting ? setting.appendedSkills[0].current : 0, target: setting ? setting.appendedSkills[0].target : 0 }, //0-10
      { current: setting ? setting.appendedSkills[1].current : 0, target: setting ? setting.appendedSkills[1].target : 0 },
      { current: setting ? setting.appendedSkills[2].current : 0, target: setting ? setting.appendedSkills[2].target : 0 },
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
