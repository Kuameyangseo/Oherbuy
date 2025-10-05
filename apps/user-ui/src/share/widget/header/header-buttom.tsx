"use client"
import { navItems} from 'apps/user-ui/src/configs/constants';
import { AlignLeft, ChevronDown, HeartIcon, ShoppingCart,} from 'lucide-react';
import React,{ useEffect,useState } from 'react'
import Link from 'next/link';
import { UserRoundPlus } from 'lucide-react';

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
            <span className='text-sm'>All Department</span>
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
              className="px-2 font-medium text-sm"
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>
        <div className='flex items-center justify-center gap-10'>
          {isSticky && (
            <>
            <div className="profilePic">
              <div className="mainProfile">
                <Link href={"/login"} className='svgPic'>
                  <UserRoundPlus />
                </Link>
              </div>
              <Link href={"/login"} className='profileLink-col-1'>
                <span className='profileLink'>Hello</span>
                <span className='profileLink2'>Sign In</span>
              </Link>
            </div>
            <div className="watchList-col-1">
                <Link href={"/watchlist"} className='watchListLink'>
                  <HeartIcon />
                  <div className="heartIcon">
                    <span>0</span>
                  </div>
                </Link>
                <Link href={"/cart"} className='watchListLink'>
                  <ShoppingCart />
                  <div className="heartIcon">
                    <span>0</span>
                  </div>
                </Link>
              </div></>
          )}
        </div>
      </div>
    </div>
  </div>
);
}

export default HeaderButton;
