import { Select } from 'antd';

const { Option } = Select;

enum Node {
  current,
  target
}

export default function Selections(props: {
  mode: "skill" | "appendedskill" | "level" | "finalLevel",
  current: number, target: number, rarity?: number,
  changeSelection: (current: number, target: number) => void
}) {
  function handleSelectionChange(param: Node) {
    if (param === Node.current) {
      return (val: string) => {
        const v = parseInt(val)
        const target = v > props.target ? v : props.target;
        props.changeSelection(v, target)
      }
    }
    return (val: string) => {
      const v = parseInt(val)
      const current = props.current > v ? v : props.current;
      props.changeSelection(current, v)
    }
  }

  let numbers: number[] = []

  switch (props.mode) {
    case "skill":
      numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      return (
        <div onClick={e => { e.stopPropagation() }}>
          <Select className="skill-select" value={props.current.toString()} onChange={handleSelectionChange(Node.current)}>
            {numbers.map((i) => {
              return <Option key={i} value={i}>{i}</Option>
            })}
          </Select>
          <span className="text-gray">→</span>
          <Select className="skill-select" value={props.target.toString()} onChange={handleSelectionChange(Node.target)}>
            {numbers.map((i) => {
              return <Option key={i} value={i}>{i}</Option>
            })}
          </Select>
        </div>
      )
    case "appendedskill":
      numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      return (
        <div onClick={e => { e.stopPropagation() }}>
          <Select className="skill-select" value={props.current.toString()} onChange={handleSelectionChange(Node.current)}>
            {numbers.map((i) => {
              return <Option key={i} value={i}>{i}</Option>
            })}
          </Select>
          <span className="text-gray">→</span>
          <Select className="skill-select" value={props.target.toString()} onChange={handleSelectionChange(Node.target)}>
            {numbers.map((i) => {
              return <Option key={i} value={i}>{i}</Option>
            })}
          </Select>
        </div>
      )
    case "level":
      numbers = [0, 1, 2, 3, 4];
      return (
        <div onClick={e => { e.stopPropagation() }}>
          <Select className="skill-select" value={props.current.toString()} onChange={handleSelectionChange(Node.current)}>
            {numbers.map((i) => {
              return <Option key={i} value={i}>{i}</Option>
            })}
          </Select>
          <span className="text-gray">→</span>
          <Select className="skill-select" value={props.target.toString()} onChange={handleSelectionChange(Node.target)}>
            {numbers.map((i) => {
              return <Option key={i} value={i}>{i}</Option>
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
      return (
        <div onClick={e => { e.stopPropagation() }}>
          <Select className="skill-select"
            value={(props.current < numbers[0] ? numbers[0] : props.current).toString()}
            onChange={handleSelectionChange(Node.current)}>
            {numbers.map((i) => {
              return <Option key={`flc${i}`} value={i}>{i}</Option>
            })}
          </Select>
          <span className="text-gray">→</span>
          <Select className="skill-select"
            value={(props.target < numbers[0] ? numbers[0] : props.target).toString()}
            onChange={handleSelectionChange(Node.target)}>
            {numbers.map((i) => {
              return <Option key={`flt${i}`} value={i}>{i}</Option>
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
