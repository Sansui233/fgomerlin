import './index.css';

import { CloseOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';

import { ReactComponent as SortIcon } from '../../assets/icons/sort-amount-down-alt-solid.svg';
import { ICONBASE } from '../../utils/dataset-conf';
import { getCalcCells, getFreeQuest, getGlpkObj, getItemInfo, getServantBasic } from '../../utils/db';
import AvatarWithNumber from '../AvatarWithNumber';
import Emitter, { EvtArgTypes, EvtNames, EvtSources, ItemState } from '../../utils/events';

type Props = {
  item: {
    name: string,
    iconWithSuffix: string,
  },
  onClose: () => any,
  visible: boolean
};
enum SortOpt { appi, appq }
const initSort = SortOpt.appi
type Quest = { quest: string, appq: number, appi: number, chapter: string, name: string }
const initQuests: Quest[] = []
type SvtNeed = { id: number, name: string, iconWithSuffix: string, itemNum: number }
const initSvtNeed: SvtNeed[] = []
let initObtained: number | undefined = undefined

const ItemDrawer: React.FC<Props> = ({ item, onClose, visible }: Props) => {
  const [visibility, setVisibility] = useState(false)
  const [itemQuests, setQuests] = useState(initQuests)
  const [sortBy, setSortBy] = useState(initSort)
  const [svtNeed, setSvtNeed] = useState(initSvtNeed)
  const [obtained, setObtained] = useState(initObtained)

  useEffect(() => {
    setVisibility(visible)
  }, [visible])

  // init quest and obtained
  useEffect(() => {
    if (item.name === '') { return }
    getGlpkObj(item.name).then((row) => {
      const quests = row.quests.filter(q => q.appi !== 0)
      // Get some detail for each quest
      Promise.all(quests.map(async q => {
        return await getFreeQuest(q.quest).catch(() => undefined);
      })
      ).then(results => {
        setQuests(quests.flatMap((q, i) => {
          const r = results[i]
          return r ? [{
            ...q,
            chapter: r.detail.chapter,
            name: r.detail.name
          }] : []
        }))
      })
      // setQuests(row.quests.filter(q => q.appi !== 0))
    }).catch(e => {
      console.error(e, '\n')
      setQuests([])
    })
    getItemInfo(-1, item.name).then(itemInfo => {
      setObtained(itemInfo.count)
    }).catch(e => {
      console.error("[ItemDrawer] Unable to fetch Item Info", e)
      setObtained(undefined)
    })
  }, [item.name])

  // subscribe Item modified event
  useEffect(() => {
    const updateObtained = (src: EvtSources, newState: EvtArgTypes) => {
      const received = newState as ItemState
      if (received.name !== item.name) {
        return
      } else {
        setObtained(received.count)
      }
    }
    Emitter.addDataListener(EvtNames.ModifyItem, updateObtained)
    return () => {
      Emitter.removeListener(EvtNames.ModifyItem, updateObtained)
    }
  }, [item.name])

  // init servant need
  useEffect(() => {
    getCalcCells().then(cells => {
      const svts: SvtNeed[] = []
      // Count targetsvts in calculator
      cells.forEach((c) => {
        if (c.itemName === item.name) {
          const i = svts.findIndex((s) => {
            return s.id === c.servantId
          })
          if (i !== -1) {
            svts[i].itemNum += c.itemNum
          } else {
            svts.push({
              id: c.servantId,
              name: '',
              iconWithSuffix: '',
              itemNum: c.itemNum,
            })
          }
        }
      })
      // fill svt info
      Promise.all(svts.map((s) => {
        return getServantBasic(s.id)
      })).then(results => {
        results.forEach((r, i) => {
          svts[i].id = r.sId
          svts[i].iconWithSuffix = r.sImg
        })
      }).then(() => {
        setSvtNeed(svts)
      })
    })
  }, [item.name])

  const mask = useRef(null)
  const hideself = onClose

  function filterByApPerItem(quests: Quest[], num: number): Quest[] {
    return quests.filter(q => {
      return q.appi !== 0
    }).sort((first, second) => {
      return first.appi - second.appi // asc
    }).slice(0, 10)
  }

  function filterByPercentage(quests: Quest[], num: number): Quest[] {
    return quests.filter(q => {
      return q.appq !== 0
    }).sort((first, second) => {
      return second.appq / second.appi - first.appq / first.appi // des
    }).slice(0, 10)
  }

  function switchFilter() {
    setSortBy(s => s === SortOpt.appi ? SortOpt.appq : SortOpt.appi)
  }

  return (
    <aside className={visibility ? "item-drawer open" : "item-drawer"}>
      <div ref={mask} onClick={hideself} className="drawer-mask" />
      <div className="drawer-content">
        <div className="drawer-title">
          <img src={`${ICONBASE}/${item.iconWithSuffix}`} alt={item.name} className="small" />
          <h3>{item.name}
            <span>{obtained !== undefined ? `(持有：${obtained})` : ''}</span>
          </h3>
          <div className="close-button" onClick={hideself}>
            <CloseOutlined />
          </div>
        </div>
        <p className="list-title" onClick={switchFilter}>关卡效率
          <span>
            <SortIcon fill="currentColor" />
            {sortBy === SortOpt.appi ? "AP效率" : "掉率"}
          </span>
        </p>
        {
          itemQuests.length === 0 ? <span style={{ paddingLeft: '18px' }}>暂无数据</span>
            : sortBy === SortOpt.appi ?
              filterByApPerItem(itemQuests, 10).map(q => (
                <li key={q.quest} className="quest">
                  <div className="title">{q.quest} <span className="ap">{q.appi} AP/个</span></div>
                  <div className="detail">{q.chapter + q.name}</div>
                </li>
              ))
              : filterByPercentage(itemQuests, 10).map(q => (
                <li key={q.quest} className="quest">
                  <div className="title">{q.quest} <span className="ap">{(q.appq / q.appi).toFixed(3)} 个/次</span></div>
                  <div className="detail">{q.chapter + q.name}</div>
                </li>
              ))
        }
        <p className="list-title">从者需求</p>
        <div className="stat-svt-container">
          {svtNeed.length === 0 ? <span>无从者规划需要此材料</span> :
            svtNeed.map((s) => (
              <AvatarWithNumber key={s.id} id={s.id} name={s.name} iconWithSuffix={s.iconWithSuffix} num={s.itemNum} />
            ))
          }
        </div>
      </div>
    </aside>
  )
}

export default ItemDrawer;
