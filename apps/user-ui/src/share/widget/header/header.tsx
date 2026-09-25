"use client"
import React from 'react'
import Link from 'next/link'
import { HeartIcon, Search, ShoppingCart } from 'lucide-react';
import HeaderButton from '../header/header-buttom';
import { useEffect, useState } from 'react';
import { getCartCount, onCartChange } from '../../utils/cart';
import useUser from 'apps/user-ui/src/hooks/useUser';
import ProfileArea from './profile-area';


const Header = () => {
  const { user, isLoading } = useUser();
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    // After mount, read the client cart count to avoid hydration mismatch
    try {
      setCartCount(getCartCount())
    } catch (e) {
      // ignore
    }

    const off = onCartChange((c) => setCartCount(c));
    // also handle initialized event
    const init = (e: Event) => { const d = (e as CustomEvent).detail; setCartCount(d?.count ?? getCartCount()) }
    window.addEventListener('oherbuy_cart_initialized', init as EventListener)
    return () => { off(); window.removeEventListener('oherbuy_cart_initialized', init as EventListener) }
  }, [])
  return (
    <div className="w-full bg-white">
      <div className="w-[92%] max-w-7xl m-auto py-3 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="shrink-0">
          <Link href={"/"}>
            <span className="text-xl font-bold">OherBuy</span>
          </Link>
        </div>

        <div className="w-full sm:w-[50%] relative order-3 sm:order-none">
          <input
            type="text"
            placeholder="search for products"
            className="w-full bg-gray-200 p-2 outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-600"
          />

          <div className="w-[50px] h-[40px] bg-green-700 absolute top-0 right-0 flex justify-center items-center cursor-pointer">
            <Search className="text-white" />
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-4 sm:gap-10">
          <ProfileArea user={user} isLoading={isLoading} />

          <div className="flex gap-5 justify-center items-center">
            <Link href={"/watchlist"} className="relative">
              <HeartIcon />
              <div className="w-[16px] h-[16px] rounded-full bg-green-700 flex items-center justify-center font-bold text-white absolute -top-1 -right-1">
                <span className="text-[0.7rem]">0</span>
              </div>
            </Link>

            <Link href={"/cart"} className="relative">
              <ShoppingCart />
              <div className="w-[16px] h-[16px] rounded-full bg-green-700 flex items-center justify-center font-bold text-white absolute -top-1 -right-1">
                <span className="text-[0.7rem] leading-none flex items-center justify-center">{cartCount}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-b-slate-200" />
      <HeaderButton />
    </div>
  );
};

export default Header