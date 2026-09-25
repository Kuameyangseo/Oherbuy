type CartItem = {
  id: string
  title?: string
  price?: number
  quantity: number
  [key: string]: any
}

const STORAGE_KEY = 'oherbuy_cart'

const read = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to read cart', e)
    return []
  }
}

const write = (items: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    const count = items.reduce((s, it) => s + (it.quantity || 0), 0)
    try { window.dispatchEvent(new CustomEvent('oherbuy_cart_updated', { detail: { count } })) } catch (e) {}
  } catch (e) {
    console.error('Failed to write cart', e)
  }
}

export const getCart = (): CartItem[] => read()

export const getCartCount = (): number => {
  return read().reduce((s, it) => s + (it.quantity || 0), 0)
}

export const addToCart = (item: { id: string; title?: string; price?: number; quantity?: number; [k:string]: any }) => {
  const prevCount = getCartCount()
  const items = read()
  const q = item.quantity ?? 1
  const existing = items.find(i => String(i.id) === String(item.id))
  if (existing) {
    existing.quantity = (existing.quantity || 0) + q
  } else {
    // try to pick an image from common fields if not provided
    const image = item.image ?? item.img ?? (item.images && item.images[0] && item.images[0].url) ?? item.thumbnail ?? null
    items.push({ ...item, id: String(item.id), title: item.title, price: item.price, quantity: q, image })
  }
  write(items)
  const newCount = getCartCount()
  // redirect to cart page when first item is added
  try {
    if (prevCount === 0 && newCount > 0 && typeof window !== 'undefined') {
      window.location.href = '/cart'
    }
  } catch (e) {
    // ignore
  }
}

export const removeFromCart = (id: string) => {
  const items = read().filter(i => String(i.id) !== String(id))
  write(items)
}

export const clearCart = () => write([])

export const updateQuantity = (id: string, quantity: number) => {
  const items = read()
  const idx = items.findIndex(i => String(i.id) === String(id))
  if (idx === -1) return
  if (quantity <= 0) {
    items.splice(idx, 1)
  } else {
    items[idx].quantity = quantity
  }
  write(items)
}

export const onCartChange = (cb: (count: number) => void) => {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent)?.detail
    const count = detail?.count ?? getCartCount()
    cb(count)
  }
  window.addEventListener('oherbuy_cart_updated', handler as EventListener)
  return () => window.removeEventListener('oherbuy_cart_updated', handler as EventListener)
}

// initialize dispatch once so existing listeners get initial state after mount
if (typeof window !== 'undefined') {
  try { window.dispatchEvent(new CustomEvent('oherbuy_cart_initialized', { detail: { count: getCartCount() } })) } catch (e) {}
}
