"use client"
import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function OrderSuccess() {
  const params = useSearchParams()
  const router = useRouter()
  const orderId = params?.get('orderId') || ''

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Thank you for your order!</h1>
      <p className="mb-6">Your order <strong>{orderId}</strong> has been received. We'll send updates to your email.</p>
      <div className="flex justify-center gap-4">
        <button onClick={() => router.push('/')} className="bg-green-600 text-white px-4 py-2 rounded">Continue shopping</button>
        <button onClick={() => router.push('/orders')} className="bg-white border px-4 py-2 rounded">View orders</button>
      </div>
    </div>
  )
}
