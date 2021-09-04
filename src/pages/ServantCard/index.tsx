import React, { useState, useEffect } from 'react'
import { HeartFilled, HeartOutlined, LinkOutlined } from "@ant-design/icons";
import { getServantDetail, putSetting } from '../../utils/db'
import { UserSettingType, ServantSetting } from '../../utils/db-type'
import Selections from './Selections';
import { ICONBASE, ItemCostFormat, SkillDetailFormat } from '../../utils/dataset-conf';
import ArrowUp from '../../assets/icons/arrow-up.svg';
import Emitter, { EvtSources, EvtNames, EvtArgTypes, ServantState } from '../../utils/events';
import { composeCalcCells } from '../../utils/calculator';

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
  skills: SkillDetailFormat[];
  appendedskill: SkillDetailFormat[];
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
    skills: [],
    appendedskill: [],
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
    appendedSkills: [
      { current: 1, target: 1 },
      { current: 1, target: 1 },
      { current: 1, target: 1 },
    ]
  },
}

export default function ServantCard(props: any) {
  const { id } = props.match.params
  const [state, setstate] = useState(initDetail)

  // ComponentDidMount or when id changed
  useEffect(() => {
    getServantDetail(id).then((detail) => {
      setstate(detail);
    }).then(() => {
      console.log("[ServantCard] servant detail load successfully")
    }).catch((e: Error) => {
      setstate(initDetail)
      console.error("[ServantCard] Error when load servant detail: ", e)
    })
  }, [id])

  // Subscribe event
  useEffect(() => {
    function updateFollow(src: EvtSources, newState: EvtArgTypes) {
      if (src === EvtSources.ServatContent) {
        return // ignore events sent by self
      }
      const st = newState as ServantState;
      if (st.id !== state.basicInfo.sId) { return }
      setstate({ ...state, userSettings: { ...state.userSettings, isFollow: st.isFollow !== undefined ? st.isFollow : state.userSettings.isFollow } })
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

  // TODO
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

  function changeAppendedSkill(skill_index: number) {
    if (skill_index > 2) {
      console.error(`[ServantCard] appended skill_index ${skill_index} out of range`)
    }
    const i = skill_index
    return (current: number, target: number) => {
      const new_appendedskills = [...state.userSettings.appendedSkills];
      new_appendedskills[i] = { current, target };
      const userSettings: ServantSetting = { ...state.userSettings, appendedSkills: new_appendedskills };
      putSetting(state.basicInfo.sId, state.basicInfo.sName, UserSettingType.Servant, userSettings, composeCalcCells({ ...state, userSettings })).then(() => {
        setstate({ ...state, userSettings })
      })
    }
  }

  return (
    <div className="servant-card-container">
      <div className="servant-card">
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
          state.basicInfo.sObtain === "无法召唤" || state.basicInfo.sObtain === "无法获得" ? '' : (<React.Fragment>

            <section className="servant-card-setting-list">
              <p className="list-item-indentation list-title">等级提升</p>
              <div className="servant-card-setting-list-item list-item-indentation">
                <img src={ArrowUp} alt="再临" className="servant-card-icon" />
                <span className="servant-card-setting-list-item-name">灵基再临</span>
                <Selections mode="level" {...state.userSettings.ascension} changeSelection={changeLevel} />
              </div>
              <div className="servant-card-setting-list-item list-item-indentation">
                <img src={ICONBASE + "/圣杯.jpg"} alt="🏆" className="servant-card-icon" />
                <span className="servant-card-setting-list-item-name">圣杯转临</span>
                <Selections mode="finalLevel" {...state.userSettings.finalLevel} rarity={state.basicInfo.sRarity} changeSelection={changeFinalLevel} />
              </div>
            </section>


            <section className="servant-card-setting-list">
              <p className="list-item-indentation list-title">技能强化</p>
              {state.basicInfo.skills.map((skill, index) => {
                return (
                  <div className="servant-card-setting-list-item list-item-indentation" key={index}>
                    <img src={ICONBASE + "/" + skill.icon} alt="skill1" className="servant-card-icon" />
                    <span className="servant-card-setting-list-item-name">{skill.name}</span>
                    <Selections mode="skill" {...state.userSettings.skills[index]} changeSelection={changeSkill(index)} />
                  </div>
                )
              })}
            </section>

            <section className="servant-card-setting-list">
              <p className="list-item-indentation list-title">附加技能</p>
              {state.basicInfo.appendedskill.map((skill, index) => {
                return (
                  <div className="servant-card-setting-list-item list-item-indentation" key={index}>
                    <img src={ICONBASE + "/" + skill.icon + '.png'} alt="skill1" className="servant-card-icon" />
                    <span className="servant-card-setting-list-item-name">{skill.name}</span>
                    <Selections mode="skill" {...state.userSettings.appendedSkills[index]} changeSelection={changeAppendedSkill(index)} />
                  </div>
                )
              })}
            </section>

          </React.Fragment>)
        }
      </div>
    </div>
  )
}
