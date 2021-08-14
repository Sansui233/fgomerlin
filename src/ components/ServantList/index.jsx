import React, { useState } from 'react'
import { List } from "antd";
import ServantItem from './ServantItem';
import { DOMAIN, parseZipDataset, ICONBASE } from "../../data/utils";
import { getServantList } from '../../data/db';

// TODO 可以考虑创建用于渲染的 Object 原型，主要是为了有更好的代码提示……以后还是用 TS 定义数据类型吧

export default function ServantList() {
  const [state, setState] = useState({
    servants: []
  })

  function handleClickFetch() {
    return parseZipDataset().then(() => { console.log("[ServantList] FetchData successfully"); })
  }

  // TODO 这个方法应该放在 onUpdatedLoaded 里面，但我不知道是什么 hook
  function reloadFromDB() {
    getServantList().then(
      servants => {
        console.log("$$", servants)
        setState({servants})
      }
    )
  }

  return (
    <div>
      <button onClick={handleClickFetch}>刷新远程数据</button>
      <button onClick={reloadFromDB}>加载本地数据</button>
      <List
        dataSource={state.servants}
        renderItem={(servant) => {
          return <ServantItem key={servant.sName} {...servant}></ServantItem>
        }}
      >
        <div>
          <img src={DOMAIN + ICONBASE + "/1星.png"} alt="0星.png" />
        </div>
      </List>
    </div>
  )
}

