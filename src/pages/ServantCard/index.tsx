import { ControlOutlined, HeartFilled, HeartOutlined, LinkOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

import ArrowUp from '../../assets/icons/arrow-up.svg';
import SkillDrawer from '../../components/SkillDrawer';
import { ascensionGenerator, composeCalcCells } from '../../utils/calculator';
import { ICONBASE } from '../../utils/dataset-conf';
import { ItemCostFormat, SkillDetailFormat } from '../../utils/dataset-type';
import { getServantDetail, putSetting } from '../../utils/db';
import { ServantSetting, UserSettingType } from '../../utils/db-type';
import Emitter, { EvtArgTypes, EvtNames, EvtSources, ServantState } from '../../utils/events';
import Selections from './Selections';

export type ServantBasic = {
  sId: number,
  sNo: number,
  sName: string,
  sNameJp: string,
  sClass: string,
  sImg: string,
  sRarity: number,
  sObtain: string,
  mcLink: string
  activeSkills: {
    "cnState": number,
    "skills": SkillDetailFormat[], // 强化前后
  }[];
  appendedSkills: SkillDetailFormat[];
  itemCost: ItemCostFormat
}

export type ServantDetail = {
  basicInfo: ServantBasic,
  userSettings: ServantSetting
}

const initDetail: ServantDetail = {
  basicInfo: {
    sId: 100100,
    sNo: 0,
    sName: "Name",
    sNameJp: "NameJP",
    sClass: "Saber",
    sImg: "Here",
    sRarity: 3,
    sObtain: "",
    mcLink: "",
    activeSkills: [],
    appendedSkills: [],
    itemCost: {
      ascension: [],
      skill: [],
      appendSkill: []
    }
  },
  userSettings: {
    isFollow: false,
    ascension: { current: 0, target: 0 },
    finalLevel: { current: 0, target: 0 },
    skills: [
      { current: 1, target: 1 }, //1-10
      { current: 1, target: 1 },
      { current: 1, target: 1 },
    ],
    appendSkills: [
      { current: 1, target: 1 },
      { current: 1, target: 1 },
      { current: 1, target: 1 },
    ]
  },
}

type DrawerCate = 'skill' | 'appendskill' | 'ascension' | 'finalLevel' | ''
const initDrawercate: DrawerCate = ''

export default function ServantCard(props: any) {
  const { id } = props.match.params
  const [state, setstate] = useState(initDetail)

  const [drawer, setdrawer] = useState({
    visible: false,
    targetSkill: '',
    cate: initDrawercate
  })

  const closeDrawer = () => {
    setdrawer(s => { return { ...s, visible: false } })
  }

  const showDrawer = (skillName: string, cate: DrawerCate) => {
    setdrawer(s => { return { ...s, targetSkill: skillName, visible: true, cate } })
  }

  // ComponentDidMount or when id changed
  useEffect(() => {
    getServantDetail(id).then((detail) => {
      setstate(detail);
    }).then(() => {
      console.log("[ServantCard] servant detail load successfully")
    }).catch((e: Error) => {
      setstate(initDetail)
      console.error("[ServantCard] Error when load servant detail: ", e)
      // TODO 全局错误尝试重建计算器与数据库
    })
  }, [id])

  // Subscribe event
  useEffect(() => {
    // event handler
    function updateFollow(src: EvtSources, newState: EvtArgTypes) {
      if (src === EvtSources.ServatContent) {
        return // ignore events sent by self
      }
      const st = newState as ServantState;
      if (st.id !== state.basicInfo.sId) { return }
      setstate(s => { return { ...s, userSettings: { ...s.userSettings, isFollow: st.isFollow !== undefined ? st.isFollow : state.userSettings.isFollow } } })
    }
    Emitter.addDataListener(EvtNames.ModifyServant, updateFollow)
    return () => {
      Emitter.removeListener(EvtNames.ModifyServant, updateFollow)
    }
  }, [state.userSettings.isFollow, state.basicInfo.sId])

  function changeFollow() {
    const userSettings: ServantSetting = { ...state.userSettings, isFollow: !state.userSettings.isFollow };
    // save to database
    putSetting(state.basicInfo.sId, state.basicInfo.sName, UserSettingType.Servant, userSettings).then(() => {
      setstate({ ...state, userSettings })
      // notify sidebar
      Emitter.dataEmit(EvtNames.ModifyServant, EvtSources.ServatContent, {
        id: state.basicInfo.sId,
        isFollow: !state.userSettings.isFollow,
      })
    })
  }

  function changeLevel(current: number, target: number) {
    const userSettings: ServantSetting = { ...state.userSettings, ascension: { current, target } };
    putSetting(state.basicInfo.sId, state.basicInfo.sName, UserSettingType.Servant, userSettings, composeCalcCells({ ...state, userSettings })).then(() => {
      setstate({ ...state, userSettings })
    })

  }

  function changeFinalLevel(current: number, target: number) {
    const userSettings: ServantSetting = { ...state.userSettings, finalLevel: { current, target } };
    putSetting(state.basicInfo.sId, state.basicInfo.sName, UserSettingType.Servant, userSettings, composeCalcCells({ ...state, userSettings })).then(() => {
      setstate({ ...state, userSettings })
    })
  }

  function changeSkill(skill_index: number) { // 写成高阶函数以保存 index 变量
    if (skill_index > 2) {
      console.error(`[ServantCard] skill_index ${skill_index} out of range`)
    }
    const i = skill_index
    return (current: number, target: number) => {
      const new_skills = [...state.userSettings.skills];
      new_skills[i] = { current, target };
      const userSettings: ServantSetting = { ...state.userSettings, skills: new_skills };
      putSetting(state.basicInfo.sId, state.basicInfo.sName, UserSettingType.Servant, userSettings, composeCalcCells({ ...state, userSettings })).then(() => {
        setstate({ ...state, userSettings })
        Emitter.dataEmit(EvtNames.ModifyServant, EvtSources.ServatContent, {
          id: state.basicInfo.sId,
          skills: new_skills.map((skill) => {
            return skill.current
          })
        })
      })
    }
  }

  function changeAppendSkill(skill_index: number) {
    if (skill_index > 2) {
      console.error(`[ServantCard] appended skill_index ${skill_index} out of range`)
    }
    const i = skill_index
    return (current: number, target: number) => {
      const new_appendedskills = [...state.userSettings.appendSkills];
      new_appendedskills[i] = { current, target };
      const userSettings: ServantSetting = { ...state.userSettings, appendSkills: new_appendedskills };
      putSetting(state.basicInfo.sId, state.basicInfo.sName, UserSettingType.Servant, userSettings, composeCalcCells({ ...state, userSettings })).then(() => {
        setstate({ ...state, userSettings })
      })
    }
  }

  const composeItemCost = useCallback(
    (): {
      currentLevel: number,
      targetLevel: number,
      items: { [itemName: string]: number }
    }[] => {
      switch (drawer.cate) {
        case 'appendskill':
          const ic = state.basicInfo.itemCost.appendSkill.map((lv, i) => {
            return { currentLevel: i + 1, targetLevel: i + 2, items: lv }
          })
          ic.unshift({
            currentLevel: 0,
            targetLevel: 1,
            items: { "从者硬币": 120 }
          })
          return ic
        case 'skill':
          return state.basicInfo.itemCost.skill.map((lv, i) => {
            return { currentLevel: i + 1, targetLevel: i + 2, items: lv }
          })
        case 'ascension':
          return state.basicInfo.itemCost.ascension.map((lv, i) => {
            return { currentLevel: i, targetLevel: i + 1, items: lv }
          })
        case 'finalLevel':
        default:
          const { levelStage, qpCost } = ascensionGenerator(state.basicInfo.sRarity)
          return qpCost.map((qp, i) => {
            return {
              currentLevel: levelStage[i], targetLevel: levelStage[i + 1],
              items: {
                "圣杯": 1,
                'QP': qp
              }
            }
          })
      }
    },
    [drawer.cate, state.basicInfo.itemCost.appendSkill, state.basicInfo.itemCost.ascension, state.basicInfo.itemCost.skill, state.basicInfo.sRarity],
  )

  function QuickSkillSetRenderer(props: { setFunc: (num: 310 | 999 | 666 | 444) => any }) {
    return (
      <div className="popover-opts" >
        <li onClick={() => props.setFunc(310)}>310</li>
        <li onClick={() => props.setFunc(999)}>999</li>
        <li onClick={() => props.setFunc(666)}>666</li>
        <li onClick={() => props.setFunc(444)}>444</li>
      </div>
    )
  }

  function quickSetSkill(setnum: 310 | 999 | 666 | 444, field: 'current' | 'target', setType: 'skills' | 'appendSkills') {
    const selectFunc = setType === 'skills' ? changeSkill : changeAppendSkill
    const params = (skill_index: number) => {
      if (field === 'current') {
        return {
          310: { current: state.userSettings[setType][skill_index][field], target: 10 },
          999: { current: state.userSettings[setType][skill_index][field], target: 9 },
          666: { current: state.userSettings[setType][skill_index][field], target: 6 },
          444: { current: state.userSettings[setType][skill_index][field], target: 4 }
        }
      } else {
        return {
          310: { current: 10, target: state.userSettings[setType][skill_index][field] },
          999: { current: 9, target: state.userSettings[setType][skill_index][field] },
          666: { current: 6, target: state.userSettings[setType][skill_index][field] },
          444: { current: 4, target: state.userSettings[setType][skill_index][field] }
        }
      }
    }
    console.debug(setnum, field, setType)
    console.debug('params',params)
    for (let i = 0; i < 3; i++) {
      selectFunc(i)(params(i)[setnum].current, params(i)[setnum].target)
    }
  }


  return (
    <div className="servant-card-container">
      <div className={drawer.visible ? "servant-card masked" : "servant-card"}>
        <section className="servant-card-head list-item-indentation">
          <div className="servant-card-img-container">
            <img src={ICONBASE + "/" + state.basicInfo.sImg} alt="avatar" />
          </div>
          <div className="servant-item-info">
            <p className="servant-item-info-name">{state.basicInfo.sName}</p>
            <p className="servant-item-info-namejp">{state.basicInfo.sNameJp}</p>
            <p className="servant-item-info-other">No.{state.basicInfo.sNo} {state.basicInfo.sClass}</p>
          </div>
          <div className="servant-card-like" onClick={changeFollow}>
            {state.userSettings.isFollow ? <HeartFilled className="like" /> : <HeartOutlined />}
          </div>
          <div className="servant-card-like">
            <a href={"https://fgo.wiki/w/" + state.basicInfo.mcLink} target="_blank" rel="noreferrer"><LinkOutlined /></a>
          </div>
        </section>
        {
          state.basicInfo.sObtain === "无法召唤" || state.basicInfo.sObtain === "无法获得" ? ''
            :
            (<React.Fragment>
              <section className="servant-card-setting-list">
                <p className="list-item-indentation list-title">
                  等级提升</p>
                <div className="servant-card-setting-list-item list-item-indentation"
                  onClick={() => { showDrawer('', 'ascension') }}>
                  <img src={ArrowUp} alt="再临" className="servant-card-icon" />
                  <span className="servant-card-setting-list-item-name">灵基再临</span>
                  <Selections mode="level" {...state.userSettings.ascension} changeSelection={changeLevel} />
                </div>
                <div className="servant-card-setting-list-item list-item-indentation"
                  onClick={() => { showDrawer('', 'finalLevel') }}>
                  <img src={ICONBASE + "/圣杯.jpg"} alt="🏆" className="servant-card-icon" />
                  <span className="servant-card-setting-list-item-name">圣杯转临</span>
                  <Selections mode="finalLevel" {...state.userSettings.finalLevel} rarity={state.basicInfo.sRarity} changeSelection={changeFinalLevel} />
                </div>
              </section>
              <section className="servant-card-setting-list">
                <p className="list-item-indentation list-title">技能强化
                  <Popover
                    placement="bottom"
                    title='快速设定'
                    content={<QuickSkillSetRenderer
                      setFunc={(num: 310 | 999 | 666 | 444) => {
                        quickSetSkill(num, 'current', 'skills')
                      }}
                    />}
                  >
                    <ControlOutlined />
                  </Popover>
                  <Popover
                    placement="bottom"
                    title='快速设定'
                    content={<QuickSkillSetRenderer
                      setFunc={(num: 310 | 999 | 666 | 444) => {
                        quickSetSkill(num, 'target', 'skills')
                      }}
                    />}
                  >
                    <ControlOutlined />
                  </Popover>
                </p>
                {state.basicInfo.activeSkills.map((as, index) => {
                  const skill = as.skills[as.skills.length - 1]
                  return (
                    <div className="servant-card-setting-list-item list-item-indentation" key={index}
                      onClick={() => { showDrawer(skill.name, 'skill') }}
                    >
                      <img src={ICONBASE + "/" + skill.icon} alt="skill1" className="servant-card-icon" />
                      <span className="servant-card-setting-list-item-name">{skill.name}</span>
                      <Selections mode="skill" {...state.userSettings.skills[index]} changeSelection={changeSkill(index)} />
                    </div>
                  )
                })}
              </section>

              <section className="servant-card-setting-list">
                <p className="list-item-indentation list-title">附加技能
                  <Popover
                    placement="bottom"
                    title='快速设定'
                    content={<QuickSkillSetRenderer
                      setFunc={(num: 310 | 999 | 666 | 444) => {
                        quickSetSkill(num, 'current', 'appendSkills')
                      }}
                    />}
                  >
                    <ControlOutlined />
                  </Popover>
                  <Popover
                    placement="bottom"
                    title='快速设定'
                    content={<QuickSkillSetRenderer
                      setFunc={(num: 310 | 999 | 666 | 444) => {
                        quickSetSkill(num, 'target', 'appendSkills')
                      }}
                    />}
                  >
                    <ControlOutlined />
                  </Popover>
                </p>
                {state.basicInfo.appendedSkills.map((skill, index) => {
                  return (
                    <div className="servant-card-setting-list-item list-item-indentation" key={index}
                      onClick={() => { showDrawer(skill.name, 'appendskill') }}
                    >
                      <img src={ICONBASE + "/" + skill.icon + '.png'} alt="skill1" className="servant-card-icon" />
                      <span className="servant-card-setting-list-item-name">{skill.name}</span>
                      <Selections mode="skill" {...state.userSettings.appendSkills[index]} changeSelection={changeAppendSkill(index)} />
                    </div>
                  )
                })}
              </section>

            </React.Fragment>)
        }
      </div>
      <SkillDrawer
        skills={
          drawer.cate === 'appendskill' ? state.basicInfo.appendedSkills.map(sk => {
            return [{ ...sk, icon: sk.icon + '.png' }]
          }) : drawer.cate === 'skill' ? state.basicInfo.activeSkills.map(
            as => as.skills
          ) : null
        }
        targetSkillName={drawer.targetSkill}
        onClose={closeDrawer}
        itemCost={composeItemCost()}
        visible={drawer.visible} />
    </div>
  )
}
