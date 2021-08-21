import Dexie from 'dexie';
import { ServantDetail } from '../components/ServantCard';
import { Servant } from '../components/ServantList'

var db: Dexie;
var version = 2;

const SERVANT_TABLE = "id, name" // the full table will be with detail, user-setting
const USER_SETTING = "id"
const SRCINFO_TABLE = "dataversion"

export type ServantSetting = {
  isFollow: boolean;
  level: number; // 0-4
  levelTarget: number; // 0-4
  skill1: number; // 1-10
  skill2: number;
  skill3: number;
  skill1Target: number;
  skill2Target: number;
  skill3Target: number;
  extraSkill1: number;
  extraSkill2: number;
  extraSkill3: number;
  extraSkill1Target: number;
  extraSkill2Target: number;
  extraSkill3Target: number;
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
  db.table('servants').put({ id, name, detail }).catch(function (e: Error) {
    alert("[db.js] Error: " + (e.stack || e));
  })
}

export function putSetting(id: number, setting: ServantSetting) {
  db.table('user_setting').put({ id, setting }).catch(function (e: Error) {
    alert("[db.js] Error: " + (e.stack || e));
  })
}

export function putVersion(id: number, name: string, detail: object) {
  db.table('srcinfo').put({ dataversion: version }).catch(function (e: Error) {
    alert("[db.js] Error: " + (e.stack || e));
  })
}

export async function getServantList(): Promise<Servant[]> {
  const results = await db.table('servants').toArray()
  return mapServantItem(results)
}

export async function getServantDetail(id: number): Promise<ServantDetail> {
  const s = await db.table('servants').where("id").equals(id).toArray()
  const settings = await db.table('user_setting').where("id").equals(id).toArray()
  return mapServantDetail(s, settings)
}

function mapServantItem(results: any[]): Servant[] {
  return results.map((result) => {
    return {
      sNo: result.detail.no,
      sId: result.id,
      sName: result.detail.info.name,
      sNameJp: result.detail.info.nameJp,
      sClass: result.detail.info.className,
      sImg: result.detail.icon,
      skill1: 1, // TODO NEXT
      skill2: 1,
      skill3: 1,
      isFollow: false
    }
  })
}

function mapServantDetail(s: any[], settings: any[]): ServantDetail {
  if (s.length === 0) {
    throw new Error("[db.ts] No servant result")
  }
  const setting = settings[0].setting || undefined;
  const detail = s[0].detail
  return {
    basicInfo: {
      sId: s[0].id,
      sNo: detail.no,
      sName: detail.info.name,
      sNameJp: detail.info.nameJp,
      sClass: detail.info.className,
      sImg: detail.icon,
    },
    userSettings: {
      isFollow: setting ? setting.isFollow : false,
      level: setting ? setting.level : 0,
      levelTarget: setting ? setting.levelTarget : 0,
      skill1: setting ? setting.skill1 : 1,
      skill2: setting ? setting.skill2 : 1,
      skill3: setting ? setting.skill3 : 1,
      skill1Target: setting ? setting.skill1Target : 1,
      skill2Target: setting ? setting.skill2Target : 1,
      skill3Target: setting ? setting.skill3Target : 1,
      extraSkill1: setting ? setting.extraSkill1 : 1,
      extraSkill2: setting ? setting.extraSkill2 : 1,
      extraSkill3: setting ? setting.extraSkill3 : 1,
      extraSkill1Target: setting ? setting.extraSkill1Target : 1,
      extraSkill2Target: setting ? setting.extraSkill2Target : 1,
      extraSkill3Target: setting ? setting.extraSkill3Target : 1,
    }
  }
}