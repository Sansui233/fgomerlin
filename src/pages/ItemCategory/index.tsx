import SidebarItem from '../../components/SidebarItemContainer'
import { Link } from 'react-router-dom'
import { ICONBASE } from '../../utils/dataset-conf'
import { Pages } from '../../App'


export default function ItemCategory() {

  return (
    <div className="item-category-container">
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
