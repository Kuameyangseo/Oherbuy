"use client"
import { navItems} from 'apps/user-ui/src/configs/constants';
import { AlignLeft, ChevronDown, HeartIcon, ShoppingCart, User,} from 'lucide-react';
import React,{ useEffect,useState } from 'react'
import Link from 'next/link';
import { UserRoundPlus } from 'lucide-react';
import useUser from 'apps/user-ui/src/hooks/useUser';

const HeaderButton = () => {
   const [show, setShow] = useState(false);
   const [isSticky, setIsSticky] = useState(false);
   const { user, isLoading } = useUser();

   console.log(user);

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
      className={`w-full flex transition-all transition-duration-300ms bg-white  ${
        isSticky
          ?  ' display-flex align-items-center justify-content-center fixed top-0 left-0 right-0 z-[500] bg-white shadow-lg h-[60px]'
          : 'relative'
      }`}
      style={isSticky ? { width: '100%' } : {}}
    >
      <div className={`w-[80%] h-[45px] m-auto flex justify-between items-center   ${isSticky ? 'pt-0' : 'py-0'}`}>
        {/* All dropdown */}
        <div
          className={`w-[260px] h-[40px] cursor-pointer flex items-center justify-center gap-10 bg-green-700 ${isSticky ? 'mb' : ''}`}
          onClick={() => setShow(!show)}
        >
          <AlignLeft color="white" />
          <div className="flex justify-between items-center">
            <span className='text-sm text-white font-bold'>All Department</span>
          </div>
          <ChevronDown color="white" />
        </div>

        {/* {DROP DOWN} */}
        {show && (
          <div
            className={`w-[260px] h-[300px] absolute left-[] top-[53px] bg-gray-200 ${isSticky ? 'top-[70px] padding-top: 25px;' : 'top-[138px]'}`}
          ></div>
        )}

        {/* {navlinks} */}
        <div className="flex items-center gap-10">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className="px-2 font-medium text-[1rem]"
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
            <div className='flex items-center justify-center gap-10'>
          <div className="flex items-center justify-center gap-2 cursor-pointer">
          {!isLoading && user ? (
            <>
            <Link href={"/profile"}>
               <User />
            </Link>
            <Link href={"/login"} className='flex flex-col items-start justify-center'>
              <span className='font-bold mb-[-5px]'>Hello</span>
              <span>{user?.name?.split(" ")[0] }</span>
            </Link>
            </>
          ):(
            <>
            <Link href={"/login"} className='flex items-center justify-center border border-gray-300 rounded-full p-1'>
              <UserRoundPlus />
            </Link>
            <Link href={"/login"} className='flex flex-col items-start justify-center'>
            <span className='font-bold mb-[-5px]'>Hello</span>
            <span>{isLoading ? "Loading..." : "Guest"}</span>
            </Link>
            </>
           )} 
        
        </div>
        </div>
            <div className="flex gap-5 justify-center items-center">
                <Link href={"/watchlist"} className='relative'>
                  <HeartIcon />
                  <div className="w-[16px] h-[16px] rounded-full bg-green-700 flex items-center justify-center font-bold text-white absolute top-[-1.5px] right-[-1.5px]">
                     <span className="text-[0.7rem] leading-none flex items-center justify-center">0</span>
                  </div>
                </Link>
                <Link href={"/cart"} className='relative'>
                  <ShoppingCart />
                  <div className="w-[16px] h-[16px] rounded-full bg-green-700 flex items-center justify-center font-bold text-white absolute top-[-1.5px] right-[-1.5px] ">
                   <span className='text-[0.7rem] leading-none flex items-center justify-center'>0</span>
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
