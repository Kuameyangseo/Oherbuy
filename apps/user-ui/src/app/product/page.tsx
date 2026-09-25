"use client"
import React, { useEffect, useMemo, useState } from 'react'
import axios from '../../utils/axiosinstance'
import ProductSearch from '../../share/components/product/ProductSearch'
import ProductList from '../../share/components/product/ProductList'
import SidebarFilters from '../../share/components/product/SidebarFilters'

type Product = {
  id: string
  slug?: string
  name: string
  description?: string
  // expose both sale and regular prices to UI
  salePrice?: number | null
  regularPrice?: number | null
  price: number
  category: string
  subcategory?: string
  colors?: string[]
  sizes?: string[]
  inStock?: boolean
  stock?: number
  brand?: string | null
  rating?: number
  image?: string
}

export default function ProductPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [subcategory, setSubcategory] = useState('All')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [serverCategories, setServerCategories] = useState<string[] | null>(null)
  const [serverSubcategories, setServerSubcategories] = useState<string[] | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const res = await axios.get('/api/products')
        if (!mounted) return
        const data = res.data
        const list = Array.isArray(data) ? data : data?.products || []

        const normalized = list.map((p: any) => ({
          id: p.id || p._id,
          slug: p.slug,
          name: p.title || p.name || 'Product',
          // expose both sale and regular prices to UI
          salePrice: typeof p.sale_price !== 'undefined' ? p.sale_price : null,
          regularPrice: typeof p.regular_price !== 'undefined' ? p.regular_price : (p.price ?? null),
          price: (p.sale_price ?? p.regular_price) ?? p.price ?? 0,
          category: p.category ?? 'Uncategorized',
          subcategory: p.subCategory ?? p.subcategory ?? '',
          colors: p.colors || [],
          sizes: p.sizes || [],
          inStock: (p.stock ?? 0) > 0,
          stock: p.stock ?? 0,
          brand: p.brand ?? null,
          rating: p.ratings ?? p.rating ?? 0,
          image: (p.images && p.images[0] && p.images[0].url) || p.image || `https://via.placeholder.com/320x240?text=${encodeURIComponent(p.title || p.name || 'Product')}`,
          description: p.description || p.desc || p.long_description || p.short_description || '',
        }))

        setProducts(normalized)
      } catch (err) {
        if (!mounted) return
        setError('Unable to fetch products — showing demo products')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await axios.get('/product/api/get-categories')
        if (!mounted) return
        const cats = Array.isArray(res.data?.categories) ? res.data.categories : []
        const configuredSubcategories = res.data?.subCategories
        const subs = Array.isArray(configuredSubcategories)
          ? configuredSubcategories
          : configuredSubcategories && typeof configuredSubcategories === 'object'
            ? Object.values(configuredSubcategories).flat().filter(Boolean)
            : (Array.isArray(res.data?.subcategories) ? res.data.subcategories : [])

        setServerCategories(cats)
        setServerSubcategories(subs)
      } catch (err) {
        // ignore and fallback to client-derived lists
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const availableColors = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => (p.colors || []).forEach((c) => set.add(c)))
    return Array.from(set)
  }, [products])

  const availableSizes = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => (p.sizes || []).forEach((s) => set.add(s)))
    return Array.from(set)
  }, [products])

  const availableCategories = useMemo(() => {
    if (serverCategories && serverCategories.length) return ['All', ...serverCategories.filter(Boolean)]
    const set = new Set<string>()
    products.forEach((p) => set.add(p.category || 'Uncategorized'))
    return ['All', ...Array.from(set)]
  }, [products, serverCategories])

  const availableSubcategories = useMemo(() => {
    if (serverSubcategories && serverSubcategories.length) return ['All', ...serverSubcategories.filter(Boolean)]
    const set = new Set<string>()
    products.forEach((p) => set.add(p.subcategory || ''))
    const subs = Array.from(set).filter(Boolean)
    return ['All', ...subs]
  }, [products, serverSubcategories])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = (p.name + ' ' + p.category + ' ' + (p.subcategory || '')).toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'All' ? true : p.category === category
      const matchesSubcategory = subcategory === 'All' ? true : (p.subcategory || '') === subcategory
      const matchesColors = selectedColors.length === 0 ? true : (p.colors || []).some((c) => selectedColors.includes(c))
      const matchesSizes = selectedSizes.length === 0 ? true : (p.sizes || []).some((s) => selectedSizes.includes(s))
      return matchesQuery && matchesCategory && matchesSubcategory && matchesColors && matchesSizes
    })
  }, [products, query, category, subcategory, selectedColors, selectedSizes])

  function toggleColor(c: string) {
    setSelectedColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  function toggleSize(s: string) {
    setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  function clearFilters() {
    setCategory('All')
    setSubcategory('All')
    setSelectedColors([])
    setSelectedSizes([])
    setQuery('')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-800 to-green-900 py-12">
      <div className="mx-auto w-full  xl:px-20 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold">Products</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <ProductSearch value={query} onChange={setQuery} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <SidebarFilters
              categories={availableCategories}
              subcategories={availableSubcategories}
              selectedCategory={category}
              onSelectCategory={(c) => { setCategory(c); if (c !== 'All') setSubcategory('All') }}
              selectedSubcategory={subcategory}
              onSelectSubcategory={setSubcategory}
              colors={availableColors}
              selectedColors={selectedColors}
              toggleColor={toggleColor}
              sizes={availableSizes}
              selectedSizes={selectedSizes}
              toggleSize={toggleSize}
              onClear={clearFilters}
            />
          </div>

          <div className="md:col-span-3">
             <div className="text-center p-2">
                <h1 className="font-bold text-4xl mb-3">All Product</h1>
            </div>
            {loading ? (
              <p className="text-white/80">Loading products…</p>
            ) : (
              <>
                {error && <div className="mb-4 rounded-md bg-yellow-50/10 p-3 text-yellow-200">{error}</div>}
                <ProductList products={filtered} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
