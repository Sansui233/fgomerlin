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
  else {
    const stones = ['之辉石','之魔石','之秘石'] as const
    const chesses = ['阶银棋','阶金像'] as const
    let route:string = Pages.itemCategory.materials
    if(stones.some(st => props.name.includes(st))){
      route = Pages.itemCategory.stones
    }
    if(chesses.some(ch => props.name.includes(ch))){
      route = Pages.itemCategory.chess
    }
    return (
      <Link className="avatar-container" to={`/${Pages.itemList}/${route}/#${props.name}`}>
        <img className="medium" src={ICONBASE + '/' + props.iconWithSuffix} alt={props.name} />
        <span className="item">{props.num}</span>
      </Link>
    )
  }
}
