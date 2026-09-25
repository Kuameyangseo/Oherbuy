import React from 'react'
import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'

const prisma = (global as any).prisma || new PrismaClient()
if (!(global as any).prisma) (global as any).prisma = prisma

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  try {
    const shop = await prisma.shops.findUnique({ where: { id } , select: { id: true, name: true, bio: true } })
    if (!shop) return { title: 'Shop not found' }
    return { title: `${shop.name} - Oherbuy`, description: shop.bio || '' }
  } catch (e) {
    return { title: 'Shop - Oherbuy' }
  }
}

export default async function ShopDetailPage({ params }: Props) {
  const { id } = await params

  let shop: any = null
  let avatarUrl: string | null = null
  try {
    shop = await prisma.shops.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true, title: true, slug: true, sale_price: true, regular_price: true, images: true }
        }
      }
    })
    if (shop) {
      const avatar = await prisma.images.findFirst({
        where: { shopId: id },
        orderBy: { id: 'desc' },
        select: { url: true },
      })
      avatarUrl = avatar?.url || (typeof shop.avatarId === 'string' && shop.avatarId.startsWith('http') ? shop.avatarId : null)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('shop detail db error', err)
  }

  if (!shop) return notFound()

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero / Cover */}
      <div className="relative mb-8">
        <div className="h-64 sm:h-80 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
          {shop.coverBanner ? (
            <img src={shop.coverBanner} className="w-full h-full object-cover" alt={shop.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No cover image</div>
          )}
        </div>

        {/* Avatar + basic info card overlapping the hero */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl">
          <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 mx-4">
            <div className="-mt-12 sm:-mt-16 flex-shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500">{(shop.name || 'S').charAt(0)}</div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold">{shop.name}</h1>
              <p className="mt-1 text-gray-600">{shop.bio}</p>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:gap-4 justify-center sm:justify-start">
                <button className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md shadow">Follow</button>
                <a href={`mailto:${shop.email || ''}`} className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-md hover:shadow">Contact</a>
                <div className="text-sm text-gray-500 mt-2 sm:mt-0">Address: {shop.address || '—'}</div>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-2">
              <div className="text-sm text-gray-500">{(shop.products || []).length} products</div>
              <div className="text-sm text-gray-500">Rating: ★★★★☆</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            {shop.products && shop.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {shop.products.map((p: any) => (
                  <article key={p.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition transform hover:-translate-y-1">
                    <a href={`/product/${p.slug || p.id}`} className="block">
                      <div className="h-44 w-full bg-gray-200 overflow-hidden">
                        {p.images && p.images.length ? (
                          <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium truncate">{p.title}</h3>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm text-gray-600">${p.sale_price ?? p.regular_price ?? '—'}</div>
                          <div className="text-xs text-green-700 font-semibold">{p.sale_price ? 'On Sale' : 'Price'}</div>
                        </div>
                      </div>
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No products found for this shop.</div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-2">About this shop</h3>
            <p className="text-sm text-gray-600">{shop.bio}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Contact & Info</h3>
            <div className="text-sm text-gray-600">Address: {shop.address || '—'}</div>
            <div className="text-sm text-gray-600">Email: {shop.email || '—'}</div>
            <div className="text-sm text-gray-600">Website: {shop.website || '—'}</div>
          </div>
        </aside>
      </div>
    </main>
  )
}
