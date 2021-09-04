import { Checkbox } from 'antd'
import { count } from 'console'
import React, { useState, useEffect, useCallback } from 'react'
import { Cell, countItemsNeeded, countServantInItem } from '../../utils/calculator'
import { DOMAIN, ICONBASE } from '../../utils/dataset-conf'
import { getCalcCells, getItemSettings, getQpSetting, ItemType, QPItemName } from '../../utils/db'
import { ItemInfo } from '../ItemContents'
import { ServantBasic } from '../ServantCard'
import ItemStat from './ItemStat/ index'

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
  const [viewState, setView] = useState({
    isInsufficientOnly: false
  })

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
      getQpSetting().then(result => { setQpCount(result) })

    })
  }, [])

  function showServants(itemName: string) {
    countServantInItem(itemName, cellState).then(results => setServants(results))
  }

  function handleSetView(e: any) {
    setView({ ...viewState, isInsufficientOnly: e.target.checked })
  }

  const filter = (category: number, rarity?: number): { itemName: string, itemIconWithSuffix: string, itemNeeded: number, itemCount: number, }[] => {
    const items = itemsNeeded.filter((item) => {
      if (rarity && item.itemInfo.rarity !== rarity) {
        return false
      }
      return item.itemInfo.category === category
    })

    return items.map(item => {
      let itemCount = 0
      const it = itemsCounts.find(it => it.itemName === item.itemName)
      if (it) {
        itemCount = it.itemCount
      }
      return {
        itemName: item.itemName,
        itemIconWithSuffix: item.itemInfo.iconWithSuffix,
        itemNeeded: item.itemNeeded,
        itemCount,
      }
    })
  }

  const BaseURL = DOMAIN + ICONBASE

  const qpLeft = () => {
    const qpItem = itemsNeeded.find(item => { return item.itemName === QPItemName })
    return qpItem ? qpCount - qpItem?.itemNeeded : 0
  }

  return (
    <div className="content-scroll-container">
      <div className="statistic-content">
        <div className="statistic-toolbar">
          <Checkbox checked={viewState.isInsufficientOnly} onChange={handleSetView} /> 仅显示不足
        </div>
        {/* TODO QP 从者硬币 */}
        <div className="stats-qp">
          <img className="small" src={`${BaseURL}/QP.png`} alt="qp" />
          <span>QP</span>
          <div style={{ textAlign: 'left' }}>
            <span>所需：{qpCount}<br /></span>
            <span>剩余：<span className={qpLeft() < 0? 'insufficient': ''}>{qpLeft()}</span></span>
          </div>
        </div>
        <ItemStat title="铜素材" items={filter(2, 1)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat title="银素材" items={filter(2, 2)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat title="金素材" items={filter(2, 3)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat title="技能石" items={filter(1)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat title="职阶棋子" items={filter(3)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat title="其他素材" items={filter(2, 4)} isInsufficientOnly={viewState.isInsufficientOnly} />
      </div>
    </div>
  )
}
