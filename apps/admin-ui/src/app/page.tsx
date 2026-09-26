'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

type Product = {
  id: string
  title: string
  category: string
  status: string
  stock: number
  sale_price: number
  regular_price: number
  isDeleted?: boolean
  shops?: { name?: string }
}
type Seller = {
  id: string
  name?: string | null
  email: string
  phone_number?: string
  createdAt: string
  shop?: { name?: string; category?: string; ratings?: number } | null
}
type Dashboard = {
  metrics: Record<string, number>
  recentProducts: Product[]
  recentOrders: Array<{ id: string; orderId: string; status: string; totalAmount: number; createdAt: string }>
}
type UploadedImage = { fileId: string; file_url: string }
type CategoryData = { categories?: string[]; subCategories?: Record<string, string[]> }

const tokenKey = 'oherbuy-admin-token'
const navItems = ['Overview', 'Orders', 'Payments', 'Create Product', 'Products', 'Sellers', 'Create Event', 'Events', 'Inbox', 'Settings', 'Notifications', 'Discounts Code', 'Home']

async function adminRequest<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/admin/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options?.headers || {}) },
  })
  const body = await response.json().catch(() => ({})) as { message?: string } & T
  if (!response.ok) throw new Error(body.message || 'Admin request failed')
  return body
}

