import React, { useState, useEffect } from 'react'
import { Select } from "antd";
import { HeartFilled, HeartOutlined, LinkOutlined } from "@ant-design/icons";
import { getServantDetail, putSetting, ServantSetting, ServantBasic } from '../../data/db'
import SkillSelection from './SkillSelection';
import { DOMAIN, ICONBASE } from '../../data/utils';
import ArrowUp from '../../assets/icons/arrow-up.svg'
const { Option } = Select;

export type ServantDetail = {
  basicInfo: ServantBasic,
  userSettings: ServantSetting
}

const initDetail: ServantDetail = { basicInfo: { sId: 100100, sNo: 0, sName: "Name", sNameJp: "NameJP", sClass: "Saber", sImg: "Here", mcLink: "", skills: [{ name: "", icon: "" }, { name: "", icon: "" }, { name: "", icon: "" }], appendskill: [{ name: "", icon: "" }, { name: "", icon: "" }, { name: "", icon: "" }] }, userSettings: { isFollow: false, level: 0, levelTarget: 0, skill1: 1, skill2: 1, skill3: 1, skill1Target: 1, skill2Target: 1, skill3Target: 1, extraSkill1: 1, extraSkill2: 1, extraSkill3: 1, extraSkill1Target: 1, extraSkill2Target: 1, extraSkill3Target: 1 } }

export default function ServantCard(props: any) {
  const { id } = props.match.params
  const [state, setstate] = useState(initDetail)

  // ComponentDidMount
  useEffect(() => {
    getServantDetail(id).then((detail) => {
      setstate(detail);
    }).then(() => {
      console.log("[ServantCard] servant detail load successfully")
    }).catch((e: Error) => {
      setstate(initDetail)
      console.log("[ServantCard] Error when load servant detail: ", e)
    })
  }, [id])

  function handleput() {
    putSetting(
      100100,
      {
        isFollow: true,
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
    console.log("[ServantCard] ", detail)
  }

  return (
    <div className="servant-card-container">
      {id}
      <button onClick={handleClick}>测试get数据库功能</button>
      <button onClick={handleput}>测试put数据库功能</button>
      <div className="servant-card">
        <section className="servant-card-head list-item-indentation">
          <div className="servant-card-img-container">
            <img src={DOMAIN + ICONBASE + "/" + state.basicInfo.sImg} alt="avatar" />
          </div>
          <div className="servant-item-info">
            <p className="servant-item-info-name">{state.basicInfo.sName}</p>
            <p className="servant-item-info-namejp">{state.basicInfo.sNameJp}</p>
            <p className="servant-item-info-other">No.{state.basicInfo.sNo} {state.basicInfo.sClass}</p>
          </div>
          <div className="servant-item-like">
            {state.userSettings.isFollow ? <HeartFilled className="like" /> : <HeartOutlined />}
          </div>
          <div className="servant-item-like">
            <a href={"https://fgo.wiki/w/" + state.basicInfo.mcLink} target="_blank" rel="noreferrer"><LinkOutlined /></a>
          </div>
        </section>

        <section className="servant-card-setting-list">
          <p className="list-item-indentation list-title">等级提升</p>
          <div className="servant-card-setting-list-item list-item-indentation">
            <img src={ArrowUp} alt="再临" className="servant-card-icon" />
            <span className="servant-card-setting-list-item-name">灵基再临</span>
            <Select defaultValue="0">
              <Option value="0">0</Option>
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
            </Select>
            <span>→</span>
            <Select defaultValue="0">
              <Option value="0">0</Option>
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
            </Select>
          </div>
          <div className="servant-card-setting-list-item list-item-indentation">
            <img src={DOMAIN + ICONBASE + "/圣杯.jpg"} alt="🏆" className="servant-card-icon" />
            <span className="servant-card-setting-list-item-name">圣杯转临</span>
            <Select defaultValue="80">
              <Option value="80">80</Option>
              <Option value="85">85</Option>
              <Option value="90">90</Option>
              <Option value="92">92</Option>
              <Option value="94">94</Option>
              <Option value="96">96</Option>
            </Select>
            <span>→</span>
            <Select defaultValue="80">
              <Option value="80">80</Option>
              <Option value="85">85</Option>
              <Option value="90">90</Option>
              <Option value="92">92</Option>
              <Option value="94">94</Option>
              <Option value="96">96</Option>
            </Select>
          </div>
        </section>


        <section className="servant-card-setting-list">
          <p className="list-item-indentation list-title">技能强化</p>
          {state.basicInfo.skills.map((skill, index) => {
            return (
              <div className="servant-card-setting-list-item list-item-indentation" key={index}>
                <img src={DOMAIN + ICONBASE + "/" + skill.icon} alt="skill1" className="servant-card-icon" />
                <span className="servant-card-setting-list-item-name">{skill.name}</span>
                <SkillSelection />
              </div>
            )
          })}
        </section>

        <section className="servant-card-setting-list">
          <p className="list-item-indentation list-title">附加技能</p>
          {state.basicInfo.appendskill.map((skill, index) => {
            return (
              <div className="servant-card-setting-list-item list-item-indentation" key={index}>
                <img src={DOMAIN + ICONBASE + "/" + skill.icon} alt="skill1" className="servant-card-icon" />
                <span className="servant-card-setting-list-item-name">{skill.name}</span>
                <SkillSelection />
              </div>
            )
          })}
        </section>

      </div>
    </div>
  )
}
