"use client"
import React, { useState } from 'react'
import ShopList from './shopList'

export default function ClientShopPage() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <main>
      <header className="rounded-lg bg-gradient-to-r from-green-800 to-green-900 text-white p-8 mb-8 shadow-md">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold">Explore Shops</h1>
          <p className="mt-2 text-green-200">Discover verified sellers and curated storefronts on Oherbuy.</p>

          <div className="mt-6 flex items-center gap-3 justify-center">
            <div className="w-full max-w-2xl">
              <label className="sr-only">Search shops</label>
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search shops, keywords, locations..."
                  className="w-full rounded-full px-4 py-3 text-gray-800 focus:outline-none"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-full">Search</button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setView('grid')} className={`px-3 py-2 rounded ${view === 'grid' ? 'bg-white text-green-800' : 'bg-white/10 text-white'}`}>Grid</button>
              <button onClick={() => setView('list')} className={`px-3 py-2 rounded ${view === 'list' ? 'bg-white text-green-800' : 'bg-white/10 text-white'}`}>List</button>
            </div>
          </div>
        </div>
      </header>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured Shops</h2>
            <p className="text-sm text-gray-500">Popular and new storefronts</p>
          </div>
        </div>

        <ShopList query={query} view={view} />
      </section>
    </main>
  )
}
