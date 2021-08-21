import React from 'react'
import { Servant } from '..'
import { DOMAIN, ICONBASE } from '../../../data/utils'
import {HeartOutlined, HeartFilled} from "@ant-design/icons"

export default function ServantItem(props: Servant) {
  const { sId, sNo, sName, sNameJp, sClass, sImg, skill1,skill2,skill3,isFollow } = props

  return (
    <div className="servant-item-container" key={sId}>
      <div className="servant-item-img-container">
        <img src={DOMAIN + ICONBASE + "/" + sImg} alt={sName} />
      </div>
      <div className="servant-item-info">
        <p className="servant-item-info-name">{sName}</p>
        <p className="servant-item-info-namejp">{sNameJp}</p>
        <p className="servant-item-info-other">No.{sNo} {sClass}</p>
      </div>
      <div className="servant-item-skills">
        {skill1}/{skill2}/{skill3}
      </div>
      <div className="servant-item-like">
        {isFollow?<HeartFilled className="like"/>:<HeartOutlined/>}
      </div>
    </div>

  )
}