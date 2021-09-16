import './index.css'
import React, { useEffect, useState } from 'react'
import { getVersion, version } from '../../utils/db'

export default function AppInfoModal(props: { close: () => any }) {
  const [dataVersion, setdataVersion] = useState('未知')
  useEffect(() => {
    getVersion().then(v => setdataVersion(v))
  }, [])
  return (
    <div className='app-info-modal' onClick={props.close} >
      <div className="app-info-modal-content" onClick={e => e.stopPropagation()}>
        <h1>FGO Merlin</h1>
        <p className='description'>fgo 素材规划工具</p>
        <button className='clear-button app-info-modal-closebtn' onClick={props.close}>
          X
        </button>
        <p>数据库版本：{version}<br/>
        数据包日期：{dataVersion}</p>
        <h3>作者</h3>
        <a href="https://github.com/Sansui233" target="_blank" rel="noreferrer">Sansui233</a> on Github
        <h3>数据来源</h3>
        <li><a href="https://github.com/chaldea-center" target="_blank" rel="noreferrer">Chaldea Center</a></li>
        <h3>感谢</h3>
        <li><a href="https://github.com/narumishi" target="_blank" rel="noreferrer">narumishi</a></li>
        <h3>设计</h3>
        <p>部分UI库的相应版权声明如下</p>
        <li><a href="https://ant.design/" target="_blank" rel="noreferrer">Ant Design</a> MIT License</li>
        <li><a href="https://fontawesome.com/" target="_blank" rel="noreferrer">Font Awesome</a> Free Icon License</li>
      </div>
    </div>
  )
}
