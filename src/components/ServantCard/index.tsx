import React from 'react'
import { getServantDetail, putSetting, ServantSetting } from '../../data/db'

export type ServantDetail = {
  basicInfo: {
    sId: number,
    sNo: number,
    sName: string,
    sNameJp: string,
    sClass: string,
    sImg: string,
  },
  userSettings: ServantSetting
}

function handleput() {
  putSetting(
    100100,
    {
      isFollow: false,
      level: 2,
      levelTarget: 4,
      skill1: 3,
      skill2: 4,
      skill3: 1,
      skill1Target: 3,
      skill2Target: 4,
      skill3Target: 1,
      extraSkill1: 1,
      extraSkill2: 1,
      extraSkill3: 1,
      extraSkill1Target: 1,
      extraSkill2Target: 1,
      extraSkill3Target: 1,
    }
  )
}

async function handleClick() {

  const detail = await getServantDetail(100100)
  console.log("[ServantCard] ",detail)
}

export default function ServantCard() {

  return (
    <div>
      <button onClick={handleClick}>测试get数据库功能</button>
      <button onClick={handleput}>测试put数据库功能</button>
    </div>
  )
}
