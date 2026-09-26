"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Shop = {
  id: string | number
  name?: string
  slug?: string
  description?: string
  image?: string
  bio?: string
  coverBanner?: string
}

type Props = {
  query?: string
  view?: 'grid' | 'list'
}

const ShopList: React.FC<Props> = ({ query = '', view = 'grid' }) => {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    // Use relative fetch so the request goes to the Next.js app host
    fetch('/api/shops')
      .then(async (res) => {
        if (!mounted) return
        if (!res.ok) throw new Error(`Request failed ${res.status}`)
        const data = await res.json()
        setShops(data?.shops || data || [])
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.message || 'Failed to load shops')
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="text-center p-6">Loading shops...</div>
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>

  const filtered = shops.filter((s) => {
    if (!query) return true
    const q = query.toLowerCase()
    const name = (s.name || '').toLowerCase()
    const bio = ((s as any).bio || (s as any).description || '').toLowerCase()
    return name.includes(q) || bio.includes(q)
  })

  if (!filtered || filtered.length === 0) return <div className="text-center p-6">No shops found.</div>

  // list view uses single column, grid uses columns
  const containerClass = view === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'

  return (
    <section className={containerClass}>
      {filtered.map((s) => {
        const img = (s as any).coverBanner || s.image || 'https://via.placeholder.com/900x400?text=Shop+Banner'
        const avatar = (s as any).image || 'https://via.placeholder.com/128?text=Avatar'
        const name = s.name || `Shop ${s.id}`
        const desc = (s as any).bio || s.description || 'No description available.'
        const location = (s as any).location || ''
        const rating = (s as any).rating || null

        return (
          <article
            key={s.id}
            className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-transform duration-200 ${view === 'grid' ? 'transform hover:-translate-y-1' : ''}`}
          >
            <Link href={`/shop/${s.slug || s.id}`} className="block">
              {/* Banner */}
              <div className="relative w-full h-44 bg-gray-100">
                <img src={img} alt={`${name} banner`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Avatar */}
                <div className="absolute left-6 -bottom-6 flex items-center">
                  <img src={avatar} alt={`${name} avatar`} className="w-16 h-16 rounded-full ring-4 ring-white object-cover shadow-md" />
                </div>
                {/* Verified badge top-right */}
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  {rating && (
                    <div className="bg-white/90 text-sm text-gray-800 px-2 py-1 rounded-full font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-500">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className={`pt-8 pb-6 px-6 ${view === 'list' ? 'md:flex md:items-start' : ''}`}>
                <div className="ml-0 md:ml-0">
                  <h3 className="text-lg font-semibold leading-tight">{name}</h3>
                  {location && <p className="text-sm text-gray-500 mt-1">{location}</p>}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{desc}</p>
                </div>

                <div className="mt-4 md:mt-0 md:ml-auto flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                    Open
                  </span>
                  <span className="text-sm text-gray-400">·</span>
                  <span className="text-sm text-gray-500">View shop</span>
                </div>
              </div>
            </Link>
          </article>
        )
      })}
    </section>
  )
}

export default ShopList
