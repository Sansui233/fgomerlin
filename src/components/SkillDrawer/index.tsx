import './index.css';

import React, { useEffect, useRef, useState } from 'react';

import { ICONBASE } from '../../utils/dataset-conf';
import { SkillDetailFormat } from '../../utils/dataset-type';
import AvatarWithNumber from '../AvatarWithNumber';

type Props = {
  /**
   * First dimension is the index of skill,and the second is the state of skill
   * If null, its ascension or someting 
   */
  skills: SkillDetailFormat[][] | null,
  /**
   * This should be the latest name instead of the previous names
   */
  targetSkillName: string,
  onClose: () => any,
  itemCost: {
    currentLevel: number,
    targetLevel: number,
    items: { [itemName: string]: number }
  }[],
  visible: boolean
};


export default function SkillDrawer({ skills, targetSkillName, onClose, itemCost, visible }: Props) {
  const [visibility, setVisibility] = useState(false)
  const [navstatus, setnavstatus] = useState(0) // 0 for skill and 1 for material
  const mask = useRef(null)
  const hideself = onClose

  useEffect(() => {
    setVisibility(visible)
    window.location.hash = targetSkillName
    setnavstatus(0)
  }, [visible, targetSkillName])

  const handleNav = (status: number) => {
    if (status === 0) {
      document.getElementById('nav-skill')?.scrollIntoView(true)
    } else if (status === 1) {
      document.getElementById('nav-itemcost')?.scrollIntoView(true)
    }
    setnavstatus(status)
  }

  return (
    <aside className={visibility ? "svt-drawer open" : "svt-drawer"}>
      <div ref={mask} onClick={hideself} className="drawer-mask" />
      <div className="drawer-content">
        {skills ? <h2 id="nav-skill">技能</h2> : null}
        {skills?.map((skillStates, i) => {
          if (skillStates.length === 1) {
            return <SkillRenderer id={skillStates[0].name} key={skillStates[0].name} skill={skillStates[0]} />
          } else {
            return <TabRenderer id={skillStates[skillStates.length - 1].name} key={skillStates[0].name} skillStates={skillStates} />
          }
        })}
        <ItemRenderer itemCost={itemCost} />
        {skills ?
          <nav>
            <li className={navstatus === 0 ? 'current' : ''} onClick={() => { handleNav(0) }}>
              技能
            </li>
            <li className={navstatus === 1 ? 'current' : ''} onClick={() => { handleNav(1) }}>材料</li>
          </nav>
          : null
        }
      </div>
    </aside>
  )
}

const inittabs: string[] = []

function TabRenderer(props: { skillStates: SkillDetailFormat[], id: string }) {
  const [tabs, settabs] = useState(inittabs)
  const [currentTab, setcurrent] = useState(0)

  useEffect(() => {
    settabs(props.skillStates.map(s => {
      return s.state
    }))
    setcurrent(props.skillStates.length - 1)
  }, [props.skillStates])

  function changeCurrent(i: number) {
    setcurrent(i)
  }
  return (
    <React.Fragment>
      <div className="tab-container" id={props.id}>
        {tabs.map((t, i) => (
          <div key={`tab${i}`} className={currentTab === i ? "current" : ""} onClick={() => { changeCurrent(i) }}>{t}</div>
        ))}
      </div>
      <SkillRenderer skill={props.skillStates[currentTab]} />
    </React.Fragment>
  )
}

function SkillRenderer(props: { skill: SkillDetailFormat, id?: string }) {
  return (
    <section className="skill-container" id={props.id ? props.id : ''}>
      <div className="skill-title">
        <img src={`${ICONBASE}/${props.skill.icon}`} alt={''} className="small" />
        <span>{props.skill.name}</span>
        {props.skill.cd < 0 ? null :
          <span className="cold">CD: {props.skill.cd}&nbsp;→&nbsp;{props.skill.cd - 2}</span>
        }
      </div>
      {props.skill.effects.map((eff, i) => (
        <React.Fragment key={`eff${i}`}>
          <div className="skill-description">{eff.description}</div>
          <div className="skill-lvdata">
            {eff.lvData.map(lv => (
              <span key={lv}>{lv}</span>
            ))}
          </div>
        </React.Fragment>
      ))}
    </section>
  )
}

function ItemRenderer(props: {
  itemCost: {
    currentLevel: number,
    targetLevel: number,
    items: { [itemName: string]: number }
  }[]
}) {
  return (
    <section className="itemcost" id="nav-itemcost">
      <h2>材料</h2>
      {props.itemCost.length === 0 ? <span style={{paddingLeft:'20px'}}>无需材料</span>
      :props.itemCost.map((lv) => (
        <li key={'lv'+lv.currentLevel}>
          <div>Lv.{lv.currentLevel}&nbsp;→&nbsp;{lv.targetLevel}</div>
          <div>{Object.entries(lv.items).map(([name, num], i) => {
            return <AvatarWithNumber key={name} id={name} name={name} iconWithSuffix={`${name}.jpg`} num={num} />
          })}</div>
        </li>
      ))}
    </section>
  )
}
