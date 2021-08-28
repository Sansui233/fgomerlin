import React, { useEffect, useState, useCallback } from 'react'
import { Link } from "react-router-dom";
import { ReloadOutlined } from "@ant-design/icons";
import { FixedSizeList } from 'react-window';
import Search from 'antd/lib/input/Search';
import ServantItem from './ServantItem';
import { getServantList, getServantSetting, putSetting, UserSettingType } from '../../utils/db';
import Emitter, { EvtArgTypes, EvtNames, EvtSources, ServantState } from '../../utils/events'
import { Pages } from '../../App';

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

export default function ServantList(props: {removeCurrentOnSidebar: () => void}) {
  const [state, setState] = useState({
    servants: initServants,
    isLoaded: false,
    filter_str: ""
  })

  // Load when mounted
  useEffect(() => {
    reloadFromDB().then()
  }, [])

  // Subscribe event
  useEffect(() => {
    function updateState(src: EvtSources, newState: EvtArgTypes) {
      if (src === EvtSources.ServantSidebar) {
        return // Don't Update if this event is emitted from here
      }
      if (state.servants.length === 0) {
        console.error("Servant list is not initialized")
        return
      }
      const sIndex = state.servants.findIndex(servant => servant.sId === newState.id)
      const s = state.servants[sIndex]
      const st = newState as ServantState;
      const newServants = [...state.servants];
      newServants[sIndex] = {
        ...s,
        isFollow: st.isFollow !== undefined ? st.isFollow : s.isFollow,
        skill1: st.skills ? st.skills[0] : s.skill1,
        skill2: st.skills ? st.skills[1] : s.skill2,
        skill3: st.skills ? st.skills[2] : s.skill3,
      }
      setState({ ...state, servants: newServants })
    }
    Emitter.addDataListener(EvtNames.ModifyServant, updateState)
    return () => {
      Emitter.removeListener(EvtNames.ModifyServant, updateState)
    }
  }, [state.servants]) // Unless state will always be 0

  async function reloadFromDB() {
    setState({ servants: state.servants, isLoaded: false, filter_str: "" })
    const servants = await getServantList()
    console.log(`[ServantList] reload from db successfully. Total ${servants.length} items`)
    setState({ servants, isLoaded: true, filter_str: "" })
  }

  function searchOnChange(e: any) {
    const { value } = e.target;
    setState({ ...state, filter_str: value })
  }

  function changeFollow(sId: number) {
      const i = state.servants.findIndex((s:Servant) => {
        return sId === s.sId
      })
      const s = state.servants[i]
      const newServants = [...state.servants]
      newServants[i] = { ...s, isFollow: !s.isFollow}
      getServantSetting(sId).then((setting) => {
        putSetting(sId, UserSettingType.Servant ,{ ...setting, isFollow: !s.isFollow }).then(() => {
          setState({ ...state, servants: newServants })
          Emitter.dataEmit(EvtNames.ModifyServant, EvtSources.ServantSidebar, {
            id: sId,
            isFollow: !s.isFollow
          })
        })
      }).catch((e: Error) => {
        console.error('error when update', e, e.stack)
      })
  }

  function filterServants(query: string): Servant[] {
    return query === "" ? state.servants : state.servants.filter((servant) => {
      if (servant.sName.includes(query)) {
        return true
      }
      return servant.sNickNames.some((nickname) => {
        return nickname.includes(query)
      })
    })
  }

  const memServantFilter = useCallback(() => filterServants(state.filter_str), [state.filter_str, state.servants])

  function servantItemRenderer(s: Servant) {
    return (
      <Link key={s.sId} to={`/${Pages.servantList}/${s.sId}`} onClick={props.removeCurrentOnSidebar}>
        <ServantItem servant={s} changeFollow={changeFollow}></ServantItem>
      </Link>
    )
  }

  return (
    <div className="servant-list-container">
      <div className="toolbar">
        <Search className="search" onChange={searchOnChange} />
        <button className="clear-button reload-button" onClick={reloadFromDB}><ReloadOutlined /></button>
      </div>
      {state.isLoaded ?
        <FixedSizeList
          className="servant-list-content"
          itemCount={memServantFilter().length}
          height={1080}
          width={394}
          itemSize={76 + 7}
        >
          {({ index, style }) => {
            return (
              <div style={style}>
                {servantItemRenderer(memServantFilter()[index])}
              </div>
            )
          }}
        </FixedSizeList> : <p className="loading-placeholder">Loading……</p>}
    </div>
  )
}
