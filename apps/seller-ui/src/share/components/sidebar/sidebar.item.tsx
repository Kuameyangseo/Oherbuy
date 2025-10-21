import { Link } from 'lucide-react'
import React from 'react'


interface Props {
  title: string;
  isActive?: boolean
  href: string;
  icon: React.ReactNode;
}

const sidebarItem = ({icon, title, isActive, href}: Props) => {
  return (
    <Link href={href} className='my-2 block'>
      <div
      className={`flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg curser-pointer transition hover:bg-[#2b2f31]
        ${isActive &&
          "scale-[.98] bg-[#0f3258] fill-blue-200 hover:bg-[#053158d6]"
        }`}>
          {icon}
          <h5 className='text-slate-200 text-lg'>{title}</h5>
      </div>
    </Link>
  )
}

export default sidebarItem
