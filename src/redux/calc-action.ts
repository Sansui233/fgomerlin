import { ItemInfo } from "../pages/ItemContents"
import { ServantDetail } from "../pages/ServantCard"
import { getItemInfo } from "../utils/db"
import { CalcItemState } from "./calc-state"

export type CalcAction = {
  type: CalcActionType
  data: CalcActionData
}

export enum CalcActionType {
  // item needed changed 
  ServantLevelChanged = "level changed",
  ServantFinalLevelChanged = "finallevel changed",
  ServantSkillChanged = "skill changed",
  ServantAppendedSkillChanged = "appended skill changed",
  ServantAllChanged = "all changed",
  // item count changed
  ItemCountChanged = "item count changed"
}

export type CalcActionData = ServantData | ItemInfo

export type ServantData = {
  servantInfo: ServantDetail,
  relatedItems: {
    [itemName: string]: CalcItemState // Only property 'needed' is useful
  },
  qpNeeded: number
}

export function createItemCountChangeAction(data: ItemInfo) {
  return { type: CalcActionType.ItemCountChanged, data }
}

export async function createServantChangeAction(type: CalcActionType, data: ServantDetail): Promise<CalcAction> {
  switch (type) {
    case CalcActionType.ServantSkillChanged:
      const r1 = await scanSkills(data)
      return {
        type,
        data: {
          servantInfo: data,
          relatedItems: r1.relatedItems,
          qpNeeded: r1.qp
        }
      }
    case CalcActionType.ServantAppendedSkillChanged:
      const r2 = await scanAppendSkills(data)
      return {
        type,
        data: {
          servantInfo: data,
          relatedItems: r2.relatedItems,
          qpNeeded: r2.qp
        }
      }
    case CalcActionType.ServantLevelChanged:
      const r3 = await scanAscension(data)
      return {
        type,
        data: {
          servantInfo: data,
          relatedItems: r3.relatedItems,
          qpNeeded: r3.qp
        }
      }
    case CalcActionType.ServantFinalLevelChanged:
      const r4 = await scanFinalLevel(data)
      return {
        type,
        data: {
          servantInfo: data,
          relatedItems: r4.relatedItems,
          qpNeeded: r4.qp
        }
      }
    default:
      const results = await Promise.all([scanSkills(data), scanAppendSkills(data), scanAscension(data), scanFinalLevel(data)])
      const r5 = results.reduce((prev, current) => {
        const qp = prev.qp + current.qp
        const newRelatedItems = { ...prev.relatedItems }
        // merge new promise result to prev
        for (const [k, v] of Object.entries(current.relatedItems)) {
          if (newRelatedItems[k]) {
            newRelatedItems[k].needed += v.needed
          } else {
            newRelatedItems[k] = v
          }
        }
        return {
          relatedItems: newRelatedItems,
          qp
        }
      })
      return {
        type,
        data: {
          servantInfo: data,
          relatedItems: r5.relatedItems,
          qpNeeded: r5.qp
        }
      }
  }
}

type itemQpNeeded = {
  relatedItems: { [itemName: string]: CalcItemState },
  qp: number
}

async function scanSkills(data: ServantDetail): Promise<itemQpNeeded> {
  // states
  let itemNeeded: { [name: string]: number } = {}
  let qp = 0

  // iterate skill's level items
  data.userSettings.skills.forEach((skill) => {
    const neededSkillLevels = data.basicInfo.itemcost.skill.slice(skill.current - 1, skill.target)
    neededSkillLevels.forEach(level => {
      for (const [k, v] of Object.entries(level)) {
        const itemname = k as string
        const itemnum = v as number
        if (k !== "QP") { // k is item name
          if (itemNeeded[itemname]) {
            itemNeeded[itemname] += itemnum
          } else {
            itemNeeded[itemname] = itemnum
          }
        } else { // k is QP
          qp += itemnum
        }
      }
    })
  })

  // Fetch item info from database
  const queryArr: Promise<ItemInfo>[] = []
  for (const name of Object.keys(itemNeeded)) {
    queryArr.push(getItemInfo(0, name))
  }

  return await Promise.all(queryArr).then(itemInfos => {
    let relatedItems: { [itemName: string]: CalcItemState } = {}
    itemInfos.forEach((itemInfo, i) => {
      relatedItems[itemInfo.name] = makeCalcItemState(itemInfo.name, Object.values(itemNeeded)[i], itemInfo)
    })
    return { relatedItems, qp }
  })
}

