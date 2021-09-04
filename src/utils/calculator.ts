import { ItemInfo } from "../pages/ItemContents"
import { ServantBasic, ServantDetail } from "../pages/ServantCard"
import { ItemCostFormat } from "./dataset-conf"
import { getItemInfo, getServantBasic} from "./db"
import { ServantSetting } from "./db-type"

export type Cell = {
  // indexes
  servantId: number,
  cellType: CellType,
  cellTargetLevel: number,
  itemName: string,
  // cell
  itemNum: number,
}

export enum CellType {
  ascension,
  finalLevel,
  skill1,
  skill2,
  skill3,
  askill1,
  askill2,
  askill3,
}


export function composeCalcCells(s: ServantDetail): Cell[] {
  const sId = s.basicInfo.sId
  const rarity = s.basicInfo.sRarity
  const itemCost = s.basicInfo.itemCost
  const setting = s.userSettings
  return scanSkills(sId, setting, itemCost)
    .concat(scanAppendedSkills(sId, setting, itemCost))
    .concat(scanAscention(sId, setting, itemCost))
    .concat(scanFinalLevel(sId, rarity, setting))
}

function scanSkills(servantId: number, setting: ServantSetting, itemCost: ItemCostFormat): Cell[] {
  const cells: Cell[] = []
  // Iterate skill
  setting.skills.forEach((skillSetting, i) => {
    const start = skillSetting.current
    const end = skillSetting.target
    const cellType = i === 0 ? CellType.skill1 : i === 1 ? CellType.skill2 : CellType.skill3
    itemCost.skill.forEach((items, levelBegin) => {
      // start range: 1-10
      // end range: 1-10
      // levelBegin range: 0-8
      // levelBegin 0 -> trueLevel start 1 to end 2
      if (levelBegin + 2 <= end && levelBegin + 2 > start) {
        for (const [k, v] of Object.entries(items)) {
          const itemName = k as string
          const itemNum = v as number
          cells.push({
            servantId,
            cellType,
            cellTargetLevel: levelBegin + 2,
            itemName,
            itemNum
          })
        }
      }
    });
  })
  return cells
}

function scanAppendedSkills(servantId: number, setting: ServantSetting, itemCost: ItemCostFormat): Cell[] {
  const cells: Cell[] = []
  // Iterate skill
  setting.appendedSkills.forEach((skillSetting, i) => {
    const start = skillSetting.current
    const end = skillSetting.target
    const cellType = i === 0 ? CellType.askill1 : i === 1 ? CellType.askill2 : CellType.askill3
    // when current level >= 1
    itemCost.appendSkill.forEach((items, levelBegin) => {
      // start range: 0-10
      // end range: 0-10
      // levelBegin range: 0-8
      // levelBegin 0 -> trueLevel start 1 to end 2
      if (levelBegin + 2 > start && levelBegin + 2 <= end) {
        for (const [k, v] of Object.entries(items)) {
          const itemName = k as string
          const itemNum = v as number
          cells.push({
            servantId,
            cellType,
            cellTargetLevel: levelBegin + 2,
            itemName,
            itemNum
          })
        }
      }
    });
    // when current level == 0 and target level > 0, add servant coins
    if (start === 0 && end > 0) {
      cells.push({
        // indexes
        servantId,
        cellType,
        cellTargetLevel: 1,
        itemName: "从者硬币",
        // cell
        itemNum: 120,
      })
    }

  })
  return cells
}

function scanAscention(servantId: number, setting: ServantSetting, itemCost: ItemCostFormat): Cell[] {
  const cells: Cell[] = []

  const start = setting.ascension.current
  const end = setting.ascension.target
  // start range 0-4
  // end range 0-4
  // itemcost index 0-3
  // itemcost index 0 -> start 0 to end 1
  itemCost.ascension.forEach((items, index) => {
    if (index + 1 > start && index + 1 <= end) {
      for (const [k, v] of Object.entries(items)) {
        const itemName = k as string
        const itemNum = v as number
        cells.push({
          servantId,
          cellType: CellType.ascension,
          cellTargetLevel: index + 1,
          itemName: itemName,
          itemNum: itemNum,
        })
      }
    }
  })

  return cells
}

function scanFinalLevel(servantId: number, rarity: number, setting: ServantSetting): Cell[] {
  const cells: Cell[] = []
  const { levelStage, qpCost } = qpCostGenerator(rarity)
  const start = levelStage.indexOf(setting.finalLevel.current)
  const end = levelStage.indexOf(setting.finalLevel.target)
  // start range 0 - (levelStage.length-1) exp. 0-10 len 11
  // end range 0 - (levelStage.length-1)
  // qpCost index 0 -> start 0 end 1        exp.0-9 len 10
  // qpCost 9 -> start 8 end 9
  qpCost.forEach((qp, index) => {
    if (index + 1 <= end && index + 1 > start) {
      cells.push({
        servantId,
        cellType: CellType.finalLevel,
        cellTargetLevel: levelStage[index + 1],
        itemName: 'QP',
        itemNum: qp
      })
      cells.push({
        servantId,
        cellType: CellType.finalLevel,
        cellTargetLevel: levelStage[index + 1],
        itemName: "圣杯",
        itemNum: 1
      })
    }
  })

  return cells
}

export async function countItemsNeeded(cells: Cell[]){
  const items: {
    itemName: string,
    itemInfo: ItemInfo,
    itemNeeded: number,
  }[] = []

  for (const cell of cells) {
    const i = items.findIndex((item) => {return item.itemName === cell.itemName})
    if(i === -1){
      const itemInfo = await getItemInfo(-1, cell.itemName)
      items.push({
        itemName: cell.itemName,
        itemInfo,
        itemNeeded: cell.itemNum
      })
    }else{
      items[i].itemNeeded += cell.itemNum
    }
  }

  return items
}

export async function countServantInItem(itemName: string, cells: Cell[]){
  const servants: {
    servantInfo: ServantBasic,
    itemNeeded: number
  }[] = []

  for (const cell of cells) {
    if(cell.itemName === itemName){
      const i = servants.findIndex(s=> {return s.servantInfo.sId === cell.servantId})
      if(i === -1){
        servants.push({
          servantInfo: await getServantBasic(cell.servantId),
          itemNeeded: cell.itemNum
        })
      }else {
        servants[i].itemNeeded += cell.itemNum
      }
    }
  }
  
  return servants
}

const qpCostGenerator = (rarity: number): { levelStage: number[], qpCost: number[] } => {
  switch (rarity) {
    case 0:
      return {
        levelStage: [65, 70, 75, 80, 85, 90, 92, 94, 96, 98, 100],
        qpCost: [600000, 800000, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000]
      }
    case 1:
      return {
        levelStage: [60, 70, 75, 80, 85, 90, 92, 94, 96, 98, 100],
        qpCost: [400000, 600000, 800000, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000]
      }
    case 2:
      return {
        levelStage: [65, 70, 75, 80, 85, 90, 92, 94, 96, 98, 100],
        qpCost: [600000, 800000, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000]
      }
    case 3:
      return {
        levelStage: [70, 75, 80, 85, 90, 92, 94, 96, 98, 100],
        qpCost: [1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000]
      }
    case 4:
      return {
        levelStage: [80, 85, 90, 92, 94, 96, 98, 100],
        qpCost: [4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000]
      }
    case 5:
      return {
        levelStage: [90, 92, 94, 96, 98, 100],
        qpCost: [9000000, 10000000, 11000000, 12000000, 13000000]
      }
    default:
      console.error(`rarity ${rarity} is out of range `)
      return {
        levelStage: [],
        qpCost: []
      }
  }
}