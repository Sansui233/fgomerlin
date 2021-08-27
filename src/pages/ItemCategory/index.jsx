import React from 'react'
import SidebarItem from '../../components/SidebarItemContainer'
import { DOMAIN, ICONBASE } from '../../utils/fetchdata'

const BaseURL = DOMAIN + ICONBASE

export default function ItemCategory() {
  return (
    <div className="item-category-container">
      <div className="currency-top">
        <div className="justify-center">
          <img className="small" src={`${BaseURL}/QP.png`} alt="" /> QP: 111111
        </div>
      </div>
      <SidebarItem>
        <div className="sidebar-item-img-container" ><img src={`${BaseURL}/英雄之证.jpg`} alt="" /></div>
        <div className="item-category-info"><div className="item-name">材料</div></div>
      </SidebarItem>
      <SidebarItem>
        <div className="sidebar-item-img-container" ><img src={`${BaseURL}/剑之辉石.jpg`} alt="" /></div>
        <div className="item-category-info"><div className="item-name">技能石</div></div>
      </SidebarItem>
      <SidebarItem>
        <div className="sidebar-item-img-container" ><img src={`${BaseURL}/剑阶金像.jpg`} alt="" /></div>
        <div className="item-category-info"><div className="item-name">职阶棋子</div></div>
      </SidebarItem>
    </div>
  )
}
