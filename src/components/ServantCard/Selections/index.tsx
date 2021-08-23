import React,{useState, useEffect} from 'react'
import { Select } from "antd";
const { Option } = Select;

enum Node {
  current,
  target
}

export default function Selections(props: {current: number,target: number}) {
  const [state, setstate] = useState({...props})

  // Component will receive props
  useEffect(() => {
    setstate({...props})
  }, [props])

  function handleChange(param: Node) {
    if (param === Node.current) {
      return (val:string) => {
        const v = parseInt(val)
        const target = v > state.target?v:state.target;
        setstate({current: v, target})
      }
    }
    return (val:string) => {
      const v = parseInt(val)
      const current = state.current > v?v:state.current;
      setstate({current, target: v})
   }
  }

  return (
    <React.Fragment>
      <Select className="skill-select" value={state.current.toString()} onChange={handleChange(Node.current)}>
        <Option value="1">1</Option>
        <Option value="2">2</Option>
        <Option value="3">3</Option>
        <Option value="4">4</Option>
        <Option value="5">5</Option>
        <Option value="6">6</Option>
        <Option value="7">7</Option>
        <Option value="8">8</Option>
        <Option value="9">9</Option>
        <Option value="10">10</Option>
      </Select>
      <span className="text-gray">→</span>
      <Select className="skill-select" value={state.target.toString()} onChange={handleChange(Node.target)}>
        <Option value="1">1</Option>
        <Option value="2">2</Option>
        <Option value="3">3</Option>
        <Option value="4">4</Option>
        <Option value="5">5</Option>
        <Option value="6">6</Option>
        <Option value="7">7</Option>
        <Option value="8">8</Option>
        <Option value="9">9</Option>
        <Option value="10">10</Option>
      </Select>
    </React.Fragment>
  )
}
