import { useState, useEffect, useCallback } from 'react'
import { Cell, countItemsNeeded, countServantInItem } from '../../utils/calculator'
import { getCalcCells, getItemList, getItemSettings, getQpSetting, ItemType, QPItemName } from '../../utils/db'
import { ItemInfo } from '../ItemContents'
import { ServantBasic } from '../ServantCard'

const initState: Cell[] = []
const initItems: {
  itemName: string;
  itemInfo: ItemInfo;
  itemNeeded: number;
}[] = []
const initItemCount: {
  itemName: string,
  itemCount: number
}[] = []
const initServants: {
  servantInfo: ServantBasic,
  itemNeeded: number
}[] = []

export default function Statistic() {
  const [cellState, setState] = useState(initState)
  const [itemsNeeded, setItemsNeed] = useState(initItems)
  const [itemsCounts, setItemsCount] = useState(initItemCount)
  const [qpCount, setQpCount] = useState(0)
  const [servantsInItem, setServants] = useState(initServants)

  useEffect(() => {
    getCalcCells().then((cells) => {
      setState(cells)
      countItemsNeeded(cells).then(results => setItemsNeed(results))
      getItemSettings().then(results => {
        const items = results.map(item => {
          return {
            itemName: item.name,
            itemCount: item.setting.count
          }
        })
        setItemsCount(items)
      })
      getQpSetting().then(result => {setQpCount(result)})
      
    })
  }, [])

  function handleItemClick(itemName: string) {
    countServantInItem(itemName, cellState).then(results => setServants(results))
  }

  return (
    <div>
      Statistic
    </div>
  )
}
