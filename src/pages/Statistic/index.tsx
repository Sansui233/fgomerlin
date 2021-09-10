import { Checkbox } from 'antd'
import { useState, useEffect } from 'react'
import ItemDrawer from '../../components/ItemDrawer'
import { Cell, countItemsNeeded, countServantsInItem } from '../../utils/calculator'
import { ICONBASE } from '../../utils/dataset-conf'
import { getCalcCells, getItemSettings } from '../../utils/db'
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
  const [servantsInItem, setServants] = useState(initServants)
  const [viewState, setView] = useState({
    isInsufficientOnly: false
  })
  const [currentItem, setCurrentItem] = useState("")
  const [isShowDrawer, setShowDrawer] = useState(false)

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
      getItemSettings()
    })
  }, [])

  function showServants(itemName: string) {
    countServantsInItem(itemName, cellState).then(results => setServants(results))
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

  const qpNeeded = () => {
    const qpItem = itemsNeeded.find(item => { return item.itemName === "QP" })
    return qpItem ? qpItem.itemNeeded : 0
  }

  const qpCount = () => {
    const qpItem = itemsCounts.find(item => { return item.itemName === "QP" })
    return qpItem ? qpItem.itemCount : 0
  }

  const qpLeft = () => {
    return qpCount() - qpNeeded()
  }

  function showDrawer(itemName: string) {
    setShowDrawer(true);
    setCurrentItem(itemName)
  };
  function hideDrawer() {
    setShowDrawer(false)
  }

  return (
      <div className="statistic-content">
        <div className="statistic-toolbar">
          <div className="statistic-toolbar-content">
            <Checkbox checked={viewState.isInsufficientOnly} onChange={handleSetView} /> 仅显示不足
          </div>
        </div>
        <div className="stats-qp">
          <img className="small" src={`${ICONBASE}/QP.png`} alt="qp" />
          <span>QP</span>
          <div style={{ textAlign: 'left' }}>
            <span>所需：{qpNeeded()}<br /></span>
            <span>剩余：<span className={qpLeft() < 0 ? 'insufficient' : ''}>{qpLeft()}</span></span>
          </div>
        </div>
        <ItemStat showDrawer={showDrawer} title="铜素材" items={filter(2, 1)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat showDrawer={showDrawer} title="银素材" items={filter(2, 2)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat showDrawer={showDrawer} title="金素材" items={filter(2, 3)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat showDrawer={showDrawer} title="技能石" items={filter(1)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat showDrawer={showDrawer} title="职阶棋子" items={filter(3)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat showDrawer={showDrawer} title="其他素材" items={filter(2, 4)} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemDrawer item={{name: currentItem,iconWithSuffix: `${currentItem}.jpg`}} onClose={hideDrawer} visible={isShowDrawer}/>
      </div>
  )
}
