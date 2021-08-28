import React from 'react'

type Props = {
  children: JSX.Element[],
};

const SidebarItem: React.FC<Props> = ({children }: Props) => {
  return (
    <div className="sidebar-item-container">
      <div className="sidebar-item-hover-layer">
        {children}
      </div>
    </div>
  )
}

export default SidebarItem
