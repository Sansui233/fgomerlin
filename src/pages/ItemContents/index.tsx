import { useState, useEffect } from 'react'
import { getItemList, ItemType } from '../../utils/db'
import { DOMAIN, ICONBASE } from '../../utils/fetchdata'

export type ItemInfo = {
  id: number,
  name: string,
  count: number,
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

  useEffect(() => {
    getItemList(category).then((infos) => {
      setstate(infos)
    })
  }, [category])

  return (
    <div className="items-container">
      {itemstates.map((item) => {
        return (
          <div className="items-item" key={item.id}>
            <img className="items-item-img" src={`${DOMAIN}${ICONBASE}/${item.name}.jpg`} alt={item.name} />
            <span className="items-item-name">{item.name}</span>
  
              <input type="text" className="number items-item-count" name="qp" id="qp-input" defaultValue={0} />

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
