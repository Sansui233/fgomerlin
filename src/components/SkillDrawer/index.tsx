import React, { useEffect, useRef, useState } from 'react'
import { ICONBASE, SkillDetailFormat } from '../../utils/dataset-conf';
import './index.css'

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
  const mask = useRef(null)
  const hideself = onClose

  useEffect(() => {
    setVisibility(visible)
    let e = document.getElementById(targetSkillName)
    if(e?.offsetTop === undefined){ // FireFox
      e?.scrollIntoView(true)
    }else{
      e.parentElement?.scroll(0,e.offsetTop - 46)
    }
  }, [visible, targetSkillName])

  return (
    <aside className={visibility ? "svt-drawer open" : "svt-drawer"}>
      <div ref={mask} onClick={hideself} className="drawer-mask" />
      <div className="drawer-content">
        {skills?.map((skillStates, i) => {
          if (skillStates.length === 1) {
            return <SkillRenderer id={skillStates[0].name} key={skillStates[0].name} skill={skillStates[0]} />
          } else {
            return <TabRenderer id={skillStates[skillStates.length - 1].name} key={skillStates[0].name} skillStates={skillStates} />
          }
        })}
        <ItemRenderer itemCost={itemCost}/>
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
    <section className="itemcost">
      {props.itemCost.map((lv) => (
        <li key={lv.currentLevel}>
          <div>Lv.{lv.currentLevel}&nbsp;→&nbsp;{lv.targetLevel}</div> 
          <div>{Object.entries(lv.items)}</div>
        </li>
      ))}
    </section>
  )
}
