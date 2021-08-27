import React, { useState, useEffect } from 'react'
import { Select } from "antd";
const { Option } = Select;

enum Node {
  current,
  target
}

export default function Selections(props: { mode: "skill" | "level" | "finalLevel", current: number, target: number, rarity?: number, changeSelection: (current: number, target: number) => void }) {
  const [state, setstate] = useState({ current: props.current, target: props.target })

  // Component will receive props
  useEffect(() => {
    setstate({ current: props.current, target: props.target })
  }, [props])

  function handleSelectionChange(param: Node) {
    if (param === Node.current) {
      return (val: string) => {
        const v = parseInt(val)
        const target = v > state.target ? v : state.target;
        setstate({ current: v, target })
        props.changeSelection(v, target)
      }
    }
    return (val: string) => {
      const v = parseInt(val)
      const current = state.current > v ? v : state.current;
      setstate({ current, target: v })
      props.changeSelection(current, v)
    }
  }

  let numbers = []

  switch (props.mode) {
    case "skill":
      numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      return (
        <div>
          <Select className="skill-select" value={state.current.toString()} onChange={handleSelectionChange(Node.current)}>
            {numbers.map((i) => {
              return <Option key={i} value={i}>{i}</Option>
            })}
          </Select>
          <span className="text-gray">→</span>
          <Select className="skill-select" value={state.target.toString()} onChange={handleSelectionChange(Node.target)}>
            {numbers.map((i) => {
              return <Option key={i} value={i}>{i}</Option>
            })}
          </Select>
        </div>
      )
    case "level":
      numbers = [0, 1, 2, 3, 4];
      return (
        <div>
          <Select className="skill-select" value={state.current.toString()} onChange={handleSelectionChange(Node.current)}>
            {numbers.map((i) => {
              return <Option value={i}>{i}</Option>
            })}
          </Select>
          <span className="text-gray">→</span>
          <Select className="skill-select" value={state.target.toString()} onChange={handleSelectionChange(Node.target)}>
            {numbers.map((i) => {
              return <Option value={i}>{i}</Option>
            })}
          </Select>
        </div>
      )
    case "finalLevel":
      const rare = props.rarity ? props.rarity : 3;
      switch (rare) {
        case 1:
          numbers = [60, 70, 75, 80, 85, 90, 92, 94, 96, 98, 100]
          break;
        case 2:
          numbers = [65, 70, 75, 80, 85, 90, 92, 94, 96, 98, 100]
          break;
        case 3:
          numbers = [70, 75, 80, 85, 90, 92, 94, 96, 98, 100]
          break;
        case 4:
          numbers = [80, 85, 90, 92, 94, 96, 98, 100]
          break;
        case 5:
          numbers = [90, 92, 94, 96, 98, 100]
          break;
        default:
          numbers = [60, 70, 80, 90, 100]
          break;
      }
      if (state.current < numbers[0]) {
        setstate({ ...state, current: numbers[0] })
      }
      if (state.target < numbers[0]) {
        setstate({ ...state, target: numbers[0] })
      }
      return (
        <div>
          <Select className="skill-select" value={state.current.toString()} onChange={handleSelectionChange(Node.current)}>
            {numbers.map((i) => {
              return <Option value={i}>{i}</Option>
            })}
          </Select>
          <span className="text-gray">→</span>
          <Select className="skill-select" value={state.target.toString()} onChange={handleSelectionChange(Node.target)}>
            {numbers.map((i) => {
              return <Option value={i}>{i}</Option>
            })}
          </Select>
        </div>
      )
    default:
      return (
        <p>Oops something went wrong</p>
      )
  }
}
