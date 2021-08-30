import { CalcAction, CalcActionType } from "./calc-action";
import { CalcState } from "./calc-state";

const initState: CalcState = {}

export default function calcReducer(prevstate = initState, action: CalcAction){
  switch (action.type) {
    case CalcActionType.ItemCountChanged:

      break;
  
    default:
      break;
  }
}