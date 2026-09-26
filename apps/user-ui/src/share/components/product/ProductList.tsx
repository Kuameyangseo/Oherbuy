"use client"
import React from 'react'
import ProductCard from './ProductCard'

type Product = {
  id: string
  description?: string
  name: string
  price: number
  category: string
  subcategory?: string
  colors?: string[]
  sizes?: string[]
  inStock?: boolean
  image?: string
}

export default function ProductList({ products }: { products: Product[] }) {
  if (!products.length) return <p className="text-white/80">No products found.</p>

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
