import React, { useState } from 'react'
import { List } from "antd";
import ServantItem from './ServantItem';
import { DOMAIN, parseZipDataset, ICONBASE } from "../../data/utils";
import { getServantList } from '../../data/db';

export type Servant = { sId: string, sName: string, sClass: string, sImg: string}
const initServants: Servant[] = []

export default function ServantList() {
  const [state, setState] = useState({
    servants: initServants
  })

  function handleClickFetch() {
    return parseZipDataset().then(() => { console.log("[ServantList] FetchData successfully"); })
  }

  // TODO 这个方法应该放在 onUpdatedLoaded 里面，但我不知道是什么 hook
  async function reloadFromDB() {
      const servants = await getServantList()
      console.log(`[ServantList] reload from db successfully. Total ${servants.length} items` )
      setState({servants})
  }

  return (
    <div>
      <button onClick={handleClickFetch}>刷新远程数据</button>
      <button onClick={reloadFromDB}>加载本地数据</button>
      <List
        dataSource={state.servants}
        renderItem={(s) => {
          return <ServantItem key={s.sId} {...s}></ServantItem>
        }}
      >
        <div>
          <img src={DOMAIN + ICONBASE + "/1星.png"} alt="0星.png" />
        </div>
      </List>
    </div>
  )
}
