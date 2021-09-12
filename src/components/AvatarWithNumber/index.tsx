import React from 'react'
import './index.css'
import { ICONBASE } from '../../utils/dataset-conf'
import { Pages } from '../../App'
import { Link } from 'react-router-dom'

export default function AvatarWithNumber(props: { id: number | string, name: string, iconWithSuffix: string, num: number }) {
  // Servant Avatar
  if (typeof (props.id) === 'number') {
    return (
      <Link className="avatar-container" to={`/${Pages.servantList}/${props.id}`}>
        <img className="medium" src={ICONBASE + '/' + props.iconWithSuffix} alt={props.name} />
        <span>{props.num}</span>
      </Link>
    )
  }
  // Items Avatar
  // TODO add router for each item detail
  else {
    return (
      <Link className="avatar-container" to={`/${Pages.itemList}/materials`}>
        <img className="medium" src={ICONBASE + '/' + props.iconWithSuffix} alt={props.name} />
        <span className="item">{props.num}</span>
      </Link>
    )
  }
}
