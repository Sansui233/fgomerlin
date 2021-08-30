import { ItemInfo } from "../pages/ItemContents"
import { ServantDetail } from "../pages/ServantCard"

export type CalcAction = {
  type: CalcActionType
  data: CalcActionData
}

export enum CalcActionType {
  // item needed changed 
  ServantLevelChanged = "level changed",
  ServantFinalLevelChanged = "finallevel changed",
  ServantSkillChanged = "skill changed",
  ServantAllChanged = "all changed",
  // item count changed
  ItemCountChanged = "item count changed"
}

export type CalcActionData = ServantDetail | ItemInfo

export const createCalcAction = (type: CalcActionType, data: CalcActionData): CalcAction => ({type, data})