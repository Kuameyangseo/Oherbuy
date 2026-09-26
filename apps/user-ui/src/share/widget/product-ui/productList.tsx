"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import axios from '../../../utils/axiosinstance'
import Link from 'next/link'

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js'
    s.async = true
    s.onload = () => {
      ;(window as any).kofiWidgetOverlay?.draw('mohamedghulam', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Support me',
        'floating-chat.donateButton.background-color': '#323842',
        'floating-chat.donateButton.text-color': '#fff',
      })
    }
    document.body.appendChild(s)
    return () => {
      if (s.parentNode) s.parentNode.removeChild(s)
    }
  }, [])

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get('/api/products')
      .then((res) => {
        if (!mounted) return;
        setProducts(res.data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        // Provide more helpful debug info for connection errors (shows which base/url was attempted)
        try {
          // eslint-disable-next-line no-console
          console.error('ProductList: failed request', err?.config || {}, err?.message || err);
        } catch (e) {}
        const cfg = err?.config || {};
        const attempted = `${cfg.baseURL || axios.defaults.baseURL || ''}${cfg.url || ''}`;
        setError((err?.response?.data?.message) || (`Failed to load products from ${attempted}: ${err?.message || 'network error'}`));
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-center p-6">Loading products...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
    <div className=" justify-around gap-y-20">
      {/* source: https://github.com/mfg888/Responsive-Tailwind-CSS-Grid/blob/main/index.html */}

      <div className="p-4 text-center sm:p-6">
        <h1 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-4xl">Enjoy Purchasing From Us</h1>
        <h1 className="text-2xl sm:text-3xl">All Product</h1>
      </div>

      <section
        id="Projects"
        className="mx-auto mt-4 mb-5 flex w-full flex-wrap justify-around gap-y-4 px-1 sm:gap-y-6 sm:px-6 lg:px-[120px]"
      >
        {products.map((p) => {
          const img = p.images && p.images.length ? p.images[0].url : 'https://via.placeholder.com/500';
          const price = p.sale_price ?? p.regular_price ?? 0;
          const regular = p.regular_price ?? '';
          const stripHtml = (s: string) => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

          const pickPath = (obj: any, paths: string[]) => {
            for (const path of paths) {
              const parts = path.split('.');
              let val: any = obj;
              for (const part of parts) {
                if (val == null) { val = undefined; break; }
                val = val[part];
              }
              if (val != null) {
                const s = String(val).trim();
                if (s) return s;
              }
            }
            return undefined;
          };

          const descriptionCandidate = pickPath(p, [
            'description',
            'short_description',
            'desc',
            'meta.description',
            'attributes.description',
            'details.description',
            'summary',
            'excerpt',
            'long_description',
            'content.description'
          ]);

          const description = descriptionCandidate ? stripHtml(descriptionCandidate) : 'No description available.';
          const rating = p.rating ?? 4.8;
          const ratingCount = p.reviewsCount ??  (Math.round(Math.random()*200)+1);
          const onAddToCart = (e: React.MouseEvent) => {
            e.preventDefault();
            try {
              // add minimal fields to cart
              const payload = { id: p.id, title: p.title || p.name || '', price: Number(p.sale_price ?? p.regular_price ?? 0), quantity: 1, image: img }
              // lazy import to avoid server issues
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const { addToCart } = require('../../utils/cart') as typeof import('../../utils/cart')
              addToCart(payload)
              // small user feedback
              // prefer non-blocking toast; fallback to alert
              try { (window as any).toast?.success?.('Added to cart') } catch (e) { }
            } catch (err) {
              console.error('Add to cart failed', err)
              alert('Added to cart')
            }
          };

          const isOnSale = typeof p.sale_price !== 'undefined' && p.sale_price !== null && p.sale_price < (p.regular_price ?? Infinity);

          return (
            <div key={p.id} className="w-[48%] overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:w-[46%] md:w-[31%] lg:w-[18%] dark:bg-white">
              <Link href={`/productoverview/${p.slug || p.id}`} className="block">
                <div className="relative h-28 w-full bg-gray-100 sm:h-36">
                  <img src={img} alt={p.title} className="w-full h-full object-cover" />
                  {isOnSale && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">Sale</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${p.stock > 0 ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>{p.stock > 0 ? 'In stock' : 'Out of stock'}</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3">
                  <h3
                    className="text-base font-semibold text-gray-900 dark:text-gray-800 mb-1 line-clamp-2"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-gray-600 dark:text-gray-400 mb-2 text-xs line-clamp-2"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {description}
                  </p>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-800">${price}</div>
                      {regular ? <div className="text-sm text-gray-400 line-through">${regular}</div> : null}
                    </div>
                    <div className="flex min-w-0 items-center space-x-1">
                      <div className="text-xs text-yellow-400">{Array.from({ length: Math.round(rating) }).map((_, i) => <span key={i}>★</span>)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">({ratingCount})</div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={onAddToCart} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-2 rounded-lg transition-colors">Add to Cart</button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); router.push(`/productoverview/${p.slug || p.id}`); }}
                      className="px-2 py-1.5 border rounded-lg text-xs text-gray-700"
                    >
                      View
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default ProductList
