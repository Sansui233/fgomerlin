import React from 'react';

import { ICONBASE } from '../../../utils/dataset-conf';

export default function ItemStat(props: {
  title: string, isInsufficientOnly: boolean, items: {
    itemName: string,
    itemIconWithSuffix: string,
    itemNeeded: number,
    itemCount: number,
  }[], showDrawer: (name: string) => any
}) {

  const filteritems = (isInsufficientOnly: boolean, items: {
    itemName: string,
    itemIconWithSuffix: string,
    itemNeeded: number,
    itemCount: number,
  }[]) => {
    return items.filter((item) => {
      const left = item.itemCount - item.itemNeeded
      if (props.isInsufficientOnly && left > 0) {
        return false
      }
      return true
    })
  }

  const itemRenderer = (itemName: string, itemIconWithSuffix: string, itemNeeded: number, itemCount: number) => {
    const left = itemCount - itemNeeded
    return (
      <div className="stats-item-container" key={itemName} onClick={()=>{props.showDrawer(itemName)}}>
        <img src={`${ICONBASE}/${itemIconWithSuffix}`} alt={itemName} className="medium" />
        <p>{itemName}</p>
        <div className="stats-info">
          <span>所需：</span>
          <span style={{ textAlign: "right" }}>{itemNeeded}</span>
          <span>剩余：</span>
          <span style={{ textAlign: "right" }} className={left < 0 ? "insufficient" : ""}>{left}</span>
        </div>
      </div>)
  }

  const placeHolderRender = () => {
    return (
      <div className="stats-item-container" style={{ height: 0, margin: 0, padding: 0, visibility: 'hidden' }}>
        <img src={`${ICONBASE}/`} alt="" className="medium" />
        <p>占位占位</p>
        <div className="stats-info">
          <span>占位：</span>
          <span style={{ textAlign: "right" }}>1234</span>
          <span>占位</span>
          <span style={{ textAlign: "right" }}>1234</span>
        </div>
      </div>)

  }

  // If null
  if (filteritems(props.isInsufficientOnly, props.items).length === 0) {
    return <div></div>
  } else {
    return (
      <section>
        <p className="list-title">{props.title}</p>
        <div className="stat-items-container">
          {filteritems(props.isInsufficientOnly, props.items).map((item) => {
            return itemRenderer(item.itemName, item.itemIconWithSuffix, item.itemNeeded, item.itemCount)
          })}
          {placeHolderRender()}
          {placeHolderRender()}
          {placeHolderRender()}
        </div>
      </section>
    )
  }
}
