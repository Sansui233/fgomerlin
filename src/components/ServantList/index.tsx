import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import { message, List } from "antd";
import Search from 'antd/lib/input/Search';
import ServantItem from './ServantItem';
import { getServantList } from '../../data/db';
import { ReloadOutlined } from "@ant-design/icons";

export type Servant = {
  sId: number,
  sNo: number,
  sName: string,
  sNameJp: string,
  sClass: string,
  sImg: string,
  skill1: number,
  skill2: number,
  skill3: number,
  isFollow: boolean,
}
const initServants: Servant[] = []

export default function ServantList() {
  const [state, setState] = useState({
    servants: initServants,
    isLoaded: false
  })

  useEffect(() => {
    reloadFromDB()
  }, [])

  // TODO 这个方法应该放在 onUpdatedLoaded 里面，但我不知道是什么 hook
  async function reloadFromDB() {
    setState({ servants: state.servants, isLoaded: false })
    const servants = await getServantList()
    console.log(`[ServantList] reload from db successfully. Total ${servants.length} items`)
    setState({ servants, isLoaded: true })
    message.success('成功载入数据')
  }

  function onSearch() {
    // TODO 搜索筛选
  }

  return (
    // TODO Image 进入窗口后加载
    <div className="servant-list-container">
      <div className="toolbar">
        <Search className="search" onSearch={onSearch} />
        <button className="clear-button reload-button" onClick={reloadFromDB}><ReloadOutlined /></button>
      </div>
      {state.isLoaded ? <List
        className="servant-list-content"
        dataSource={state.servants}
        renderItem={(s) => {
          return (
            <Link key={s.sId} to={`/servant/${s.sId}`}>
              <ServantItem {...s}></ServantItem>
            </Link>
          )
        }}
      >
        <div>
        </div>
      </List> : <p className="loading-placeholder">Loading……</p>}

    </div>
  )
}
