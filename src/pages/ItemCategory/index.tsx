import React, { useEffect, useState } from 'react'
import SidebarItem from '../../components/SidebarItemContainer'
import { Link } from 'react-router-dom'
import { ICONBASE } from '../../utils/dataset-conf'
import { Pages } from '../../App'
import { getItemSetting, putSetting, UserSettingType} from '../../utils/db'


export default function ItemCategory() {
  const [qpstate, setqpstate] = useState(0)

  useEffect(() => {
    getItemSetting('QP').then((item) => {
      setqpstate(item.setting.count)
    })
  }, [])

  // Only number is accepted
  function handleInputOnChange(e: React.ChangeEvent<HTMLInputElement>) {
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
  function handleInputOnBlur(e: React.FocusEvent<HTMLInputElement>) {
    const num = parseInt(e.target.value)
    putSetting(-1,'QP',UserSettingType.Item,{count: num})
  }

  return (
    <div className="item-category-container">
      <div className="currency-top">
        <div className="justify-center">
          <img className="small" src={`${ICONBASE}/QP.png`} alt="qp" />
          <span> QP: </span>
          <input type="text" className="number" name="qp" id="qp-input" onChange={handleInputOnChange} onBlur={handleInputOnBlur} value={qpstate} />
        </div>
      </div>
      <Link to={`/${Pages.itemList}/materials`}>
        <SidebarItem key="materials">
          <div className="sidebar-item-img-container" ><img src={`${ICONBASE}/英雄之证.jpg`} alt="material" /></div>
          <div className="item-category-info"><div className="item-name">材料</div></div>
        </SidebarItem>
      </Link>
      <Link to={`/${Pages.itemList}/stones`}>
        <SidebarItem key="stones">
          <div className="sidebar-item-img-container" ><img src={`${ICONBASE}/剑之辉石.jpg`} alt="stone" /></div>
          <div className="item-category-info"><div className="item-name">技能石</div></div>
        </SidebarItem>
      </Link>
      <Link to={`/${Pages.itemList}/chess`}>
        <SidebarItem key="chess">
          <div className="sidebar-item-img-container" ><img src={`${ICONBASE}/剑阶金像.jpg`} alt="chess`" /></div>
          <div className="item-category-info"><div className="item-name">职阶棋子</div></div>
        </SidebarItem>
      </Link>
    </div>
  )
}
