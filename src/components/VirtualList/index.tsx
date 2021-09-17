import React, { useState } from 'react'
import { Servant } from '../../pages/ServantList'

type Props<T> = {
  className: string,
  itemCount: number,
  itemData: T[],
  height: number,
  width: number,
  itemSize: number
  rowRender: (
    index: number,
    style: React.CSSProperties,
    data: Servant[],
  ) => JSX.Element
}

const VirtualList: React.FC<Props<Servant>> = (props) => {
  const { className, itemCount, itemData, height, width, itemSize, rowRender } = props
  const [topIndex, settopIndex] = useState(0)
  const visibleCount = height / itemSize
  const preCount = 5
  const afterCount = 5

  const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    settopIndex(e.currentTarget.scrollTop / itemSize - preCount)
  }

  return (
    <div onScroll={handleScroll} className={className}
      // <div className={className}
      style={{
        position: 'relative',
        width: width,
        height: height,
        overflowY: 'auto',
        overflowX: 'hidden',
        willChange: 'transform',
        paddingBottom: itemSize
      }}>
      <div style={{ width, height: itemSize * itemCount }}>

        {props.itemData.map((v, i) => {
          if (i < topIndex || i > topIndex + visibleCount + preCount + afterCount) {
            return null
          }
          // console.debug('Render list item', i, v.sName)
          const itemstyle: React.CSSProperties = {
            position: 'absolute',
            height: itemSize,
            left: 0,
            width: '100%',
            top: i * itemSize
          }

          return (
            <div key={v.sId}>
              {rowRender(i, itemstyle, itemData)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VirtualList