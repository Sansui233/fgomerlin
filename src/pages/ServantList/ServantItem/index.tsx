import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { Servant } from '..';
import { Pages } from '../../../App';
import SidebarItem from '../../../components/SidebarItemContainer';
import { ICONBASE } from '../../../utils/dataset-conf';

function ServantItem(props: { servant: Servant, changeFollow: (sId: number) => void }) {
  const { sId, sNo, sName, sNameJp, sClass, sImg, skill1, skill2, skill3, isFollow } = props.servant

  return (
    <SidebarItem key={sId}>
      <div className="sidebar-item-img-container">
        <img className="medium" src={ICONBASE + "/" + sImg} alt={sName} />
      </div>
      <div className="servant-item-info">
        <p className="servant-item-info-name">{sName}</p>
        <p className="servant-item-info-namejp">{sNameJp}</p>
        <p className="servant-item-info-other">No.{sNo} {sClass}</p>
      </div>
      <div className="servant-item-skills">
        {skill1}/{skill2}/{skill3}
      </div>
      <div className="servant-item-like" onClick={(e) => { props.changeFollow(sId); e.preventDefault(); e.stopPropagation();}}>
        {isFollow ? <HeartFilled className="like" /> : <HeartOutlined />}
      </div>
    </SidebarItem>
  )
}

type Props = {
  s: Servant,
  changeFollow: (sId:number)=>void,
  removeCurrentOnSidebar: () => void
}

export function servantItemRenderer({s, changeFollow, removeCurrentOnSidebar}: Props) {
  return (
    <Link key={s.sId} to={`/${Pages.servantList}/${s.sId}`} onClick={removeCurrentOnSidebar}>
      <ServantItem servant={s} changeFollow={changeFollow}></ServantItem>
    </Link>
  )
}

