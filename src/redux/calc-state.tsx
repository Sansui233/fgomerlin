// Dynamically add property into state
// to avoid massive computation of array
export type CalcState  = {
  [key: string]: CalcItemState
}


export type CalcItemState = {
  id: number,
  name: string, 
  needed: number,
  count: number,
  category: number,
  rarity: number,
  iconWithSuffix: string,
  servants: ServantInItemInCalc[]
}

export type ServantInItemInCalc = {
  id: number,
  name: string,
  needed: number
  iconWithSuffix: string,
}