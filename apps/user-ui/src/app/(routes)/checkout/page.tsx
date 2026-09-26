"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCart, getCartCount, clearCart } from '../../../share/utils/cart'
import useUser from 'apps/user-ui/src/hooks/useUser'

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [count, setCount] = useState<number>(0)
  const [processing, setProcessing] = useState(false)

  const [shipping, setShipping] = useState({ name: '', email: '', address: '', city: '', postal: '', country: '' })
  const [payment, setPayment] = useState({ method: 'card', cardNumber: '', expiry: '', cvc: '' })

  useEffect(() => {
    setItems(getCart())
    setCount(getCartCount())
  }, [])

  // require authentication: if not logged in, redirect to login
  const { user, isLoading } = useUser();
  useEffect(() => {
    let redirectTimer: any = undefined
    if (!isLoading && user === null) {
      try { (window as any).toast?.error?.('You must be logged in to purchase items') } catch (e) {}
      // give user a moment to see the toast, then redirect to login
      redirectTimer = setTimeout(() => router.push('/login?next=/checkout'), 800)
    }
    return () => { if (redirectTimer) clearTimeout(redirectTimer) }
  }, [user, isLoading])

  const total = items.reduce((s, it) => s + ((Number(it.price) || 0) * (it.quantity || 0)), 0)

  const onPlaceOrder = async () => {
    if (!shipping.name || !shipping.address || !shipping.email) {
      alert('Please provide shipping name, address and email')
      return
    }

    // basic email validation
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)
    if (!emailValid) {
      alert('Please provide a valid email address')
      return
    }
    setProcessing(true)
    try {
      // try to derive a single shopId from the items (if present) to help backend derive sellerId
      let shopId: string | null = null
      if (items && items.length > 0) {
        // prefer explicit shopId field on cart item, then nested shop object
        const first = items[0] as any
        shopId = first.shopId ?? first.shop ?? first.shop?.id ?? first.shop?._id ?? null
      }
      const payload = { shipping, payment, items, total, shopId }
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      const orderId = data?.orderId || ('ORD-' + Math.random().toString(36).slice(2, 9).toUpperCase())

      if (!res.ok) {
        // API failure
        console.warn('Order API responded with error', data?.error)
        alert(`Order failed: ${data?.error || 'server error'}`)
      } else if (data?.emailSent === false) {
        // Email not sent due to missing SMTP — still proceed but inform user with server-provided message
        const errMsg = data?.error || 'Mail provider not configured'
        alert(`Order placed (id: ${orderId}). Confirmation email could not be sent: ${errMsg}`)
      } else {
        // success
        try { (window as any).toast?.success?.('Order placed — confirmation sent to email') } catch (e) {}
        // in dev, backend may return a preview URL (ethereal) to view the email
        if (data?.emailPreviewUrl) {
          try { (window as any).toast?.success?.('Email preview available (dev)') } catch (e) {}
          console.info('Order confirmation preview URL:', data.emailPreviewUrl)
          // also show a blocking alert so developer sees it immediately
          alert(`Order confirmation preview: ${data.emailPreviewUrl}`)
        }
      }

      // clear cart after creating order
      clearCart()
      router.push(`/order-success?orderId=${orderId}`)
    } catch (err) {
      console.error('Place order failed', err)
      alert('Failed placing order, please try again')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {items.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center">
          <p className="mb-4">Your cart is empty.</p>
          <button onClick={() => router.push('/')} className="inline-block bg-green-600 text-white px-4 py-2 rounded">Continue shopping</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded shadow p-6">
              <h2 className="font-semibold mb-4">Shipping information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={shipping.name} onChange={(e) => setShipping({...shipping, name: e.target.value})} placeholder="Full name" className="p-2 border rounded" />
                <input value={shipping.email} onChange={(e) => setShipping({...shipping, email: e.target.value})} placeholder="Email" className="p-2 border rounded" />
                <input value={shipping.address} onChange={(e) => setShipping({...shipping, address: e.target.value})} placeholder="Address" className="p-2 border rounded sm:col-span-2" />
                <input value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})} placeholder="City" className="p-2 border rounded" />
                <input value={shipping.postal} onChange={(e) => setShipping({...shipping, postal: e.target.value})} placeholder="Postal code" className="p-2 border rounded" />
                <input value={shipping.country} onChange={(e) => setShipping({...shipping, country: e.target.value})} placeholder="Country" className="p-2 border rounded" />
              </div>
            </section>

            <section className="bg-white rounded shadow p-6">
              <h2 className="font-semibold mb-4">Payment</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2"><input type="radio" checked={payment.method==='card'} onChange={() => setPayment({...payment, method: 'card'})} /> Credit / Debit card</label>
                {payment.method === 'card' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                    <input value={payment.cardNumber} onChange={(e) => setPayment({...payment, cardNumber: e.target.value})} placeholder="Card number" className="p-2 border rounded sm:col-span-3" />
                    <input value={payment.expiry} onChange={(e) => setPayment({...payment, expiry: e.target.value})} placeholder="MM/YY" className="p-2 border rounded" />
                    <input value={payment.cvc} onChange={(e) => setPayment({...payment, cvc: e.target.value})} placeholder="CVC" className="p-2 border rounded" />
                  </div>
                )}

                <label className="flex items-center gap-2"><input type="radio" checked={payment.method==='cash'} onChange={() => setPayment({...payment, method: 'cash'})} /> Cash on delivery</label>
              </div>
            </section>

            <section className="bg-white rounded shadow p-6">
              <h2 className="font-semibold mb-4">Items</h2>
              <div className="space-y-4">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center">
                    <img src={it.image || it.img || it.thumbnail || 'https://via.placeholder.com/80'} alt={it.title || it.name} className="w-20 h-16 object-cover rounded mr-4" />
                    <div className="flex-1">
                      <div className="font-semibold">{it.title || it.name}</div>
                      <div className="text-sm text-gray-500">${Number(it.price || 0).toFixed(2)} x {it.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${((Number(it.price)||0) * (it.quantity||0)).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="bg-white rounded shadow p-6">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between mb-2"><span>Shipping</span><span>Calculated at next step</span></div>
            <div className="flex justify-between font-bold text-lg mt-4"><span>Total</span><span>${total.toFixed(2)}</span></div>

            <div className="mt-6">
              <button disabled={processing} onClick={onPlaceOrder} className="w-full bg-green-600 text-white py-2 rounded">{processing ? 'Processing...' : 'Place Order'}</button>
            </div>

            <div className="mt-4 text-center">
              <button onClick={() => router.push('/')} className="text-sm underline text-green-600">Continue shopping</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
