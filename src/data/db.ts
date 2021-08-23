import Dexie from 'dexie';
import { ServantDetail } from '../components/ServantCard';
import { Servant } from '../components/ServantList'

var db: Dexie;
var version = 2;

const SERVANT_TABLE = "id, name" // the full table will be with detail, user-setting
const USER_SETTING = "id"
const SRCINFO_TABLE = "dataversion"

export type ServantBasic = {
  sId: number,
  sNo: number,
  sName: string,
  sNameJp: string,
  sClass: string,
  sImg: string,
  sRarity: number,
  mcLink: string
  skills: [
    { name: string, icon: string },
    { name: string, icon: string },
    { name: string, icon: string }
  ]
  appendedskill: [
    { name: string, icon: string },
    { name: string, icon: string },
    { name: string, icon: string }
  ]
}

export type ServantSetting = {
  isFollow: boolean,
  level: {current:number, target: number}, // 0-4
  finalLevel: {current:number, target: number}, //maxLevel-100
  skills: {current:number, target:number}[], // length 3
  appendedSkills: {current:number, target:number}[] // length 3
}

export function initdb() {
  db = new Dexie("FGOTEST")
  db.version(version).stores({
    servants: SERVANT_TABLE, // This is key column declaration. you can store any value.
    user_setting: USER_SETTING, // This is key column declaration. you can store any value.
    srcinfo: SRCINFO_TABLE,
  });
}

export async function putServant(id: number, name: string, detail: object) {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  db.table('servants').put({ id, name, detail }).catch(function (e: Error) {
    alert("[db.js] Error: " + (e.stack || e));
  })
}

export function putSetting(id: number, setting: ServantSetting) {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  db.table('user_setting').put({ id, setting }).catch(function (e: Error) {
    alert("[db.js] Error: " + (e.stack || e));
  })
}

export function putVersion(id: number, name: string, detail: object) {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  db.table('srcinfo').put({ dataversion: version }).catch(function (e: Error) {
    alert("[db.js] Error: " + (e.stack || e));
  })
}

export async function getServantList(): Promise<Servant[]> {
  const results = await db.table('servants').toArray()
  return mapServantItem(results)
}

export async function getServantDetail(id: number): Promise<ServantDetail> {
  if (typeof (id) == "string") {
    id = parseInt(id, 10) // 即便 TS 会类型检查，也没有办法保证传入的就一定是 number……
  }
  const s = await db.table('servants').where("id").equals(id).toArray()
  const settings = await db.table('user_setting').where("id").equals(id).toArray()
  return mapServantDetail(s, settings)
}

async function mapServantItem(results: any[]): Promise<Servant[]> {
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
      sRarity: detail.info.rarity2? detail.info.rarity2: detail.info.rarity,
      mcLink: detail.mcLink,
      skills: [
        { name: detail.activeSkills[0].skills.slice(-1)[0].name, icon: detail.activeSkills[0].skills.slice(-1)[0].icon },
        { name: detail.activeSkills[1].skills.slice(-1)[0].name, icon: detail.activeSkills[1].skills.slice(-1)[0].icon },
        { name: detail.activeSkills[2].skills.slice(-1)[0].name, icon: detail.activeSkills[2].skills.slice(-1)[0].icon },
      ],
      appendedskill: [
        { name: detail.appendSkills[0].name, icon: detail.appendSkills[0].icon + '.png' },
        { name: detail.appendSkills[1].name, icon: detail.appendSkills[1].icon + '.png' },
        { name: detail.appendSkills[2].name, icon: detail.appendSkills[2].icon + '.png' },
      ]
    },
    userSettings: {
      isFollow: setting ? setting.isFollow : false,
      level: {
        current:setting ? setting.level.current : 0,
        target: setting ? setting.level.target : 0
      },
      finalLevel: {
        current:setting ? setting.finalLevel.current : 0,
        target: setting ? setting.finalLevel.target : 0
      },
      skills: [
        {current: setting? setting.skills[0].current:1, target: setting? setting.skills[0].target:1}, //1-10
        {current: setting? setting.skills[1].current:1, target: setting? setting.skills[1].target:1},
        {current: setting? setting.skills[2].current:1, target: setting? setting.skills[2].target:1},
      ],
      appendedSkills: [
        {current: setting? setting.appendedSkills[0].current:1, target: setting? setting.appendedSkills[0].target:1}, //1-10
        {current: setting? setting.appendedSkills[1].current:1, target: setting? setting.appendedSkills[1].target:1},
        {current: setting? setting.appendedSkills[2].current:1, target: setting? setting.appendedSkills[2].target:1},
      ]
    }
  }
}