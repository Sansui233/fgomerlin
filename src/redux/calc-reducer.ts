import { ItemInfo } from "../pages/ItemContents";
import { CalcAction, CalcActionType, ServantData } from "./calc-action";
import { CalcItemState, CalcState } from "./calc-state";

const initState: CalcState = { qp: 0 }

export default function calcReducer(prevstate = initState, action: CalcAction): CalcState {
  switch (action.type) {
    case CalcActionType.ItemCountChanged:
      const itemInfo = action.data as ItemInfo
      if (prevstate[itemInfo.name]) {
        return {
          ...prevstate,
          [itemInfo.name]: {
            ...(prevstate[itemInfo.name] as CalcItemState),
            count: itemInfo.count
          }
        }
      } else {
        return addItem(prevstate, itemInfo)
      }
    default: // Handle servant data changes
      const newState = { ...prevstate }
      const data = action.data as ServantData
      
      newState.qp += data.qpNeeded

      // Iterate Items
      for (const [k, v] of Object.entries(data.relatedItems)) {
        if (newState[k]) {
          (newState[k] as CalcItemState).needed += v.needed
        } else {
          newState[k] = v
        }

        // Put servant info into current Item
        const servants = (newState[k] as CalcItemState).servants
        const sIndex = servants.findIndex((s) => {
          return s.id === data.servantInfo.basicInfo.sId
        })
        if (sIndex === -1) {
          servants.push({
            id: data.servantInfo.basicInfo.sId,
            name: data.servantInfo.basicInfo.sName,
            need: v.needed,
            iconWithSuffix: data.servantInfo.basicInfo.sImg,
          })
        } else {
          servants[sIndex].need += v.needed
        }
      }

      return newState;
  }
}

function addItem(prevstate: CalcState, item: ItemInfo): CalcState {
  return {
    ...prevstate,
    [item.name]: {
      ...item,
      needed: 0,
      servants: []
    }
  }
}