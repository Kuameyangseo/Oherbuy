"use client"
import React, { useEffect, useState } from 'react'
import axios from '../../../utils/axiosinstance'
import Link from 'next/link'

const LatestProducts: React.FC<{ currentId?: string }> = ({ currentId }) => {
    const [products, setProducts] = useState<any[]>([])
    const [isFetching, setIsFetching] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        if (typeof setIsFetching === 'function') setIsFetching(true);
        (async () => {
            try {
                const res = await axios.get('/api/products')
                if (!mounted) return
                let list = res.data.products || []
                // sort by createdAt desc if available
                list.sort((a: any, b: any) => {
                    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
                    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
                    return tb - ta
                })

                // ensure the current product is included and appears near the front
                if (currentId && !list.find((x: any) => String(x.id) === String(currentId))) {
                    try {
                        const single = await axios.get(`/api/products/${currentId}`)
                        const item = single.data.product || single.data || null
                        if (item) {
                            // place current product at the front
                            list = [item, ...list]
                        }
                    } catch (e) {
                        // ignore fetch failure for single product
                    }
                }

                setProducts(list.slice(0, 12))
            } catch (err: any) {
                if (!mounted) return
                setError(err?.response?.data?.message || err.message || 'Failed to load latest products')
            } finally {
                if (mounted && typeof setIsFetching === 'function') setIsFetching(false);
            }
        })()
        return () => {
            mounted = false
        }
    }, [currentId])

    if (isFetching) {
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

export default LatestProducts
