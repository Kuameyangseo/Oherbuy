'use client';

import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar';
import Box from 'apps/seller-ui/src/share/components/box';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react'
import { Sidebar } from './sidebar.style';
import Link from 'next/link';
import Logo from 'apps/seller-ui/src/assets/svgs/logo';
import { LayoutDashboard, ListOrdered, CreditCard, SquarePlus, PackageSearch, CalendarPlus, BellPlus, Mail, Settings, BellRing, TicketPercent, LogOut    } from 'lucide-react';
import SidebarItem from './sidebar.item';
import SidebarMenu from './sidebar.menu';


const SidebarBarWrapper = () => {
  const {activeSidebar, setActiveSidebar} = useSidebar();
  const pathName = usePathname();
  const {seller} = useSeller();

  console.log(seller)

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName,setActiveSidebar])

  const getIconColor = (route:string) => activeSidebar ==route ? "#0085ff" : "#969696"
   
  return (
    <Box
    style={{
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
    <Sidebar.Header className=''>
      <Box>
        <Link href={"/"} className="flex items-center justify-center text-center gap-2">
          <Logo />
          <Box>
            <h3 className='text-2xl font-bold text-white"'>
              {seller?.shop?.name}
            </h3>
            <h5 className='text-[0.7rem] font-normal text-gray-200'>
              {seller?.shop?.address}
            </h5>
          </Box>
        </Link>
      </Box>
    </Sidebar.Header>  
    <div className='block my-3 h-full'>
      <Sidebar.Body className='body sidebar'>
        <SidebarItem
          title="Dashboard"
          icon={<LayoutDashboard fill={getIconColor("/dashboard")} />}
          isActive={activeSidebar=="/dashboard"}
          href="/dashboard"
        />
        <SidebarMenu title="Management">
          <SidebarItem
            title="Orders"
            icon={<ListOrdered fill={getIconColor("/dashboard/orders")} />}
            isActive={activeSidebar=="/dashboard/orders"}
            href="/dashboard/orders"
          />
        <SidebarItem
          title="Payments"
          icon={<CreditCard fill={getIconColor("/dashboard/payments")} />}
          isActive={activeSidebar=="/dashboard/payments"}
          href="/dashboard/payments"
        />
        </SidebarMenu>
        <SidebarMenu title="Products">
          <SidebarItem
            title="Create Product"
            icon={<SquarePlus fill={getIconColor("/dashboard/create-product")} />}
            isActive={activeSidebar=="/dashboard/create-product"}
            href="/dashboard/create-product"
          />
          <SidebarItem
            title="All Products"
            icon={<PackageSearch fill={getIconColor("/dashboard/all-products")} />}
            isActive={activeSidebar=="/dashboard/all-products"}
            href="/dashboard/all-products"
          />
        </SidebarMenu>
        <SidebarMenu title="Events">
          <SidebarItem
            title="Create Event"
            icon={<CalendarPlus fill={getIconColor("/dashboard/create-event")} />}
            isActive={activeSidebar=="/dashboard/create-event"}
            href="/dashboard/create-event"
          />
          <SidebarItem
            title="All Events"
            icon={<BellPlus fill={getIconColor("/dashboard/all-events")} />}
            isActive={activeSidebar=="/dashboard/all-events"}
            href="/dashboard/all-events"
          />
        </SidebarMenu>
        <SidebarMenu title="Controllers">
          <SidebarItem
            title="Inbox"
            icon={<Mail fill={getIconColor("/dashboard/inbox")} />}
            isActive={activeSidebar=="/dashboard/inbox"}
            href="/dashboard/inbox"
          />
          <SidebarItem
            title="Settings"
            icon={<Settings fill={getIconColor("/dashboard/settings")} />}
            isActive={activeSidebar=="/dashboard/settings"}
            href="/dashboard/settings"
          />
          <SidebarItem
            title="Notifications"
            icon={<BellRing fill={getIconColor("/dashboard/notifications")} />}
            isActive={activeSidebar=="/dashboard/notifications"}
            href="/dashboard/notifications"
          />
        </SidebarMenu>
        <SidebarMenu title="Extras">
          <SidebarItem
            title="Discounts Code"
            icon={<TicketPercent fill={getIconColor("/dashboard/discount-codes")} />}
            isActive={activeSidebar=="/dashboard/discount-codes"}
            href="/dashboard/discount-codes"
          />
          <SidebarItem
            title="Logout"
            icon={<LogOut fill={getIconColor("/dashboard/logout")} />}
            isActive={activeSidebar=="/dashboard/logout"}
            href="/login"
          />

        </SidebarMenu>
      </Sidebar.Body>
    </div>
    </Box>
  )
}



export default SidebarBarWrapper