function Metric({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return <div className={`metric ${accent ? 'metric-accent' : ''}`}><span>{label}</span><strong>{value.toLocaleString()}</strong></div>
}

export default function AdminHome() {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [activeView, setActiveView] = useState('Overview')
  const [search, setSearch] = useState('')
  const [sellerSearch, setSellerSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem(tokenKey)
    if (saved) setToken(saved)
  }, [])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError('')
    Promise.all([
      adminRequest<Dashboard>('/dashboard', token),
      adminRequest<{ products: Product[] }>('/products?limit=20', token),
      adminRequest<{ sellers: Seller[] }>('/sellers', token),
    ]).then(([summary, catalog, sellerDirectory]) => {
      setDashboard(summary)
      setProducts(catalog.products)
      setSellers(sellerDirectory.sellers)
    }).catch((requestError: Error) => {
      if (/token|authentication|expired/i.test(requestError.message)) logout()
      setError(requestError.message)
    }).finally(() => setLoading(false))
  }, [token])

  const logout = () => { window.localStorage.removeItem(tokenKey); setToken(null); setDashboard(null) }

  const login = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setLoginError('')
    try {
      const response = await fetch('/admin/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Unable to sign in')
      window.localStorage.setItem(tokenKey, body.token)
      setToken(body.token)
    } catch (requestError) { setLoginError(requestError instanceof Error ? requestError.message : 'Unable to sign in') }
    finally { setLoading(false) }
  }

  const updateStatus = async (product: Product, status: string) => {
    if (!token) return
    try {
      await adminRequest(`/products/${product.id}/status`, token, { method: 'PATCH', body: JSON.stringify({ status }) })
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, status } : item))
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not update product') }
  }

  if (!token) return <main className="login-page"><section className="login-panel fade-in"><div className="brand-mark">O<span>/</span>B</div><p className="eyebrow">OPERATIONS CONSOLE</p><h1 className="display">The calm behind the commerce.</h1><p className="login-copy">Manage the catalog, sellers, and order flow from one focused workspace.</p><form onSubmit={login} className="login-form"><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your admin password" required /></label>{loginError && <p className="error-text">{loginError}</p>}<button className="primary-button" disabled={loading}>{loading ? 'Checking access...' : 'Enter console'} <span>↗</span></button></form></section><aside className="login-aside"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><p className="aside-kicker">Oherbuy / Admin</p><p className="aside-quote display">Make every product count.</p><div className="aside-foot"><span>SECURE WORKSPACE</span><span>v1.0</span></div></aside></main>

  if (activeView === 'Create Product') return <CreateProductPanel token={token} onBack={() => setActiveView('Products')} />

  if (!['Overview', 'Products', 'Sellers', 'Orders'].includes(activeView)) return <main className="app-shell"><aside className="sidebar"><div className="brand-mark">O<span>/</span>B</div><div className="side-label">Workspace</div><button className="nav-item active" onClick={() => setActiveView('Overview')}>← Dashboard</button></aside><section className="workspace"><header className="topbar"><div><p className="eyebrow">ADMIN CONTROL</p><h1 className="display">{activeView}</h1></div><button className="avatar" onClick={logout}>AD</button></header><section className="panel full-panel"><p className="eyebrow">ADMIN ACCESS</p><h2 className="display">{activeView} workspace</h2><p className="empty-state">This administrator workspace is available in the seller navigation model and is ready for expanded admin controls.</p></section></section></main>

  const visibleProducts = products.filter((product) => `${product.title} ${product.category}`.toLowerCase().includes(search.toLowerCase()))
  const visibleSellers = sellers.filter((seller) => `${seller.name || ''} ${seller.email} ${seller.shop?.name || ''} ${seller.shop?.category || ''}`.toLowerCase().includes(sellerSearch.toLowerCase()))
  const metrics = dashboard?.metrics || {}

  return <main className="app-shell"><aside className="sidebar"><div className="brand-mark">O<span>/</span>B</div><div className="side-label">Workspace</div><nav>{navItems.map((item, index) => <button key={item} className={activeView === item ? 'nav-item active' : 'nav-item'} onClick={() => setActiveView(item)}><span className="nav-icon">{['⌂', '◈', '◎', '↗'][index]}</span>{item}{item === 'Products' && metrics.pendingProducts > 0 && <b>{metrics.pendingProducts}</b>}</button>)}</nav><div className="sidebar-bottom"><div className="status-dot" />Systems operational<button className="logout-button" onClick={logout}>Sign out</button></div></aside><section className="workspace"><header className="topbar"><div><p className="eyebrow">SATURDAY, 05 SEPTEMBER 2026</p><h1 className="display">{activeView === 'Overview' ? 'Good morning, admin.' : activeView}</h1></div><div className="top-actions"><span className="live-pill"><i /> Live</span><button className="avatar" onClick={logout}>AD</button></div></header>{error && <div className="notice error-text">{error}</div>}{activeView === 'Overview' && <><div className="metrics-grid"><Metric label="Total products" value={metrics.products || 0} /><Metric label="Active catalog" value={metrics.activeProducts || 0} accent /><Metric label="Needs review" value={metrics.pendingProducts || 0} /><Metric label="Orders placed" value={metrics.orders || 0} /></div><div className="content-grid"><section className="panel wide-panel"><div className="panel-heading"><div><p className="eyebrow">CATALOG PULSE</p><h2 className="display">Recent products</h2></div><button className="text-button" onClick={() => setActiveView('Products')}>View all ↗</button></div><ProductTable products={products.slice(0, 6)} onStatus={updateStatus} /></section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">ORDER FLOW</p><h2 className="display">Latest orders</h2></div></div><div className="order-list">{dashboard?.recentOrders?.slice(0, 5).map((order) => <div className="order-row" key={order.id}><span>#{order.orderId || order.id.slice(-6)}</span><strong>${order.totalAmount.toFixed(2)}</strong><small>{order.status}</small></div>)}</div></section></div></>}{activeView === 'Products' && <section className="panel full-panel"><div className="panel-heading"><div><p className="eyebrow">CATALOG CONTROL</p><h2 className="display">Product moderation</h2></div><input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." /></div><ProductTable products={visibleProducts} onStatus={updateStatus} /></section>}{activeView === 'Sellers' && <section className="panel full-panel"><div className="panel-heading"><div><p className="eyebrow">PARTNER NETWORK</p><h2 className="display">Seller directory</h2></div><input className="search-input" value={sellerSearch} onChange={(event) => setSellerSearch(event.target.value)} placeholder="Search sellers or shops..." /></div><SellerTable sellers={visibleSellers} /></section>}{activeView === 'Orders' && <section className="panel full-panel"><div className="panel-heading"><div><p className="eyebrow">FULFILMENT</p><h2 className="display">Order overview</h2></div></div><p className="empty-state">Order data is available through <code>GET /admin/api/orders</code>. The dashboard is connected and ready for detailed order actions.</p></section>}{loading && <div className="loading-bar" />}</section></main>
}

function ProductTable({ products, onStatus }: { products: Product[]; onStatus: (product: Product, status: string) => void }) {
  if (!products.length) return <p className="empty-state">No products match this view.</p>
  return <div className="table-wrap"><table><thead><tr><th>Product</th><th>Shop</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><strong>{product.title}</strong><small>{product.category}</small></td><td>{product.shops?.name || 'Unassigned'}</td><td>${product.sale_price.toFixed(2)}</td><td>{product.stock}</td><td><span className={`status status-${product.status.toLowerCase()}`}>{product.status}</span></td><td><select value={product.status} onChange={(event) => onStatus(product, event.target.value)} aria-label={`Change ${product.title} status`}><option>Active</option><option>Pending</option><option>Draft</option></select></td></tr>)}</tbody></table></div>
}

