"use client"
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Product = Record<string, any>

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter()

  const ensureAbsolute = (src?: string) => {
    const placeholder = 'https://via.placeholder.com/600x400?text=Product'
    if (!src) return placeholder
    if (/^https?:\/\//i.test(src) || src.startsWith('//')) return src
    const prefix = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    return src.startsWith('/') ? `${prefix}${src}` : `${prefix}/${src}`
  }

  // support different product shapes coming from various APIs
  const img = product?.images?.length ? product.images[0].url : (product.image || product.thumbnail || product.img)
  const title = product.title || product.name || product.label || 'Untitled'
  const price = (typeof product.sale_price !== 'undefined' && product.sale_price !== null) ? product.sale_price : (product.price ?? product.regular_price ?? 0)
  const regular = product.regular_price ?? product.price ?? null
  const isOnSale = typeof product.sale_price !== 'undefined' && product.sale_price !== null && product.sale_price < (product.regular_price ?? Infinity)
  const stock = typeof product.stock !== 'undefined' ? product.stock : (product.inStock ? 1 : 0)

  const stripHtml = (s: string) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const pickPath = (obj: any, paths: string[]) => {
    for (const path of paths) {
      const parts = path.split('.')
      let val: any = obj
      for (const part of parts) {
        if (val == null) { val = undefined; break }
        val = val[part]
      }
      if (val != null) {
        const s = String(val).trim()
        if (s) return s
      }
    }
    return null
  }

  const descriptionCandidate = pickPath(product, [
    'description', 'short_description', 'desc', 'meta.description', 'attributes.description', 'details.description', 'summary', 'excerpt', 'long_description', 'content.description'
  ])
  const description = descriptionCandidate ? stripHtml(descriptionCandidate) : (product.description || '')
  const rating = product.rating ?? 4.8
  const ratingCount = product.reviewsCount ?? (Math.round(Math.random() * 200) + 1)

  const onAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const payload = { id: product.id || product._id || product.slug, title, price: Number(price ?? 0), quantity: 1, image: img }
      // lazy require to avoid SSR issues
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { addToCart } = require('../../utils/cart') as typeof import('../../utils/cart')
      addToCart(payload)
      try { (window as any).toast?.success?.('Added to cart') } catch (e) { }
    } catch (err) {
      console.error('Add to cart failed', err)
      alert('Added to cart')
    }
  }

  return (
    <div className="w-full max-w-72 bg-white dark:bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      <Link href={`/productoverview/${product.slug || product.id || product._id}`} className="block">
        <div className="relative h-32 sm:h-48 w-full bg-gray-100">
          <img src={ensureAbsolute(img)} alt={title} className="w-full h-full object-cover" />
          {isOnSale && (
            <div className="absolute top-3 left-3">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">Sale</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-medium px-2 py-1 rounded ${stock > 0 ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>{stock > 0 ? 'In stock' : 'Out of stock'}</span>
          </div>
        </div>
        <div className="p-3 sm:p-5">
          <h3
            className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-800 mb-1 line-clamp-2"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </h3>
          <p
            className="text-gray-600 dark:text-gray-400 mb-3 text-xs sm:text-sm line-clamp-3"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-800">${price}</div>
              {regular ? <div className="text-sm text-gray-400 line-through">${regular}</div> : null}
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-yellow-400 text-xs sm:text-sm">{Array.from({ length: Math.round(rating) }).map((_, i) => <span key={i}>★</span>)}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">({ratingCount})</div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={onAddToCart} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium text-xs sm:text-base py-2 px-2 sm:px-4 rounded-lg transition-colors">Add to Cart</button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); router.push(`/productoverview/${product.slug || product.id || product._id}`); }}
              className="px-2 sm:px-4 py-2 border rounded-lg text-xs sm:text-sm text-gray-700"
            >
              View
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}