async function scanAppendSkills(data: ServantDetail): Promise<itemQpNeeded> {
  // states
  let itemNeeded: { [name: string]: number } = {}
  let qp = 0

  // iterate skill's level items
  data.userSettings.appendedSkills.forEach((skill) => {
    const neededSkillLevels = data.basicInfo.itemcost.appendSkill.slice(skill.current - 1, skill.target)
    neededSkillLevels.forEach(level => {
      for (const [k, v] of Object.entries(level)) {
        const itemname = k as string
        const itemnum = v as number
        if (k !== "QP") { // k is item name
          if (itemNeeded[itemname]) {
            itemNeeded[itemname] += itemnum
          } else {
            itemNeeded[itemname] = itemnum
          }
        } else { // k is QP
          qp += itemnum
        }
      }
    })
  })

  // Fetch item info from database
  const queryArr: Promise<ItemInfo>[] = []
  for (const name of Object.keys(itemNeeded)) {
    queryArr.push(getItemInfo(0, name))
  }

  return await Promise.all(queryArr).then(itemInfos => {
    let relatedItems: { [itemName: string]: CalcItemState } = {}
    itemInfos.forEach((itemInfo, i) => {
      relatedItems[itemInfo.name] = makeCalcItemState(itemInfo.name, Object.values(itemNeeded)[i], itemInfo)
    })
    return { relatedItems, qp }
  })
}

async function scanAscension(data: ServantDetail): Promise<itemQpNeeded> {
  // states
  let itemNeeded: { [name: string]: number } = {}
  let qp = 0

  // iterate skill's level items
  const neededAscension = data.basicInfo.itemcost.ascension.slice(data.userSettings.level.current - 1, data.userSettings.level.target)
  neededAscension.forEach((level) => {
    for (const [k, v] of Object.entries(level)) {
      const itemname = k as string
      const itemnum = v as number
      if (k !== "QP") { // k is item name
        if (itemNeeded[itemname]) {
          itemNeeded[itemname] += itemnum
        } else {
          itemNeeded[itemname] = itemnum
        }
      } else { // k is QP
        qp += itemnum
      }
    }
  })

  // Fetch item info from database
  const queryArr: Promise<ItemInfo>[] = []
  for (const name of Object.keys(itemNeeded)) {
    queryArr.push(getItemInfo(0, name))
  }

  return await Promise.all(queryArr).then(itemInfos => {
    let relatedItems: { [itemName: string]: CalcItemState } = {}
    itemInfos.forEach((itemInfo, i) => {
      relatedItems[itemInfo.name] = makeCalcItemState(itemInfo.name, Object.values(itemNeeded)[i], itemInfo)
    })
    return { relatedItems, qp }
  })
}

async function scanFinalLevel(data: ServantDetail): Promise<itemQpNeeded> {
  let levelStage = [60, 70, 75, 80, 85, 90, 92, 94, 96, 98, 100]
  let qpCost = [400000, 600000, 800000, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000]
  switch (data.basicInfo.sRarity) {
    case 2:
      levelStage = [65, 70, 75, 80, 85, 90, 92, 94, 96, 98, 100]
      qpCost = [600000, 800000, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000]
      break;
    case 3:
      levelStage = [70, 75, 80, 85, 90, 92, 94, 96, 98, 100]
      qpCost = [1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000]
      break;
    case 4:
      levelStage = [80, 85, 90, 92, 94, 96, 98, 100]
      qpCost = [4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000]
      break;
    case 5:
      levelStage = [90, 92, 94, 96, 98, 100]
      qpCost = [9000000, 10000000, 11000000, 12000000, 13000000]
      break;
    default:
      break;
  }

  const start = levelStage.indexOf(data.userSettings.finalLevel.current)
  const end = levelStage.indexOf(data.userSettings.finalLevel.target)
  let qp = 0
  if (end - start === 1) {
    qp = qpCost[start]
  } else if (end - start > 1) {
    qp = qpCost.slice(start, end).reduce((prev, v) => {
      return prev + v
    })
  }
  return {
    relatedItems: {
      "圣杯": {
        id: 2402,
        name: "圣杯",
        needed: end - start,
        count: 0,
        category: 2,
        rarity: 4,
        iconWithSuffix: "圣杯.jpg",
        servants: []
      },
    },
    qp,
  }
}

function makeCalcItemState(itemname: string, itemneed: number, itemInfo: ItemInfo): CalcItemState {
  return {
    ...itemInfo,
    needed: itemneed,
    servants: []
  }
}