function SellerTable({ sellers, onDelete }: { sellers: Seller[]; onDelete?: (seller: Seller) => void }) {
  if (!sellers.length) return <p className="empty-state">No sellers match this view.</p>
  return <div className="table-wrap"><table><thead><tr><th>Seller</th><th>Shop</th><th>Category</th><th>Rating</th><th>Joined</th><th>Contact</th>{onDelete && <th />}</tr></thead><tbody>{sellers.map((seller) => <tr key={seller.id}><td><strong>{seller.name || 'Unnamed seller'}</strong><small>{seller.email}</small></td><td>{seller.shop?.name || 'No shop'}</td><td>{seller.shop?.category || 'Uncategorized'}</td><td><span className="rating">★ {seller.shop?.ratings?.toFixed(1) || '—'}</span></td><td>{new Date(seller.createdAt).toLocaleDateString()}</td><td>{seller.phone_number || 'No phone'}</td>{onDelete && <td><button className="danger-button" onClick={() => onDelete(seller)}>Delete</button></td>}</tr>)}</tbody></table></div>
}

function CreateProductPanel({ token, onBack }: { token: string; onBack: () => void }) {
  const [form, setForm] = useState({
    title: '', short_description: '', detailed_description: '', slug: '', tags: '', brand: '', category: '',
    subCategory: '', stock: '', sale_price: '', regular_price: '', status: 'Active',
  })
  const [images, setImages] = useState<UploadedImage[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData>({ categories: [], subCategories: {} })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/product/api/get-categories')
      .then((response) => response.json())
      .then((data: CategoryData) => setCategoryData(data))
      .catch(() => setError('Unable to load product categories'))
  }, [])

  const update = (field: string, value: string) => setForm((current) => ({
    ...current,
    [field]: value,
    ...(field === 'category' ? { subCategory: '' } : {}),
  }))
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/admin/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          images,
        }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.message || 'Unable to create product')
      onBack()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create product')
    } finally {
      setSaving(false)
    }
  }

  const convertFileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const uploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const response = await fetch('/admin/api/products/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fileName: await convertFileToBase64(file) }),
        })
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(body.message || `Could not upload ${file.name}`)
        return body as UploadedImage
      }))
      setImages((current) => [...current, ...uploaded].slice(0, 8))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to upload image')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const field = (label: string, name: keyof typeof form, required = true) => <label className="admin-field">{label}<input value={form[name]} onChange={(event) => update(name, event.target.value)} required={required} /></label>
  const categories = categoryData.categories || []
  const subcategories = categoryData.subCategories?.[form.category] || []

  return <main className="app-shell"><aside className="sidebar"><div className="brand-mark">O<span>/</span>B</div><div className="side-label">Workspace</div><button className="nav-item" onClick={onBack}>← Products</button></aside><section className="workspace"><header className="topbar"><div><p className="eyebrow">CATALOG CONTROL</p><h1 className="display">Create product</h1></div></header><form className="panel product-form" onSubmit={submit}><div className="panel-heading"><div><p className="eyebrow">ADMIN PRODUCT ENTRY</p><h2 className="display">Add to the gallery</h2></div></div><div className="form-grid">{field('Title', 'title')}{field('Slug', 'slug')}{field('Brand', 'brand')}<label className="admin-field">Category<select value={form.category} onChange={(event) => update('category', event.target.value)} required><option value="">Select category</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="admin-field">Subcategory<select value={form.subCategory} onChange={(event) => update('subCategory', event.target.value)} required disabled={!form.category}><option value="">{form.category ? 'Select subcategory' : 'Select category first'}</option>{subcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}</select></label>{field('Tags (comma separated)', 'tags')} {field('Stock', 'stock')}{field('Sale price', 'sale_price')}{field('Regular price', 'regular_price')}</div><label className="admin-field">Short description<textarea value={form.short_description} onChange={(event) => update('short_description', event.target.value)} required /></label><label className="admin-field">Detailed description<textarea value={form.detailed_description} onChange={(event) => update('detailed_description', event.target.value)} /></label><div className="admin-field"><span>Product gallery</span><input type="file" accept="image/*" multiple onChange={uploadImages} disabled={uploading || images.length >= 8} /><small>{uploading ? 'Uploading images...' : `${images.length}/8 images uploaded`}</small><div className="image-preview-grid">{images.map((image) => <div className="image-preview" key={image.fileId}><img src={image.file_url} alt="Product preview" /><button type="button" onClick={() => setImages((current) => current.filter((item) => item.fileId !== image.fileId))} aria-label="Remove image">×</button></div>)}</div></div>{error && <p className="error-text">{error}</p>}<div className="form-actions"><button type="button" className="text-button" onClick={onBack}>Cancel</button><button className="primary-button" disabled={saving || uploading || images.length === 0}>{saving ? 'Creating...' : 'Create product'} <span>↗</span></button></div></form></section></main>
}

