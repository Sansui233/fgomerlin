import React from 'react'
import './index.css'
import { ICONBASE } from '../../utils/dataset-conf'
import { Pages } from '../../App'
import { Link } from 'react-router-dom'

export default function AvatarWithNumber(props: {id:number,name: string, src: string, num: number }) {
  return (
    <Link className="avatar-container" to={`/${Pages.servantList}/${props.id}`}>
      <img src={ICONBASE + '/' + props.src} alt={props.name} />
      <span>{props.num}</span>
    </Link>
  )
}
