import './index.css';

import React from 'react';
import { Link } from 'react-router-dom';

import { Pages } from '../../App';
import { ICONBASE } from '../../utils/dataset-conf';

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
      <Link className="avatar-container" to={`/${Pages.itemList}/materials/#${props.name}`}>
        <img className="medium" src={ICONBASE + '/' + props.iconWithSuffix} alt={props.name} />
        <span className="item">{props.num}</span>
      </Link>
    )
  }
}
