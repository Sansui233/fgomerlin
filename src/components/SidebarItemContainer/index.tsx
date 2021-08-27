import React from 'react'

type Props = {
  key: string | number,
  children: JSX.Element[],
};

const SidebarItem: React.FC<Props> = ({ key, children }: Props) => {
  return (
    <div className="sidebar-item-container" key={key}>
      <div className="sidebar-item-hover-layer">
        {children}
      </div>
    </div>
  )
}

export default SidebarItem
