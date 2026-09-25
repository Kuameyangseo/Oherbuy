import SideBarWrapper from 'apps/seller-ui/src/share/components/sidebar/sidebar'
import React from 'react'
import Link from 'next/link'

const Layout = ({children}:{children: React.ReactNode}) => {
  return (
    <div className='flex h-full min-w-0 bg-black min-h-screen'>
        <nav className='fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-700 bg-slate-950 px-2 py-3 text-xs text-white md:hidden'>
          <Link href='/dashboard'>Dashboard</Link>
          <Link href='/dashboard/orders'>Orders</Link>
          <Link href='/dashboard/create-product'>Products</Link>
          <Link href='/dashboard/all-events'>Events</Link>
          <Link href='/dashboard/settings'>Settings</Link>
        </nav>
        {/* sidebar */}
        <aside className='hidden md:block w-[280px] min-w-[250px] max-w-[300px] shrink-0 border-r border-r-slate-600 text-white p-4'>
           <div  className="sticky top-0">
            <SideBarWrapper />
           </div>
        </aside>

        {/* main content area */}
        <main className='min-w-0 w-full flex-1 pb-20 md:pb-0'>
          <div className='min-w-0 overflow-auto'>
            {children}
          </div>
        </main>
    </div>
  )
}

export default Layout
