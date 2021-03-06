import React, { useCallback, useEffect, useState } from 'react';

import ItemDrawer from '../../components/ItemDrawer';
import { ICONBASE } from '../../utils/dataset-conf';
import { getItemList, getItemSetting, putSetting } from '../../utils/db';
import { ItemType, UserSettingType } from '../../utils/db-type';
import Emitter, { EvtNames, EvtSources } from '../../utils/events';

export type ItemInfo = {
  id: number,
  name: string,
  count: number,
  category: number,
  rarity: number,
  iconWithSuffix: string,
}
const initstate: ItemInfo[] = []

export default function ItemContents(props: any) {
  let category: number = 1
  switch (props.match.params.category) {
    case "materials":
      category = ItemType.Material
      break;
    case "stones":
      category = ItemType.Stone
      break;
    case "chess":
      category = ItemType.Chess
      break;
    default:
      break;
  }

  const [itemstates, setitemstate] = useState(initstate)
  const [qpstate, setqpstate] = useState('0')
  const [isShowDrawer, setShowDrawer] = useState(false)
  const [currentItem, setCurrentItem] = useState("")
  const setqpWrapper = useCallback(
    (qpnum: number) => {
      const qpstr = String(qpnum)
      let result = ''
      let i = 0
      while (3 * i < qpstr.length) {
        if(i === 0){
          result = qpstr.slice(-3 * (i+1))
        }else {
          result = qpstr.slice(-3 * (i+1), -3 * i) + ',' + result
        }
        i++
      }
      if (result === '') result = '0'
      setqpstate(result)
    },
    [setqpstate],
  )

  useEffect(() => {
    getItemSetting('QP').then((item) => {
      setqpWrapper(item.setting.count)
    })
  }, [setqpWrapper])

  // Component on mount
  useEffect(() => {
    getItemList(category).then((infos) => {
      setitemstate(infos)
    }).then(() => {
      const hash = decodeURI(props.location.hash).slice(1)
      const e = document.getElementById(hash)
      if (e) {
        e?.scrollIntoView({ behavior: "smooth", block: "center" })
        setCurrentItem(hash)
        setShowDrawer(true)
      }
    })
  }, [category, props.location.hash])

  // Only number is accepted
  function handleInputOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const i = e.target.dataset.index ? parseInt(e.target.dataset.index) : -1;
    if (e.target.value === "") {
      changeItemState(i, 0)
      return
    }
    const num = parseInt(e.target.value)
    if (isNaN(num)) {
      return
    }
    changeItemState(i, num)
  }

  // submit data to database
  function handleInputOnBlur(e: React.FocusEvent<HTMLInputElement>) {
    const i = e.target.dataset.index ? parseInt(e.target.dataset.index) : -1;
    const num = parseInt(e.target.value)
    if (isNaN(num)) {
      return
    }
    putSetting(itemstates[i].id, itemstates[i].name, UserSettingType.Item, { count: num })
      .then(() => {
        Emitter.dataEmit(EvtNames.ModifyItem, EvtSources.ItemContent, {
          name: itemstates[i].name,
          count: num
        })
      })
  }

  // focus on next item when press enter
  function handleOnKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { //TODO Tab??????????????????
      const activeEl = document.activeElement ? document.activeElement as HTMLInputElement : null
      if (!activeEl) { return }
      const currentIndex = activeEl.dataset.index !== undefined ? parseInt(activeEl.dataset.index) : undefined
      if (currentIndex === undefined) { return }
      const nextEl = document.querySelector(`input[data-index="${currentIndex + 1}"]`)
      if (!nextEl) { return }
      (nextEl as HTMLInputElement).focus()
    }
  }

  function changeItemState(index: number, count: number) {
    const new_itemstates = [...itemstates]
    new_itemstates[index].count = count
    setitemstate(new_itemstates)
  }

  // Only number is accepted
  function handleQpOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === "") {
      setqpWrapper(0)
      return
    }
    const v = e.target.value.split(',').join('')
    const num = parseInt(v)
    if (isNaN(num)) {
      return
    }
    setqpWrapper(num)
  }

  // submit data to database
  function handleQPpOnBlur(e: React.FocusEvent<HTMLInputElement>) {
    const v = e.target.value.split(',').join('')
    const num = parseInt(v)
    putSetting(-1, 'QP', UserSettingType.Item, { count: num })
  }

  function showDrawer(itemName: string) {
    setShowDrawer(true);
    setCurrentItem(itemName)
  };
  function hideDrawer() {
    setShowDrawer(false)
  }

  const placeHolder = () => (
    <div className="items-item" style={{ visibility: "hidden", height: 0, marginTop: 0, marginBottom: 0 }}>
      <img className="medium" style={{ height: 0 }} src="" alt="" />
      <span style={{ height: 0 }} className="items-item-name">????????????</span>
      <span style={{ height: 0 }} className="items-item-count">
        <input type="text" className="number" defaultValue={0} />
      </span>
    </div>)

  return (
    <div className="item-content">
      <div className="item-qp">
        <img className="small" src={`${ICONBASE}/QP.png`} alt="qp" />
        <span>QP</span>
        <input type="text" className="number" name="qp" id="qp-input" onChange={handleQpOnChange} onBlur={handleQPpOnBlur} value={qpstate} />
      </div>
      <div className="items-container">
        {itemstates.map((item, i) => {
          return (
            <div className="items-item" onClick={() => { showDrawer(item.name) }} key={item.id} id={item.name}>
              <img className="medium" src={`${ICONBASE}/${item.iconWithSuffix}`} alt={item.name} />
              <span className="items-item-name">{item.name}</span>
              <div className="items-item-count">
                <input type="text" className="number" data-index={i} onClick={(e) => { e.stopPropagation() }} onKeyDown={handleOnKeyDown} onBlur={handleInputOnBlur} onChange={handleInputOnChange} value={item.count} />
              </div>
            </div>
          )
        })}
        {placeHolder()}
        {placeHolder()}
        {placeHolder()}
        {placeHolder()}
        <ItemDrawer item={{ name: currentItem, iconWithSuffix: `${currentItem}.jpg` }} onClose={hideDrawer} visible={isShowDrawer} />
      </div>
    </div>
  )
}
