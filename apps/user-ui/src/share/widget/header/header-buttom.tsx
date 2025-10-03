"use client"
import { navItems} from 'apps/user-ui/src/configs/constants';
import { AlignLeft, ChevronDown,} from 'lucide-react';
import React,{ useEffect,useState } from 'react'
import Link from 'next/link';

const HeaderButton = () => {
   const [show, setShow] = useState(false);
   const [isSticky, setIsSticky] = useState(false);

   useEffect(() => {
     const handleScroll = () => {
       if (window.scrollY > 100) {
         setIsSticky(true);
       } else {
         setIsSticky(false);
       }
     };

     window.addEventListener('scroll', handleScroll);

     return () => {
       window.removeEventListener('scroll', handleScroll);
     };
   }, []);

  // ...existing code...
return (
  <div>
    <div
      className={`firstDropDown ${
        isSticky
          ?  ' display-flex align-items-center justify-content-center fixed top-0 left-0 right-0 z-[500] bg-white shadow-lg h-[80px]'
          : 'relative'
      }`}
      style={isSticky ? { width: '100%' } : {}}
    >
      <div className={`dropdown ${isSticky ? 'pt-3' : 'py-0'}`}>
        {/* All dropdown */}
        <div
          className={`dropbtn ${isSticky ? '-mb-2' : ''}`}
          onClick={() => setShow(!show)}
        >
          <div className="dropbtn-col-1">
            <AlignLeft color="white" />
            <span>All Department</span>
          </div>
          <ChevronDown color="white" />
        </div>

        {/* {DROP DOWN} */}
        {show && (
          <div
            className={`dropdown-bg ${isSticky ? 'top-[70px] padding-top: 25px;' : 'top-[138px]'}`}
          ></div>
        )}

        {/* {navlinks} */}
        <div className="navLinks">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className="px-5 font-medium text-lg"
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);
// ...existing code...
}

export default HeaderButton;
