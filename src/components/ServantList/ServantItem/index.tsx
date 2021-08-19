import React from 'react'
import { Servant } from '..'

export default function ServantItem(props:Servant) {
    const {sId, sName, sClass, sImg} = props

    return (
        <div className="servant-item">
            {sName} - {sClass}
        </div>
    )
}