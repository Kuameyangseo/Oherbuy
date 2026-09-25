import React from 'react'
import ProductOverview from '../../../../share/widget/productView/product-view'

type Product = any

const getBase = () => process.env.NEXT_PUBLIC_SERVER_URI ?? 'http://localhost:8080'

const fetchProduct = async (slug: string): Promise<Product | null> => {
  const base = getBase()
  // Try multiple known backend endpoints in order until one returns a product
  const endpoints = [
    `${base}/api/products/${encodeURIComponent(slug)}`,
    `${base}/products/${encodeURIComponent(slug)}`,
    // product-service endpoint (may require auth) - try as fallback
    `${base}/product/api/get-product/${encodeURIComponent(slug)}`,
  ]

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) continue
      const data = await res.json()
      const product = data?.product ?? data
      if (product) return product
    } catch (err) {
      // try next endpoint
    }
  }

  return null
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }){
  const { slug } = await params
  const product = await fetchProduct(slug)

  if (!product) {
    // Let Next render 404 if product not found
    return <div className="p-8">Product not found</div>
  }

  return <ProductOverview product={product} />
}
