import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import React from 'react';

import { Servant } from '..';
import SidebarItem from '../../../components/SidebarItemContainer';
import { ICONBASE } from '../../../utils/dataset-conf';

export default function ServantItem(props: { servant: Servant, changeFollow: (sId: number) => void }) {
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