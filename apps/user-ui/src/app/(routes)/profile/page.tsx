"use client"
import React from 'react'
import useUser from 'apps/user-ui/src/hooks/useUser'
import Link from 'next/link'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-40 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Not signed in</h2>
          <p className="mb-4 text-gray-600">You need to sign in to view your profile.</p>
          <div className="flex justify-center gap-4">
            <Link href="/login" className="px-4 py-2 bg-green-600 text-white rounded">Sign in</Link>
            <Link href="/signup" className="px-4 py-2 border rounded">Create account</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl text-gray-500">
            {user?.avatar || user?.name ? (
              <span>{(user?.name || '').split(' ').map((s:string)=>s[0]).slice(0,2).join('')}</span>
            ) : (
              <User />
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user?.name || 'Unnamed'}</h1>
            <div className="text-sm text-gray-600">{user?.email}</div>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href="/orders" className="inline-block px-3 py-1 bg-green-600 text-white rounded">My Orders</Link>
              <Link href="/settings" className="inline-block px-3 py-1 border rounded">Account Settings</Link>
              <Link href="/" className="inline-block px-3 py-1 border rounded">Browse</Link>
            </div>
          </div>
        </div>

        <div className="border-t p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Profile details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="text-sm text-gray-500">Full name</div>
                  <div className="font-medium">{user?.name || '-'}</div>
                </div>
                <Link href="/settings" className="text-sm text-green-600">Edit</Link>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{user?.email || '-'}</div>
                </div>
                <Link href="/settings" className="text-sm text-green-600">Manage</Link>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500 mb-2">Bio</div>
                <div className="text-sm text-gray-700">{user?.bio || 'No bio available.'}</div>
              </div>
            </div>
          </div>

          <aside className="bg-white border rounded p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Quick actions</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/orders" className="text-green-600">View orders</Link></li>
              <li><Link href="/settings" className="text-green-600">Account settings</Link></li>
              <li><Link href="/logout" className="text-red-600">Sign out</Link></li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}
