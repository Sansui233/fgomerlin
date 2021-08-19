import Dexie from 'dexie';
import {Servant} from '../components/ServantList'

var db: Dexie;
var version = 1;

const SERVANT_TABLE = "id, name"

export function createdb() {
  db = new Dexie("FGOTEST")
  db.version(version).stores({
    servants: SERVANT_TABLE, // This is key column declaration. you can store any value.
  });
}

// see SERVANT_TABLE TODO 参数列表能不能自动更新啊？
export function putServant(id:string, name:string, detail:object) {
  db.table('servants').put({id, name, detail }).catch(function (e: Error) {
    alert("[db.js] Error: " + (e.stack || e));
  })
}

export async function getServantDetail(id: string): Promise<object | null> {
  if (id != null) {
    const s = await db.table('servants').where("id").equals(id).toArray()
    return s[0].detail;
  }
  return null
}

export async function getServantList(): Promise<Servant[]> {
  const results = await db.table('servants').toArray()
  return results.map((result) => {
    return {
      sId: result.id, 
      sName: result.detail.info.name,
      sClass: result.detail.info.className,
      sImg: result.detail.icon,
    }
  })
}