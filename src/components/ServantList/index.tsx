import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import { message, List } from "antd";
import { FixedSizeList} from 'react-window';
import Search from 'antd/lib/input/Search';
import ServantItem from './ServantItem';
import { getServantList } from '../../data/db';
import { ReloadOutlined } from "@ant-design/icons";

export type Servant = {
  sId: number,
  sNo: number,
  sName: string,
  sNickNames: string[],
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
    isLoaded: false,
    filter_str: ""
  })

  useEffect(() => {
    reloadFromDB()
  }, [])

  async function reloadFromDB() {
    setState({ servants: state.servants, isLoaded: false, filter_str: "" })
    const servants = await getServantList()
    console.log(`[ServantList] reload from db successfully. Total ${servants.length} items`)
    setState({ servants, isLoaded: true, filter_str: "" })
    message.success('成功载入数据')
  }

  function searchOnChange(e: any) {
    const { value } = e.target;
    setState({ ...state, filter_str: value })
  }

  function filterServants(): Servant[]{
    return state.filter_str === "" ? state.servants : state.servants.filter((servant) => {
      if (servant.sName.includes(state.filter_str)) {
        return true
      }
      return servant.sNickNames.some((nickname) => {
        return nickname.includes(state.filter_str)
      })
    })
  }

  function servantItemRenderer(s:Servant){
    return (
      <Link key={s.sId} to={`/servant/${s.sId}`}>
        <ServantItem {...s}></ServantItem>
      </Link>
    )
  }

  return (
    // TODO Image 进入窗口后加载
    <div className="servant-list-container">
      <div className="toolbar">
        <Search className="search" onChange={searchOnChange} />
        <button className="clear-button reload-button" onClick={reloadFromDB}><ReloadOutlined /></button>
      </div>
      {state.isLoaded ?
        <List
          className="servant-list-content"
          dataSource={filterServants()}
          renderItem={servantItemRenderer}
        /> : <p className="loading-placeholder">Loading……</p>}
    </div>
  )
}
