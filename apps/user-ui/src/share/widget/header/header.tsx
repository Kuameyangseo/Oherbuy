"use client"
import React from 'react'
import Link from 'next/link'
import { HeartIcon, Search,UserRoundPlus, ShoppingCart, User } from 'lucide-react';
import HeaderButton from '../header/header-buttom';
import useUser from 'apps/user-ui/src/hooks/useUser';


const Header = () => {
  const {user,isLoading} = useUser();
  return (
    <div className="w-full bg-white" >
      <div className="w-[80%] m-auto py-4 flex justify-between items-center" >
        <div>
          <Link href={"/"}>
           <span className='text-xl font-bold'>OherBuy</span>
           </Link>
        </div>
        <div className="w-[50%] relative">
           <input type="text" placeholder='search for products' 
           className='w-full bg-gray-200  p-2 outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-600'/>

           <div className="w-[50px] h-[40px] bg-green-700 absolute top-0 right-0 flex justify-center items-center cursor-pointer">
            <Search className='text-white'/>
           </div>
        </div>
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
        <div className="flex gap-5 justify-center items-center">
          <Link href={"/watchlist"} className='relative'>
          <HeartIcon/>
          <div className="w-[16px] h-[16px] rounded-full bg-green-700 flex items-center justify-center font-bold text-white absolute top-[-1.5px] right-[-1.5px] ">
          <span className='text-[0.7rem]'>0</span>
          </div>
          </Link>
          <Link href={"/cart"} className='relative'>
            <ShoppingCart />
            <div className="w-[16px] h-[16px] rounded-full bg-green-700 flex items-center justify-center font-bold text-white absolute top-[-1.5px] right-[-1.5px]">
              <span className="text-[0.7rem] leading-none flex items-center justify-center">0</span>
            </div>
          </Link>
        </div>
        </div>
      </div>
      <div className='border-b border-b-slate-200'/>
      <HeaderButton />
    </div>
  )
}

export default Header