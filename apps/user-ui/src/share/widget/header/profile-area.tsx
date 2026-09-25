"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { User, UserRoundPlus } from 'lucide-react'
import axiosInstance from 'apps/user-ui/src/utils/axiosinstance'
import useUser from 'apps/user-ui/src/hooks/useUser'
import { useQueryClient } from '@tanstack/react-query'

export default function ProfileArea({ user, isLoading }: { user: any; isLoading: boolean }) {
  const router = useRouter();
  const { refetch } = useUser();
  const queryClient = useQueryClient();
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
      // Immediately clear cached user/account so header updates without reload
      try {
        queryClient.setQueryData(['user'], null);
      } catch (e) {
        // ignore
      }
      try {
        queryClient.setQueryData(['account'], null);
      } catch (e) {
        // ignore
      }
      // trigger background refetches as a fallback to ensure consistency
      try { queryClient.invalidateQueries({ queryKey: ['user'] }); } catch (e) {}
      try { queryClient.invalidateQueries({ queryKey: ['account'] }); } catch (e) {}
      await refetch?.();
      setOpen(false);
      router.push('/');
    } catch (err) {
      console.error('Logout failed', err);
      router.push('/');
    }
  };

  if (!user) {
    return (
      <div className='flex items-center gap-3'>
        <Link href={'/login'} className='flex items-center justify-center border border-gray-300 rounded-full p-1'>
          <UserRoundPlus />
        </Link>
        <Link href={'/login'} className='flex flex-col items-start justify-center'>
          <span className='font-bold mb-[-5px]'>Hello</span>
          <span>{isLoading ? 'Loading...' : 'Guest'}</span>
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen((s) => !s)}
        className='flex items-center gap-3 px-2 py-1 rounded hover:bg-gray-100'
        aria-expanded={open}
      >
        <User />
        <div className='flex flex-col items-start'>
          <span className='font-bold mb-[-5px]'>Hello</span>
          <span className='text-sm'>{user?.name?.split(' ')[0]}</span>
        </div>
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50'>
          <div className='px-4 py-2 border-b'>
            <div className='font-medium'>{user?.name}</div>
            <div className='text-xs text-gray-500 truncate'>{user?.email}</div>
          </div>
          <Link href={'/profile'} className='block px-4 py-2 hover:bg-gray-50'>Profile</Link>
          <Link href={'/orders'} className='block px-4 py-2 hover:bg-gray-50'>Orders</Link>
          <Link href={'/settings'} className='block px-4 py-2 hover:bg-gray-50'>Settings</Link>
          <button onClick={handleLogout} className='w-full text-left px-4 py-2 hover:bg-gray-50'>Logout</button>
        </div>
      )}
    </div>
  )
}
