import Dexie from 'dexie';
import { message } from 'antd';
import { ItemInfo } from '../pages/ItemContents';
import { ServantDetail } from '../pages/ServantCard';
import { Servant } from '../pages/ServantList'
import { parseZipDataset } from './fetchdata';
import { CalcItemState } from '../redux/calc-state';


var db: Dexie;
var version = 1.2;

// Define table key (indexing)
const SERVANT_TABLE = "id, name"
const ITEM_TABLE = "id, name, category"
const USER_SETTING = "id, name, type"
const SRCINFO_TABLE = "dataversion"

const QPID: number = 99999999

export enum UserSettingType {
  Servant = "servant",
  Item = "item",
  QP = "qp",
}

export type ServantSetting = {
  isFollow: boolean,
  level: { current: number, target: number }, // 0-4
  finalLevel: { current: number, target: number }, //maxLevel-100
  skills: { current: number, target: number }[], // length 3
  appendedSkills: { current: number, target: number }[] // length 3
}

export type ItemSetting = {
  count: number
}

export enum ItemType {
  Stone = 1,
  Material = 2,
  Chess = 3,
}

export function initdb() {
  db = new Dexie("FGOTEST")
  db.version(version).stores({
    servants: SERVANT_TABLE, // This is key column declaration. you can store any other value.
    items: ITEM_TABLE,
    user_setting: USER_SETTING,
    srcinfo: SRCINFO_TABLE,
  }).upgrade(trans => {
    message.info("正在更新数据库")
    parseZipDataset().then(() => {
      message.success(`数据库版本已更新至${version}, 刷新以重新载入数据库`)
    }).catch((e) => {
      message.error("数据库版本未更新，错误信息：" + e)
    })
  });

  // When databased is created, initialize data
  db.on("populate", function () {
    Dexie.ignoreTransaction(() => {
      // Init your DB with some default statuses:
      message.info("正在获取并处理数据……")
      parseZipDataset().then(() => {
        message.success("数据库创建成功")
        console.log("[db.ts] Database is successfully created")
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }).catch((e) => {
        message.error("数据库版未初始化，错误信息：" + e)
      })
    })
  });
}

export async function putVersion(dataVer: string) {
  await db.table('srcinfo').put({ dataversion: dataVer })
}

export async function getServantList(): Promise<Servant[]> {
  const results = await db.table('servants').toArray()
  return mapServantItems(results)
}

export async function getServantSetting(id: number): Promise<ServantSetting> {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  const settings = await db.table('user_setting').where("id").equals(id).toArray()
  return mapServantSetting(settings)
}

export async function getServantDetail(id: number): Promise<ServantDetail> {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  const s = await db.table('servants').where("id").equals(id).toArray()
  const settings = await db.table('user_setting').where("id").equals(id).toArray()
  return mapServantDetail(s, settings)
}

export async function putServant(id: number, name: string, detail: object) {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  await db.table('servants').put({ id, name, detail })
}

export async function getItemList(category: ItemType): Promise<ItemInfo[]> {
  const results = await db.table('items').where("category").equals(category).toArray()
  return mapItemList(results)
}

/**
 * Get from item detail from database according to id or name
 * id = 0 means name only
 */
export async function getItemInfo(id?: number, name?: string): Promise<ItemInfo> {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  if (id && id !== 0) {
    const item = (await db.table('items').where('id').equals(id).toArray())[0]
    const itemSetting = (await db.table('user_setting').where('id').equals(id).toArray())[0]
    return mapItemState(item, itemSetting)
  }
  if (name && name !== "") {
    const item = (await db.table('items').where('name').equals(name).toArray())[0]
    const itemSetting = (await db.table('user_setting').where('name').equals(name).toArray())[0]
    return mapItemState(item, itemSetting)
  }
  throw new Error('No item key matched in database')
}

function mapItemState(item: any, itemSetting: any): ItemInfo {
  return {
    id: item.id,
    name: item.name,
    category: item.detail.category,
    rarity: item.detail.rarity,
    count: (itemSetting.setting as ItemSetting).count,
    iconWithSuffix: `${item.name}.jpg`,
  }
}

