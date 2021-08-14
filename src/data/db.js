import Dexie from 'dexie';

/**
 * @type {Dexie}
 */
var db;
var version = 1;

export function createdb() {
  db = new Dexie("FGOTEST")
  db.version(version).stores({
    servants: "id, name", // This is key column declaration. you can store any value.
  });
}

export function putServant(id, name, detail) {
  db.servants.put({ id, name, detail }).catch(function (e) {
    alert("[db.js] Error: " + (e.stack || e));
  })
}

/**
 * 获取某个从者的详细信息 TODO 这需要是异步的
 * @param {*} id
 * @returns 
 */
export function getServantDetail(id) {
  if (id != null) {
    return db.where("id").equals(id).toArray()[0].detail;
  }
}

/**
 * 获取所有从者列表。筛选给前端做渲染
 * @param {*} id
 * @returns {[{sId:string, sName:string, sClass:string, sImgurl:string}]} An array of servant object
 */
export async function getServantList() {
  const results = await db.servants.toArray()
  return results.map((result) => {
    return {
      sId: result.id, 
      sName: result.name,
      sClass: result.detail.info.className,
      sImg: result.detail.icon
    }
  })
}