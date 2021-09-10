import { CloseOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react'
import { ICONBASE } from '../../utils/dataset-conf';
import { getFreeQuest, getGlpkObj } from '../../utils/db';
import './index.css'

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

const ItemDrawer: React.FC<Props> = ({ item, onClose, visible }: Props) => {
  const [visibility, setVisibility] = useState(false)
  const [itemQuests, setQuests] = useState(initQuests)
  const [sortBy, setSortBy] = useState(initSort)

  useEffect(() => {
    setVisibility(visible)
  }, [visible])

  useEffect(() => {
    if(item.name === '') {return}
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

  function filterByApPerQuest(quests: Quest[], num: number): Quest[] {
    return quests.filter(q => {
      return q.appq !== 0
    }).sort((first, second) => {
      return first.appq - second.appq // asc
    }).slice(0, 10)
  }

  return (
    <aside className={visibility ? "item-drawer open" : "item-drawer"}>
      <div ref={mask} onClick={hideself} className="drawer-mask" />
      <div className="drawer-content">
        <div className="drawer-title">
          <img src={`${ICONBASE}/${item.iconWithSuffix}`} alt={item.name} className="small" />
          <h3>{item.name}</h3>
          <div className="close-button" onClick={hideself}>
            <CloseOutlined />
          </div>
        </div>
        <p className="list-title">关卡效率</p>
        {
          itemQuests.length === 0 ? "暂无数据"
            : sortBy === SortOpt.appi ?
              filterByApPerItem(itemQuests, 10).map(q => (
                <li className="quest">
                  <div className="title">{q.quest} <span className="ap">{q.appi} AP/个</span></div>
                  <div className="detail">{q.chapter + q.name}</div>
                </li>
              ))
              : filterByApPerQuest(itemQuests, 10).map(q => (
                <li>
                  <div className="title">{q.quest} <span className="ap">{q.appq} AP/次</span></div>
                  <div className="detail">{q.chapter + q.name}</div>
                </li>
              ))
        }
        <p className="list-title">从者需求</p>
      </div>
    </aside>
  )
}

export default ItemDrawer;
