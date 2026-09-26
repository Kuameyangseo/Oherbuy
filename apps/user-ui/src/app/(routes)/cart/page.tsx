"use client"
import React, { useEffect, useState } from 'react'
import { getCart, getCartCount, removeFromCart, clearCart, updateQuantity, onCartChange } from '../../../share/utils/cart'
import { useRouter } from 'next/navigation'
import useUser from 'apps/user-ui/src/hooks/useUser'

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [count, setCount] = useState<number>(0)
  const { user, isLoading } = useUser();

  const load = () => {
    try {
      setItems(getCart())
      setCount(getCartCount())
    } catch (e) {
      setItems([])
      setCount(0)
    }
  }

  useEffect(() => {
    load()
    const off = onCartChange((c) => { setCount(c); setItems(getCart()) })
    // also listen for initialized event
    const init = (e: Event) => { const d = (e as CustomEvent).detail; setCount(d?.count ?? getCartCount()); setItems(getCart()) }
    window.addEventListener('oherbuy_cart_initialized', init as EventListener)
    return () => { off(); window.removeEventListener('oherbuy_cart_initialized', init as EventListener) }
  }, [])

  const total = items.reduce((s, it) => s + ((Number(it.price) || 0) * (it.quantity || 0)), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">{count} item{count === 1 ? '' : 's'}</div>
          <button onClick={() => router.push('/')} className="text-sm bg-transparent underline text-green-600 hover:text-green-800 px-2 py-1 rounded">Continue shopping</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center">
          <p className="mb-4">Your cart is empty.</p>
          <button onClick={() => router.push('/')} className="inline-block bg-green-600 text-white px-4 py-2 rounded">Continue shopping</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.id} className="flex items-center bg-white rounded shadow p-4">
                  <img src={it.image || it.img || it.thumbnail || 'https://via.placeholder.com/120'} alt={it.title || it.name} className="w-28 h-24 object-cover rounded mr-4" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{it.title || it.name}</h3>
                    <div className="text-sm text-gray-500">${Number(it.price || 0).toFixed(2)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(it.id, (it.quantity || 1) - 1)}
                        className="px-2 py-1 border rounded"
                        aria-label="decrease"
                      >-</button>
                      <div className="px-3 py-1 border rounded">{it.quantity}</div>
                      <button
                        onClick={() => updateQuantity(it.id, (it.quantity || 1) + 1)}
                        className="px-2 py-1 border rounded"
                        aria-label="increase"
                      >+</button>
                      <button
                        onClick={() => { removeFromCart(it.id); load(); }}
                        className="ml-4 text-sm text-red-600"
                      >Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button onClick={() => { clearCart(); load(); }} className="px-4 py-2 border rounded">Clear cart</button>
            </div>
          </div>

          <aside className="bg-white rounded shadow p-6">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between mb-2"><span>Shipping</span><span>--</span></div>
            <div className="flex justify-between font-bold text-lg mt-4"><span>Total</span><span>${total.toFixed(2)}</span></div>

            <div className="mt-6">
              <button onClick={() => {
                if (!isLoading && user === null) {
                  try { (window as any).toast?.error?.('You must be logged in to purchase items') } catch (e) {}
                  setTimeout(() => router.push('/login?next=/checkout'), 800)
                  return
                }
                router.push('/checkout')
              }} className="w-full bg-green-600 text-white py-2 rounded">Proceed to Checkout</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
