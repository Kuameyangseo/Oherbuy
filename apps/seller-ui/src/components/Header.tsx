'use client';

import Link from 'next/link';
import React, {useEffect, useRef, useState} from 'react';
import useSeller from '../hooks/useSeller';
import axiosInstance from '../utils/axiosinstance';

const Header: React.FC = () => {
  const { seller, isLoading } = useSeller();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/logout');
    } catch (err) {
      // ignore errors; still redirect
    }
    window.location.href = '/login';
  };

  return (
    <header className="border-b bg-white/60 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold">O</div>
          <div>
            <div className="font-bold text-lg">Oherbuy Seller</div>
            <div className="text-xs text-gray-500">Manage your store</div>
          </div>
        </Link>

        <nav className="hidden md:flex gap-6 items-center text-sm">
          {isLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : seller ? (
            <div className="flex items-center gap-4" ref={ref}>
              <div className="text-sm text-gray-700">{seller.email}</div>

              <div className="relative">
                <button
                  aria-haspopup="true"
                  aria-expanded={open}
                  onClick={() => setOpen(v => !v)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-sm hover:bg-gray-50"
                >
                  <span className="text-sm">Account</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                      <Link href="/(routes)/dashboard/edit-shop" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Edit Shop</Link>
                      <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-indigo-600">Sign in</Link>
              <Link href="/dashboard/create-product" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Create product</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
