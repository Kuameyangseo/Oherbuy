'use client';

import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar';
import Box from 'apps/seller-ui/src/share/components/box';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react'
import { Sidebar } from './sidebar.style';
import Link from 'next/link';
import Logo from 'apps/seller-ui/src/assets/svgs/logo';

const SidebarBarWrapper = () => {
  const {activeSidebar, setActiveSidebar} = useSidebar();
  const pathName = usePathname();
  const {seller} = useSeller();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName,setActiveSidebar])

  const getIconColor = (route:string) => activeSidebar ==route ? "#0085ff" : "#969696"
   
  return (
    <Box
    css={{
      height: "100vh",
      zIndex: 202,
      position: "sticky",
      padding: "8px",
      top: "0",
      overflowY: "scroll",
      scrollbarWidth: "none"
    }}
    className='sidebar-wrapper'
    >
    <Sidebar.Header>
      <Box>
        <Link href={"/"} className="flex justify-center text-center gap-2">
        <Logo />
        </Link>
      </Box>
    </Sidebar.Header>  
    </Box>
  )
}

export default SidebarBarWrapper