export async function putItems(id: number, name: string, category: ItemType, detail: object) {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  if (typeof (category) == "string") {
    category = parseInt(category, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  await db.table('items').put({ id, name, category, detail })
}

export async function putSetting(id: number, name: string, settingType: UserSettingType, setting: ServantSetting | ItemSetting) {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  await db.table('user_setting').put({ id, name, type: settingType, setting })
}

export async function putQpSetting(setting: number) {
  const settingtype = UserSettingType.QP
  await db.table('user_setting').put({ id: QPID, name: "QP", type: settingtype, setting })
}

export async function getQpSetting(): Promise<number> {
  const results = await db.table('user_setting').where('id').equals(QPID).toArray()
  if (results.length === 0) {
    return 0
  }
  return results[0].setting
}

async function mapServantItems(results: any[]): Promise<Servant[]> {
  const queries = results.map(result => db.table('user_setting').where("id").equals(result.id).toArray())
  return Promise.all(queries).then((queries_res) => {
    return results.map((result, i) => {
      // queries_res[i] 为一个 query 查询完毕的结果，是个长度为 0 或 1 的数组，where stores the value corresponded to id in this query
      // 用 Promise.all 是为了合并结果为 Promise<Servant[]> 的形式
      const setting = queries_res[i].length !== 0 ? queries_res[i][0].setting : undefined;
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

function mapServantDetail(s: any[], settings: any[]): ServantDetail {
  if (s.length === 0) {
    throw new Error("[db.ts] No servant result")
  }
  const setting = settings.length !== 0 ? settings[0].setting : undefined;
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
      mcLink: detail.mcLink,
      skills: [
        detail.activeSkills[0].skills.slice(-1)[0],
        detail.activeSkills[1].skills.slice(-1)[0],
        detail.activeSkills[2].skills.slice(-1)[0],
        
      ],
      appendedskill: [
        detail.appendSkills[0],
        detail.appendSkills[1],
        detail.appendSkills[2],
      ],
      itemcost: detail.itemcost,
    },
    userSettings: {
      isFollow: setting ? setting.isFollow : false,
      level: {
        current: setting ? setting.level.current : 0,
        target: setting ? setting.level.target : 0
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
        { current: setting ? setting.appendedSkills[0].current : 1, target: setting ? setting.appendedSkills[0].target : 1 }, //1-10
        { current: setting ? setting.appendedSkills[1].current : 1, target: setting ? setting.appendedSkills[1].target : 1 },
        { current: setting ? setting.appendedSkills[2].current : 1, target: setting ? setting.appendedSkills[2].target : 1 },
      ]
    }
  }
}

function mapServantSetting(results: any[]): ServantSetting {
  const setting = results.length !== 0 ? results[0].setting : undefined;
  return {
    isFollow: setting ? setting.isFollow : false,
    level: {
      current: setting ? setting.level.current : 0,
      target: setting ? setting.level.target : 0
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
      { current: setting ? setting.appendedSkills[0].current : 1, target: setting ? setting.appendedSkills[0].target : 1 }, //1-10
      { current: setting ? setting.appendedSkills[1].current : 1, target: setting ? setting.appendedSkills[1].target : 1 },
      { current: setting ? setting.appendedSkills[2].current : 1, target: setting ? setting.appendedSkills[2].target : 1 },
    ]
  }
}

async function mapItemList(results: any[]): Promise<ItemInfo[]> {
  if (results.length === 0) {
    throw new Error("[db.ts] No item result")
  }
  // get user num settings
  const queries = results.map(result => db.table('user_setting').where("id").equals(result.id).toArray())
  return Promise.all(queries).then((queries_res) => {
    return results.map((result, i) => {
      const setting = queries_res[i].length !== 0 ? queries_res[i][0].setting : undefined;
      return {
        id: result.id,
        name: result.name,
        count: setting ? setting.count : 0,
        category: result.category,
        rarity: result.rarity,
        iconWithSuffix: `${result.name}.jpg`,
      }
    })
  })
}