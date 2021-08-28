import React from 'react'
import SidebarItem from '../../components/SidebarItemContainer'
import { Link } from 'react-router-dom'
import { DOMAIN, ICONBASE } from '../../utils/fetchdata'
import { Pages } from '../../App'

const BaseURL = DOMAIN + ICONBASE

export default function ItemCategory() {
  return (
    <div className="item-category-container">
      <div className="currency-top">
        <div className="justify-center">
          <img className="small" src={`${BaseURL}/QP.png`} alt="qp" />
          <span> QP: </span>
          <input type="text" className="number" name="qp" id="qp-input" defaultValue={0}/>
        </div>
      </div>
      <Link to={`/${Pages.itemList}/materials`}>
        <SidebarItem>
          <div className="sidebar-item-img-container" ><img src={`${BaseURL}/英雄之证.jpg`} alt="material" /></div>
          <div className="item-category-info"><div className="item-name">材料</div></div>
        </SidebarItem>
      </Link>
      <Link to={`/${Pages.itemList}/stones`}>
        <SidebarItem>
          <div className="sidebar-item-img-container" ><img src={`${BaseURL}/剑之辉石.jpg`} alt="stone" /></div>
          <div className="item-category-info"><div className="item-name">技能石</div></div>
        </SidebarItem>
      </Link>
      <Link to={`/${Pages.itemList}/chess`}>
        <SidebarItem>
          <div className="sidebar-item-img-container" ><img src={`${BaseURL}/剑阶金像.jpg`} alt="chess`" /></div>
          <div className="item-category-info"><div className="item-name">职阶棋子</div></div>
        </SidebarItem>
      </Link>
    </div>
  )
}
