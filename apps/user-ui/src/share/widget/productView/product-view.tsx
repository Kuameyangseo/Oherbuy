"use client"

import React, { useEffect, useState } from 'react'
import axios from '../../../utils/axiosinstance'
import Link from 'next/link'

type Image = { id?: string; url: string }
type Product = {
    id: string;
    title: string;
    brand?: string;
    category?: string;
    sale_price?: number;
    regular_price?: number;
    stock?: number | string;
    detailed_description?: string;
    short_description?: string;
    images?: Image[];
    colors?: string[];
    sizes?: string[];
    // optional fields referenced in the component
    tags?: string[];
    ratings?: number | string;
    // shops can have different shapes across APIs, support common fields used in the UI
    shops?: {
        name?: string;
        shopName?: string;
        [key: string]: any;
    } | null;
}

const ProductOverview: React.FC<{ product: Product }> = ({ product }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
    const img = product.images && product.images.length ? product.images[selectedImageIndex].url : 'https://cdn.pixabay.com/photo/2020/05/22/17/53/mockup-5206355_960_720.jpg'
    const price = product.sale_price ?? product.regular_price ?? 0
    const stock = Number(product.stock ?? 0)
    const defaultColors = product.colors && product.colors.length ? product.colors : ['#111827', '#ef4444', '#3b82f6', '#f59e0b']
    const defaultSizes = product.sizes && product.sizes.length ? product.sizes : ['S','M','L','XL','XXL']

    const [selectedColor, setSelectedColor] = useState<string | null>(defaultColors[0] ?? null)
    const [selectedSize, setSelectedSize] = useState<string | null>(defaultSizes[0] ?? null)

    const onAddToCart = () => {
        if (stock <= 0) {
            alert('Product is out of stock')
            return
        }

        // if the product defines sizes, ensure one is selected
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            alert('Please select a size')
            return
        }

        // if the product defines colors, ensure one is selected
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            alert('Please select a color')
            return
        }

        // Attempt to add to cart via backend API (best-effort), otherwise use local cart
        (async () => {
            try {
                const payload = {
                    productId: product.id,
                    quantity: 1,
                    color: selectedColor,
                    size: selectedSize,
                }
                await axios.post('/api/cart', payload)
                try { (window as any).toast?.success?.('Added to cart') } catch (e) {}
                // Also persist to local cart so we capture shopId/sellerId for checkout derivation
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const { addToCart } = require('../../utils/cart') as typeof import('../../utils/cart')
                    const shopId = (product as any).shopId ?? (product as any).shop ?? (product as any).shops?.id ?? (product as any).shops?._id ?? null
                    const sellerId = (product as any).sellerId ?? (product as any).shops?.sellerId ?? null
                    addToCart({ id: product.id, title: product.title, price: Number(product.sale_price ?? product.regular_price ?? 0), quantity: 1, image: img, shopId, sellerId })
                } catch (e) {
                    // ignore local write failures
                }
            } catch (err: any) {
                console.error('Add to cart failed, falling back to local cart', err?.message ?? err)
                try {
                    // require local utility to avoid SSR issues
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const { addToCart } = require('../../utils/cart') as typeof import('../../utils/cart')
                    // try to include shop/shopId and seller info when available so checkout can derive seller
                    const shopId = (product as any).shopId ?? (product as any).shop ?? (product as any).shops?.id ?? (product as any).shops?._id ?? null
                    const sellerId = (product as any).sellerId ?? (product as any).shops?.sellerId ?? null
                    addToCart({ id: product.id, title: product.title, price: Number(product.sale_price ?? product.regular_price ?? 0), quantity: 1, image: img, shopId, sellerId })
                    try { (window as any).toast?.success?.('Added to cart') } catch (e) {}
                } catch (e2) {
                    console.error('Local addToCart failed', e2)
                    alert('Added to cart (demo)')
                }
            }
        })()
    }

    return (
        <div>
            <div className="bg-gray-100 dark:bg-green-800 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row -mx-4">
                        <div className="md:flex-1 px-4">
                            <div className="h-[460px] rounded-lg bg-gray-300 dark:bg-gray-700 mb-4">
                                <img className="w-full h-full object-cover" src={img} alt={product.title} />
                            </div>
                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex mt-3 space-x-2 items-center">
                                    {product.images.map((im, idx) => (
                                        <button
                                            key={im.id ?? im.url ?? idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            type="button"
                                            className={`w-16 h-16 rounded overflow-hidden border ${selectedImageIndex === idx ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                                            aria-label={`select-image-${idx}`}
                                        >
                                            <img src={im.url} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex -mx-2 mb-4">
                                <div className="w-1/2 px-2">
                                    <button onClick={onAddToCart} className="w-full bg-gray-900 dark:bg-gray-600 text-white py-2 px-4 rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-700">Add to Cart</button>
                                </div>
                                <div className="w-1/2 px-2">
                                    <button className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 px-4 rounded-full font-bold hover:bg-gray-300 dark:hover:bg-gray-600">Add to Wishlist</button>
                                </div>
                            </div>
                        </div>
                        <div className="md:flex-1 px-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{product.title}</h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{product.short_description}</p>
                                    {product.tags && product.tags.length > 0 && (
                                        <div className="flex gap-2 flex-wrap mt-2">
                                            {product.tags.map((t: string) => (
                                                <span key={t} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right text-sm">
                                    {product.shops && (
                                        <div className="mb-2">
                                            <div className="text-xs text-gray-500">Sold by</div>
                                            <div className="font-semibold text-gray-800 dark:text-white">{product.shops.name || product.shops?.shopName || product.shops?.name}</div>
                                        </div>
                                    )}
                                    {typeof product.ratings !== 'undefined' && (
                                        <div className="text-xs text-yellow-400">Rating: {Number(product.ratings).toFixed(1)} ★</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex mb-4">
                                <div className="mr-4">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">Price:</span>
                                    <span className="text-gray-600 dark:text-gray-300">${price}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">Availability:</span>
                                    <span className="text-gray-600 dark:text-gray-300">{stock > 0 ? 'In Stock' : 'Out of stock'}</span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Select Color:</span>
                                <div className="flex items-center mt-2">
                                    {defaultColors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setSelectedColor(c)}
                                            className={`w-6 h-6 rounded-full mr-2 ${selectedColor === c ? 'ring-2 ring-offset-1 ring-gray-800' : ''}`}
                                            style={{ backgroundColor: c }}
                                            aria-label={`color-${c}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Select Size:</span>
                                <div className="flex items-center mt-2">
                                    {defaultSizes.map((s) => {
                                        const isActive = selectedSize === s
                                        const base = 'py-2 px-4 rounded-full font-bold mr-2 hover:bg-gray-400 dark:hover:bg-gray-600'
                                        const light = isActive ? 'bg-gray-900 text-white' : 'bg-gray-300 text-gray-700'
                                        const dark = isActive ? '' : 'dark:bg-gray-700 dark:text-white'
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => setSelectedSize(s)}
                                                type="button"
                                                aria-pressed={isActive}
                                                className={`${base} ${light} ${dark}`}
                                            >
                                                {s}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div>
                                <span className="font-bold text-gray-700 dark:text-gray-300">Product Description:</span>
                                <div className="text-gray-600 dark:text-gray-300 text-sm mt-2" dangerouslySetInnerHTML={{ __html: product.detailed_description || product.short_description || '' }} />
                            </div>
                        </div>
                    </div>
                </div>
                    </div>
                    <LatestProducts currentId={product.id} />
                </div>
    )
}

export default ProductOverview

const LatestProducts: React.FC<{ currentId?: string }> = ({ currentId }) => {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        setLoading(true);
        (async () => {
            try {
                // prefer API gateway endpoint, fall back to public auth-service path
                let res
                try {
                    res = await axios.get('/api/products')
                } catch (e) {
                    res = await axios.get('/products')
                }
                if (!mounted) return
                // support both shapes: { products: [...] } or a raw array
                let list = Array.isArray(res.data) ? (res.data as any[]) : (res.data.products || [])
                // sort by createdAt desc if available
                list.sort((a: any, b: any) => {
                    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
                    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
                    return tb - ta
                })

                // ensure the current product is included and appears near the front
                if (currentId && !list.find((x: any) => String(x.id) === String(currentId))) {
                    let item: any = null
                    try {
                        const single = await axios.get(`/api/products/${currentId}`)
                        item = single.data.product || single.data || null
                    } catch (e) {
                        try {
                            const single2 = await axios.get(`/products/${currentId}`)
                            item = single2.data.product || single2.data || null
                        } catch (e2) {
                            // ignore
                        }
                    }
                    if (item) {
                        list = [item, ...list]
                    }
                }

                setProducts(list.slice(0, 12))
            } catch (err: any) {
                if (!mounted) return
                setError(err?.response?.data?.message || err.message || 'Failed to load latest products')
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => {
            mounted = false
        }
    }, [currentId])

    if (loading) {
        return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">Loading latest products...</div>
    }
    if (error) {
        return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-red-500">{error}</div>
    }

    if (!products.length) return null

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h3 className="text-xl font-bold mb-4">Latest Products</h3>
            <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4">
                    {products.map((p) => {
                        const img = p.images && p.images.length ? p.images[0].url : 'https://via.placeholder.com/300'
                        const price = p.sale_price ?? p.regular_price ?? 0
                        const regular = p.regular_price
                        const isOnSale = typeof p.sale_price !== 'undefined' && p.sale_price !== null && p.sale_price < (p.regular_price ?? Infinity)
                        const isCurrent = currentId && String(p.id) === String(currentId)

                        return (
                            <Link key={p.id} href={`/productoverview/${p.slug || p.id}`} className={`block w-56 flex-shrink-0 bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-200 ${isCurrent ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}>
                                <div className="relative w-full h-36 bg-gray-100">
                                    <img src={img} alt={p.title} className="w-full h-full object-cover" />
                                    {isOnSale && (
                                        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">Sale</span>
                                    )}
                                    {p.stock !== undefined && (
                                        <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded ${p.stock > 0 ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>{p.stock > 0 ? 'In stock' : 'Out of stock'}</span>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h4 className="text-sm font-semibold leading-tight line-clamp-2">{p.title}</h4>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="text-gray-800 font-bold">${price}</div>
                                        {regular ? <div className="text-sm text-gray-400 line-through">${regular}</div> : null}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="text-yellow-400 text-sm">{Array.from({ length: 5 }).map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}</div>
                                        {isCurrent && <div className="text-xs text-indigo-600 font-semibold">Viewing</div>}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}