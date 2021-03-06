import React, { useCallback, useEffect, useMemo, useState } from 'react';

import ItemDrawer from '../../components/ItemDrawer';
import { countItemsNeeded } from '../../utils/calculator';
import { ICONBASE } from '../../utils/dataset-conf';
import { getCalcCells, getItemSettings } from '../../utils/db';
import { ItemInfo } from '../ItemContents';
import ItemStat from './ItemStat/ index';

const initItems: {
  itemName: string;
  itemInfo: ItemInfo;
  itemNeeded: number;
}[] = []
const initItemCount: {
  itemName: string,
  itemCount: number
}[] = []

export default function Statistic() {
  console.debug('---- render statistic ----')
  const [itemsNeeded, setItemsNeed] = useState(initItems)
  const [itemsCounts, setItemsCount] = useState(initItemCount)
  const [viewState, setView] = useState({
    isInsufficientOnly: false
  })
  const [currentItem, setCurrentItem] = useState("")
  const [isShowDrawer, setShowDrawer] = useState(false)

  useEffect(() => {
    console.debug('% statistic on Change')
    getCalcCells().then((cells) => {
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

  function handleSetView(e: any) {
    console.debug('set view opt')
    setView({ ...viewState, isInsufficientOnly: e.target.checked })
  }

  const filter = useCallback(
    (category: number, rarity?: number): { itemName: string, itemIconWithSuffix: string, itemNeeded: number, itemCount: number, }[] => {
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
    },
    [itemsCounts, itemsNeeded],
  )

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
    <React.Fragment>
      <div className="statistic-content">
        <div className="statistic-toolbar">
          <div className="statistic-toolbar-content">
            <input type="checkbox"
              id='insufficient'
              checked={viewState.isInsufficientOnly}
              onChange={handleSetView} />
            <label htmlFor='insufficient'><span>???????????????</span></label>
          </div>
        </div>
        <div className="stats-qp">
          <img className="small" src={`${ICONBASE}/QP.png`} alt="qp" />
          <span>QP</span>
          <div style={{ textAlign: 'left' }}>
            <span>?????????{qpNeeded().toLocaleString()}<br /></span>
            <span>?????????<span className={qpLeft() < 0 ? 'insufficient' : ''}>{qpLeft().toLocaleString()}</span></span>
          </div>
        </div>
        <ItemStat showDrawer={showDrawer} title="?????????" items={useMemo(() => {console.debug('filter items ???');return filter(2, 1)}, [filter])} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat showDrawer={showDrawer} title="?????????" items={useMemo(() => filter(2, 2), [filter])} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat showDrawer={showDrawer} title="?????????" items={useMemo(() => filter(2, 3), [filter])} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat showDrawer={showDrawer} title="?????????" items={useMemo(() => filter(1), [filter])} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat showDrawer={showDrawer} title="????????????" items={useMemo(() => filter(3), [filter])} isInsufficientOnly={viewState.isInsufficientOnly} />
        <ItemStat showDrawer={showDrawer} title="????????????" items={useMemo(() => filter(2, 4), [filter])} isInsufficientOnly={viewState.isInsufficientOnly} />
      </div>
      <ItemDrawer item={{ name: currentItem, iconWithSuffix: `${currentItem}.jpg` }} onClose={hideDrawer} visible={isShowDrawer} />
    </React.Fragment>
  )
}
