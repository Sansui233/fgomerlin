import React, { useState, useEffect } from 'react'
import { getItemList, getItemSetting, putSetting } from '../../utils/db'
import { UserSettingType } from '../../utils/db-type'
import { ItemType } from "../../utils/db-type";
import { ICONBASE } from '../../utils/dataset-conf'
import ItemDrawer from '../../components/ItemDrawer';

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

  const [itemstates, setstate] = useState(initstate)
  const [qpstate, setqpstate] = useState(0)
  const [isShowDrawer, setShowDrawer] = useState(false)
  const [currentItem, setCurrentItem] = useState("")

  useEffect(() => {
    getItemSetting('QP').then((item) => {
      setqpstate(item.setting.count)
    })
  }, [])
  // Component on mount
  useEffect(() => {
    getItemList(category).then((infos) => {
      setstate(infos)
    })
  }, [category])

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
  }

  // focus on next item when press enter
  function handleOnKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { //TODO Tab的逻辑不太对
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
    setstate(new_itemstates)
  }

  // Only number is accepted
  function handleQpOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === "") {
      setqpstate(0)
      return
    }
    const num = parseInt(e.target.value)
    if (isNaN(num)) {
      return
    }
    setqpstate(num)
  }

  // submit data to database
  function handleQPpOnBlur(e: React.FocusEvent<HTMLInputElement>) {
    const num = parseInt(e.target.value)
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
      <img className="items-item-img" style={{ height: 0 }} src="" alt="" />
      <span style={{ height: 0 }} className="items-item-name">占位占位</span>
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
            <div className="items-item" onClick={() => { showDrawer(item.name) }} key={item.id}>
              <img className="items-item-img" src={`${ICONBASE}/${item.iconWithSuffix}`} alt={item.name} />
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
