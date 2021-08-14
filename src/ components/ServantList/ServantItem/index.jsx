import React from 'react'

export default function ServantItem(props) {
    console.log("=====servant item=====", props)
    const {sId, sName, sClass, sImg} = props

    return (
        <div className="servant-item" key={sId}>
            {sName} - {sClass}
        </div>
    )
}