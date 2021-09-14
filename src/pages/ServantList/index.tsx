import {
  FilterFilled,
  FilterOutlined,
  HeartFilled,
  HeartOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import { Popover } from 'antd';
import Search from 'antd/lib/input/Search';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';

import { Pages } from '../../App';
import cookies from '../../lib/cookies';
import { PhantasmCategory, PhantasmColor, ServantClass } from '../../utils/dataset-type';
import { getServantList, getServantSetting, putSetting } from '../../utils/db';
import { UserSettingType } from '../../utils/db-type';
import Emitter, { EvtArgTypes, EvtNames, EvtSources, ServantState } from '../../utils/events';
import ServantItem from './ServantItem';

export type Servant = {
  sId: number,
  sNo: number,
  sName: string,
  sNickNames: string[],
  sNameJp: string,
  sClass: ServantClass,
  sImg: string,
  sRarity: number,
  skill1: number,
  skill2: number,
  skill3: number,
  phantasmColor: PhantasmColor[],
  phantasmCategory: PhantasmCategory[],
  isFollow: boolean,
}
const initServants: Servant[] = []

type FilterOption = {
  sClass: string[],
  sPhantasmColor: PhantasmColor[] // Quick Art Buster TODO should use Set instead of Array
  sPhantasmCategory: PhantasmCategory[], // 全体 单体 辅助
}
const initFilter: FilterOption = {
  sClass: [],
  sPhantasmColor: [],
  sPhantasmCategory: [],
}

const sortOptions = ['rareasc', 'raredsc', 'noasc', 'nodsc', 'classasc', 'classdsc'] as const
type sortTuple = typeof sortOptions;
type SortOption = sortTuple[number]
const initSortopt: SortOption = cookies.getCookie('sort_option') as SortOption || 'noasc'

export default function ServantList(props: { removeCurrentOnSidebar: () => void }) {
  const [state, setState] = useState({
    servants: initServants,
    isLoaded: false,
    needFollow: false,
    query: "",
    filter_options: initFilter,
    sort_option: initSortopt
  })
  const [filterVisible, setfiltervisible] = useState(false)
  // const [sorterVisible, setsortervisible] = useState(false)

  const reloadFromDB = useCallback(
    async () => {
      setState(s => {
        return { ...s, isLoaded: false, }
      })
      const servants = await getServantList()
      console.log(`[ServantList] reload from db successfully. Total ${servants.length} items`)
      setState(s => {
        return {
          servants,
          needFollow: cookies.getCookie('filter_follow') === 'true' ? true : false,
          isLoaded: true,
          query: "",
          filter_options: initFilter,
          sort_option: cookies.getCookie('sort_option') as SortOption || 'noasc'
        }
      })
    },
    [],
  )

  // Load when mounted
  useEffect(() => {
    reloadFromDB().then()
  }, [reloadFromDB])

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
      setState(s => { return { ...s, servants: newServants } })
    }
    Emitter.addDataListener(EvtNames.ModifyServant, updateState)
    return () => {
      Emitter.removeListener(EvtNames.ModifyServant, updateState)
    }
  }, [state.servants]) // Unless state will always be 0


  function searchOnChange(e: any) {
    const { value } = e.target;
    setState({ ...state, query: value })
  }

  function changeFollow(sId: number) {
    const i = state.servants.findIndex((s: Servant) => {
      return sId === s.sId
    })
    const s = state.servants[i]
    const newServants = [...state.servants]
    newServants[i] = { ...s, isFollow: !s.isFollow }
    getServantSetting(sId).then((setting) => {
      putSetting(sId, s.sName, UserSettingType.Servant, { ...setting, isFollow: !s.isFollow }).then(() => {
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

  function changeFilterFollow() {
    cookies.setCookie('filter_follow', (!state.needFollow).toString())
    setState({ ...state, needFollow: !state.needFollow })
  }

  function setFilteropt(opt: FilterOption) {
    setState(s => {
      return {
        ...s,
        filter_options: { ...opt }
      }
    })
  }
  function setSortopt(opt: SortOption) {
    setState(s => {
      return {
        ...s,
        sort_option: opt
      }
    })
    cookies.setCookie('sort_option', opt)
  }

  function matchQueryString(servant: Servant, query: string) {
    if (query !== "") {
      query = query.toLowerCase()
      if (servant.sName.toLowerCase().includes(query)) {
        return true
      }
      if (servant.sNickNames.some((nickname) => {
        return nickname.toLowerCase().includes(query)
      })) {
        return true
      }
      return false
    }
    // if query is empty
    return true
  }

  function matchQueryOpt(servant: Servant, opt: FilterOption): boolean {
    const classMatch = opt.sClass.length === 0 ?
      true
      :
      opt.sClass.some(cla => {
        if (cla !== 'Other') {
          return cla === servant.sClass
        } else {
          return ['Ruler', 'Avenger', 'MoonCancer', 'Alterego', 'Foreigner', 'Pretender', 'Beast'].includes(servant.sClass)
        }
      })
    const colorMatch = opt.sPhantasmColor.length === 0 ?
      true
      :
      opt.sPhantasmColor.some(ph => {
        return servant.phantasmColor.some(sph => sph === ph)
      })
    const categoryMatch = opt.sPhantasmCategory.length === 0 ?
      true
      :
      opt.sPhantasmCategory.some(phc => {
        return servant.phantasmCategory.some(sphc => sphc === phc)
      })
    return classMatch && colorMatch && categoryMatch ? true : false
  }

  const filteredServants = useMemo(
    () =>
      ((query: string, servants: Servant[], needFollow: boolean, options: FilterOption): Servant[] => {
        return servants.filter(servant => {
          const matchFollow = !(needFollow === true && servant.isFollow === false)
          const matchQuery = matchQueryString(servant, query)
          const matchFilterOption = matchQueryOpt(servant, options)
          return matchFollow && matchQuery && matchFilterOption
        })
      })(state.query, state.servants, state.needFollow, state.filter_options),
    [state.query, state.servants, state.needFollow, state.filter_options]
  )

  const sortFilteredServants = useMemo(
    () => {
      const classSort: ServantClass[] = ['Shielder', 'Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker', 'Ruler', 'Avenger', 'MoonCancer', 'Alterego', 'Foreigner', 'Pretender', 'Beast']
      if (filteredServants.length <= 1) return filteredServants;
      switch (state.sort_option) {
        case 'noasc':
          return filteredServants.sort((prev, cu) => {
            return prev.sNo - cu.sNo
          })
        case 'nodsc':
          return filteredServants.sort((prev, cu) => {
            return cu.sNo - prev.sNo
          })
        case 'rareasc':
          return filteredServants.sort((prev, cu) => {
            return prev.sRarity - cu.sRarity
          })
        case 'raredsc':
          return filteredServants.sort((prev, cu) => {
            return cu.sRarity - prev.sRarity
          })
        case 'classasc':
          return filteredServants.sort((prev, cu) => {
            return classSort.indexOf(prev.sClass) - classSort.indexOf(cu.sClass)
          })
        case 'classdsc':
          return filteredServants.sort((prev, cu) => {
            return classSort.indexOf(cu.sClass) - classSort.indexOf(prev.sClass)
          })
        default:
          return filteredServants
      }
    }
    , [filteredServants, state.sort_option]
  )

  function toggleFilter() {
    setfiltervisible(s => !s)
  }
  // function toggleSorter() {
  //   setsortervisible(s => !s)
  // }

  const isFilterSettled = useMemo(() => {
    return ((opt: FilterOption): boolean => {
      return opt.sClass.length !== 0 || opt.sPhantasmColor.length !== 0 || opt.sPhantasmCategory.length !== 0
    })(state.filter_options)
  }, [state.filter_options])

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
        <Search className="search" placeholder="输入名称或昵称" onChange={searchOnChange} />
        <button className="clear-button" onClick={toggleFilter}>
          {isFilterSettled ? <FilterFilled className="open" /> : <FilterOutlined className={filterVisible ? 'open' : ''} />}
        </button>
        <Popover placement="bottom" title='排序'
          // visible={sorterVisible}
          content={
            <SortOptRenderer sortState={state.sort_option} setSort={setSortopt} />
          }
          trigger="click"
        >
          <button className="clear-button">
            <SortAscendingOutlined />
          </button>
        </Popover>
        <button className="clear-button filter-like-button" onClick={changeFilterFollow}>
          {state.needFollow ? <HeartFilled className="like" /> : <HeartOutlined />}
        </button>
        <button className="clear-button" onClick={reloadFromDB}><ReloadOutlined /></button>
      </div>

      <FilterRenderer filterOpt={state.filter_options} setFilteropt={setFilteropt} visible={filterVisible} />
      {state.isLoaded ?
        <FixedSizeList
          className="servant-list-content"
          itemCount={sortFilteredServants.length}
          height={1080}
          width={374}
          itemSize={76 + 7}
        >
          {({ index, style }) => {
            return (
              <div style={style}>
                {servantItemRenderer(sortFilteredServants[index])}
              </div>
            )
          }}
        </FixedSizeList> : <p className="loading-placeholder">Loading……</p>}
    </div>
  )
}

function FilterRenderer(props: { filterOpt: FilterOption, setFilteropt: (opt: FilterOption) => any, visible: boolean }) {

  type ClassMap = { [name: string]: ServantClass | 'Other' }
  type ColorMap = { [name: string]: PhantasmColor }
  type CategoryMap = { [name: string]: PhantasmCategory }

  const classes: ClassMap[] = [{ '剑': "Saber" }, { '弓': "Archer" }, { '枪': "Lancer" },
  { '骑': "Rider" }, { '杀': "Assassin" }, { '术': "Caster" }, { '狂': "Berserker" }, { '其他': "Other" }]
  const phantasmColor: ColorMap[] = [{ 'Quick': "Quick" }, { 'Arts': 'Arts' }, { 'Buster': 'Buster' }]
  const phantasmCategory: CategoryMap[] = [{ '全体': '全体' }, { '单体': '单体' }, { '辅助': '辅助' }]

  const toggle = (type: 'c' | 'ph' | 'phc', val: string | PhantasmColor | PhantasmCategory) => {
    switch (type) {
      case 'c':
        const newC = [...props.filterOpt.sClass]
        const i = newC.indexOf(val)
        if (i === -1) {
          newC.push(val)
        }
        else {
          newC.splice(i, 1)
        }
        props.setFilteropt({ ...props.filterOpt, sClass: newC })
        break;
      case 'ph':
        const newN = [...props.filterOpt.sPhantasmColor]
        const i2 = newN.indexOf(val as PhantasmColor)
        if (i2 === -1) {
          newN.push(val as PhantasmColor)
        }
        else {
          newN.splice(i2, 1)
        }
        props.setFilteropt({ ...props.filterOpt, sPhantasmColor: newN })
        break;
      case 'phc':
        const newNc = [...props.filterOpt.sPhantasmCategory]
        const i3 = newNc.indexOf(val as PhantasmCategory)
        if (i3 === -1) {
          newNc.push(val as PhantasmCategory)
        }
        else {
          newNc.splice(i3, 1)
        }
        props.setFilteropt({ ...props.filterOpt, sPhantasmCategory: newNc })
        break;
      default:
        break;
    }
  }

  return (
    <div className={props.visible ? "servant-list-filter-container open" : "servant-list-filter-container"}>
      <div className="servant-list-filter">
        <section>
          <div>职阶</div>
          <div>
            {classes.map((c) => {
              const showName = Object.keys(c)[0];
              const dataName = Object.values(c)[0]
              return (
                <span key={dataName}>
                  <input type="checkbox"
                    id={showName}
                    checked={props.filterOpt.sClass.includes(dataName)}
                    onChange={() => { toggle('c', dataName) }} />
                  <label htmlFor={showName}><span>{showName}</span></label>
                </span>
              )
            })}</div>
        </section>
        <section>
          <div>宝具颜色</div>
          <div>
            {phantasmColor.map((ph) => {
              const showName = Object.keys(ph)[0];
              const dataName = Object.values(ph)[0]
              return (
                <span key={dataName}>
                  <input type="checkbox"
                    id={showName}
                    checked={props.filterOpt.sPhantasmColor.includes(dataName)}
                    onChange={() => { toggle('ph', dataName) }} />
                  <label htmlFor={showName}><span>{showName}</span></label>
                </span>
              )
            })}
          </div>
        </section>
        <section>
          <div>宝具类型</div>
          <div>
            {phantasmCategory.map((phc) => {
              const showName = Object.keys(phc)[0];
              const dataName = Object.values(phc)[0]
              return (
                <span key={dataName}>
                  <input type="checkbox"
                    id={showName}
                    checked={props.filterOpt.sPhantasmCategory.includes(dataName)}
                    onChange={() => { toggle('phc', dataName) }} />
                  <label htmlFor={showName}><span>{showName}</span></label>
                </span>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}


function SortOptRenderer(props: { sortState: SortOption, setSort: (opt: SortOption) => any, close?: () => any }) {
  return (
    <div className='popover-opts'>
      {sortOptions.map(k => {
        // { 'rareasc', 'raredsc', 'noasc', 'nodsc', 'classasc', 'classdsc' }
        return (
          <li key={k}
            className={props.sortState === k ? 'current' : ''}
            onClick={() => { props.setSort(k); props.close?.() }}>
            {(() => {
              switch (k) {
                case 'rareasc':
                  return '稀有度升序 ↑'
                case 'raredsc':
                  return '稀有度降序 ↓'
                case 'noasc':
                  return '序号升序 ↑'
                case 'nodsc':
                  return '序号降序 ↓'
                case 'classasc':
                  return '职阶升序 ↑'
                case 'classdsc':
                  return '职阶降序 ↓'
                default:
                  return null
              }
            })()
            }
          </li>)

      })}
    </div>
  )
}