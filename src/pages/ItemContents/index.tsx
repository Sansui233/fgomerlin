import React, { useState, useEffect } from 'react'
import { getItemList, putSetting } from '../../utils/db'
import {UserSettingType} from '../../utils/db-type'
import { ItemType } from "../../utils/db-type";
import {ICONBASE } from '../../utils/dataset-conf'

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
    putSetting(itemstates[i].id, itemstates[i].name ,UserSettingType.Item, { count: num })
  }

  // focus on next item when press enter
  function handleOnKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === "Tab") {
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

  return (
    <div className="items-container">
      {itemstates.map((item, i) => {
        return (
          <div className="items-item" key={item.id}>
            <img className="items-item-img" src={`${ICONBASE}/${item.iconWithSuffix}`} alt={item.name} />
            <span className="items-item-name">{item.name}</span>
            <input type="text" className="number items-item-count" data-index={i} onKeyDown={handleOnKeyDown} onBlur={handleInputOnBlur} onChange={handleInputOnChange} value={item.count} />
          </div>
        )
      })}
      <div className="items-item" style={{ visibility: "hidden", height: 0, marginTop: 0, marginBottom: 0 }}><img className="items-item-img" style={{ height: 0 }} src="" alt="" /><span style={{ height: 0 }} className="items-item-name"></span><span style={{ height: 0 }} className="items-item-count"></span></div>
      <div className="items-item" style={{ visibility: "hidden", height: 0, marginTop: 0, marginBottom: 0 }}><img className="items-item-img" style={{ height: 0 }} src="" alt="" /><span style={{ height: 0 }} className="items-item-name"></span><span style={{ height: 0 }} className="items-item-count"></span></div>
      <div className="items-item" style={{ visibility: "hidden", height: 0, marginTop: 0, marginBottom: 0 }}><img className="items-item-img" style={{ height: 0 }} src="" alt="" /><span style={{ height: 0 }} className="items-item-name"></span><span style={{ height: 0 }} className="items-item-count"></span></div>
      <div className="items-item" style={{ visibility: "hidden", height: 0, marginTop: 0, marginBottom: 0 }}><img className="items-item-img" style={{ height: 0 }} src="" alt="" /><span style={{ height: 0 }} className="items-item-name"></span><span style={{ height: 0 }} className="items-item-count"></span></div>
    </div>
  )
}
