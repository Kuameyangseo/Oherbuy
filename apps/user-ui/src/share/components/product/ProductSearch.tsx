"use client"
import React, { useEffect, useState, useRef } from 'react'
import axios from '../../../utils/axiosinstance'
import Link from 'next/link'
import { Search } from 'lucide-react'

type Props = {
  value: string
  onChange: (v: string) => void
}

function useDebouncedValue(value: any, delay = 300) {
  const [debounced, setDebounced] = useState<any>(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function ProductSearch({ value, onChange }: Props) {
  const [local, setLocal] = useState(value)
  const debounced = useDebouncedValue(local, 300)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [show, setShow] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (debounced !== value) onChange(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  useEffect(() => setLocal(value), [value])

  useEffect(() => {
    let mounted = true
    const q = (debounced || '').toString().trim()
    if (!q || q.length < 2) {
      setSuggestions([])
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await axios.get(`/api/products?search=${encodeURIComponent(q)}&limit=6`)
        if (cancelled) return
        const data = res.data
        const list = Array.isArray(data) ? data : data.products || []
        if (mounted) setSuggestions(list.slice(0, 6))
      } catch (err) {
        if (mounted) setSuggestions([])
      }
    })()

    return () => { mounted = false; cancelled = true }
  }, [debounced])

  return (
    <div ref={containerRef} className="w-full md:w-[500px] relative">
      <label className="sr-only">Search products</label>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search products, e.g. 'ghgold', category..."
        className="w-full rounded-md border border-gray-200 p-3 shadow-sm pl-10 focus:ring-2 focus:ring-green-500"
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
      />
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search/></div>
      {local && (
        <button onClick={() => setLocal('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Clear</button>
      )}

      {show && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded shadow-lg border max-h-72 overflow-auto">
          {suggestions.map((s: any) => (
            <Link key={s.id || s._id || `${s.slug}-${s.id}`} href={`/productoverview/${s.slug || s.id}`} className="block hover:bg-gray-50">
              <div className="flex items-center gap-3 p-3">
                <img
                  src={(s.images && s.images[0] && s.images[0].url) || s.image || 'https://via.placeholder.com/80'}
                  alt={s.title || s.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{s.title || s.name}</div>
                  <div className="text-xs text-gray-500">{(() => {
                    const price = s.sale_price ?? s.regular_price ?? s.price ?? 0
                    return price ? `$${Number(price).toFixed(2)}` : ''
                  })()}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
