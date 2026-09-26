import React from 'react'

interface Props {
  title: string;
  children: React.ReactNode;
}

const sidebarMenu = ({title, children}: Props) => {
  return (
    <div className='block'>
      <h3 className='text-xs tracking-[0.04rem] '>{title}</h3>
      {children}
    </div>
  )
}

export default sidebarMenu
