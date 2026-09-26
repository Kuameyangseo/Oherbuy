"use client"

import React, { useEffect, useRef, useState } from 'react'
import axios from '../../../utils/axiosinstance'
import ProductCard from '../../components/product/ProductCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type GalleryProduct = Record<string, any>

const demoProducts: GalleryProduct[] = [
  {
    id: 'demo-plushy-chair',
    slug: 'soft-plushy-cushion-chair',
    title: 'Soft Plushy Cushion Chair',
    description: 'A comfortable cushion chair for relaxed everyday seating.',
    regular_price: 29.99,
    stock: 10,
    image: 'https://www.dropbox.com/s/mlor33hzk73rh0c/x14423.png?dl=1',
  },
  {
    id: 'demo-wooden-chair',
    slug: 'comfortable-wooden-chair',
    title: 'Comfortable Wooden Chair',
    description: 'A strong wooden chair with a simple, timeless finish.',
    regular_price: 39.99,
    stock: 10,
    image: 'https://www.dropbox.com/s/8ymeus1n9k9bhpd/y16625.png?dl=1',
  },
  {
    id: 'demo-wooden-trolly',
    slug: 'multipurpose-wooden-trolly',
    title: 'Multipurpose Wooden Trolly',
    description: 'A practical trolley for moving and organizing household items.',
    regular_price: 19.99,
    stock: 10,
    image: 'https://www.dropbox.com/s/ykdro56f2qltxys/hh2774663-87776.png?dl=1',
  },
  {
    id: 'demo-wooden-tool',
    slug: 'multipurpose-wooden-tool',
    title: 'Multipurpose Wooden Tool',
    description: 'A useful wooden tool for everyday home projects.',
    regular_price: 34.99,
    stock: 10,
    image: 'https://www.dropbox.com/s/1fav310i2eqkdz8/tool2.png?dl=1',
  },
]

const normalizeProduct = (product: GalleryProduct): GalleryProduct => ({
  ...product,
  id: product.id || product._id || product.slug,
  title: product.title || product.name || 'Product',
  description: product.description || product.short_description || product.desc || '',
  image: product.image || product.thumbnail || product.images?.[0]?.url,
  stock: product.stock ?? 1,
})

const ProductGallary = () => {
  const [products, setProducts] = useState<GalleryProduct[]>(demoProducts)
  const [loading, setLoading] = useState(true)
  const [usingDemoProducts, setUsingDemoProducts] = useState(false)
  const scrollerRef = useRef<HTMLElement>(null)

  const scrollProducts = (direction: number) => {
    scrollerRef.current?.scrollBy({ left: direction * scrollerRef.current.clientWidth * 0.8, behavior: 'smooth' })
  }

  const handleWheel = (event: React.WheelEvent<HTMLElement>) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.currentTarget.scrollLeft += event.deltaY
      event.preventDefault()
    }
  }

  useEffect(() => {
    let mounted = true

    axios.get('/api/products')
      .then((response) => {
        if (!mounted) return
        const data = response.data
        const list = Array.isArray(data) ? data : data?.products || []
        const normalized = list.map(normalizeProduct).filter((product: GalleryProduct) => product.id)
        setProducts(normalized.length ? normalized.slice(0, 8) : demoProducts)
        setUsingDemoProducts(!normalized.length)
      })
      .catch(() => {
        if (!mounted) return
        setProducts(demoProducts)
        setUsingDemoProducts(true)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [])

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-10 pt-2 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Recommended Products</h1>
        <p className="text-gray-600">Find something useful for your home.</p>
        {usingDemoProducts && !loading && (
          <p className="mt-2 text-sm text-gray-500">Showing featured products while the catalog reconnects.</p>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading products...</div>
      ) : (
        <div className="relative">
          <button
            type="button"
            aria-label="Show previous recommended products"
            onClick={() => scrollProducts(-1)}
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 text-gray-800 shadow-md transition hover:bg-gray-100 md:block"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Show next recommended products"
            onClick={() => scrollProducts(1)}
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 text-gray-800 shadow-md transition hover:bg-gray-100 md:block"
          >
            <ChevronRight size={22} />
          </button>
          <section
            ref={scrollerRef}
            onWheel={handleWheel}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
          {products.map((product) => (
            <div key={String(product.id)} className="w-[calc(50%_-_0.75rem)] shrink-0 snap-start sm:w-[45vw] md:w-[31vw] lg:w-[calc((100%_-_6rem)/5)]">
              <ProductCard product={product} />
            </div>
          ))}
          </section>
        </div>
      )}
    </section>
  )
}

export default ProductGallary
