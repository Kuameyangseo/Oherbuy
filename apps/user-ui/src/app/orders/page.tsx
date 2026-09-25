"use client";

import React, { useEffect, useState } from "react";

type Order = {
  id: string;
  total?: number;
  status?: string;
  createdAt?: string;
  customerName?: string;
  items?: Array<{ title?: string; quantity?: number; price?: number }>; 
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // const [devToken, setDevToken] = useState<string | null>(null);
  // const [cookiePresent, setCookiePresent] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      // If a dedicated API host is configured use it. Otherwise call the Next.js API
      // proxy at `/api/orders` so the request returns JSON instead of the page HTML.
      const ORDERS_ENDPOINT = API_BASE ? `${API_BASE}/orders` : "/api/orders";
      // allow a developer override token stored in localStorage under `DEV_AUTH_TOKEN`
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('DEV_AUTH_TOKEN') : null;
      const headers: any = { Accept: 'application/json' };
      if (stored) headers['Authorization'] = `Bearer ${stored}`;

      const res = await fetch(ORDERS_ENDPOINT, {
        cache: 'no-store',
        headers,
        credentials: 'include', // include cookies so auth middleware on backend can read session tokens
      });
      if (res.status === 404) {
        setNotFound(true);
        setOrders(null);
      } else if (!res.ok) {
        const text = await res.text().catch(() => res.statusText || "Unknown error");
        setError(`${res.status} ${text}`);
      } else {
        const contentType = (res.headers.get("content-type") || "").toLowerCase();
        if (!contentType.includes("application/json")) {
          const text = await res.text().catch(() => "");
          const snippet = text ? text.slice(0, 512) : "(empty response)";
          setError(
            `Expected JSON response but received HTML. This often means the request was routed to the frontend (Next.js) instead of the backend.\n` +
              `Set environment variable NEXT_PUBLIC_API_URL to your API host (e.g. 'http://localhost:4000') or configure a proxy/rewrites so '/orders' routes to the backend. Response snippet: ${snippet}`
          );
          console.debug("Non-JSON /orders response headers:", Object.fromEntries(res.headers.entries()));
        } else {
          try {
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
          } catch (parseErr: any) {
            const text = await res.text().catch(() => "");
            const snippet = text ? text.slice(0, 512) : String(parseErr?.message ?? parseErr);
            setError(`Failed to parse JSON response: ${snippet}`);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // useEffect(() => {
  //   // read dev token and cookie presence for debugging
  //   try {
  //     const stored = typeof window !== 'undefined' ? window.localStorage.getItem('DEV_AUTH_TOKEN') : null;
  //     setDevToken(stored);
  //     setCookiePresent(typeof document !== 'undefined' && (document.cookie || '').indexOf('access-token=') !== -1 || (document.cookie || '').indexOf('seller-access-token=') !== -1);
  //   } catch (e) {
  //     // ignore
  //   }
  //   load();
  // }, []);
  // function formatDate(d?: string) {
  //   if (!d) return "—";
  //   try {
  //     return new Date(d).toLocaleString();
  //   } catch {
  //     return d;
  //   }
  // }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('copy failed', e);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Dev auth debug area */}
        {/* <div className="mb-4">
          {!cookiePresent && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 mb-2">
              No auth cookie detected. Login to set `access-token` cookie, or paste a token below for dev testing.
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={devToken ?? ''}
              onChange={(e) => setDevToken(e.target.value)}
              className="border px-2 py-1 rounded w-72 text-sm"
              placeholder="Paste dev JWT here (optional)"
            />
            <button
              onClick={() => {
                if (devToken) {
                  localStorage.setItem('DEV_AUTH_TOKEN', devToken);
                } else {
                  localStorage.removeItem('DEV_AUTH_TOKEN');
                }
                window.location.reload();
              }}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
            >
              Save Token
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('DEV_AUTH_TOKEN');
                setDevToken(null);
                window.location.reload();
              }}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              Clear
            </button>
          </div>
        </div> */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">Recent orders and status — updated on refresh.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              aria-label="Refresh orders"
            >
              {refreshing ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 24 12 12 0 01-12-12z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M21 10v6a2 2 0 01-2 2H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6v6a2 2 0 002 2h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        <section>
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/5 mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-2/5 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-full mt-4 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {!loading && notFound && (
            <div className="p-6 bg-white rounded-md shadow border border-dashed border-gray-200">
              <h2 className="text-xl font-medium">No orders route found (404)</h2>
              <p className="text-sm text-gray-600 mt-2">The server returned 404 for <code className="bg-gray-100 px-1 rounded">GET /orders</code>.</p>
              <p className="text-sm text-gray-600 mt-2">If this is unexpected, ensure your API gateway or backend exposes <code className="bg-gray-100 px-1 rounded">/orders</code>.</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">Error</div>
                  <pre className="whitespace-pre-wrap text-sm mt-2">{error}</pre>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => copyToClipboard(error)}
                    className="px-3 py-1 bg-white border rounded text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && !notFound && (orders && orders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {orders.map((o) => (
                <article key={o.id} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{o.id}</h3>
                      <p className="text-sm text-gray-500">{o.customerName ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={o.status} />
                      <div className="font-semibold mt-2">${(o.total ?? 0).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">{(o.createdAt)}</div>
                  {/* Show a simple summary of items ordered (first 2) */}
                  <div className="mt-3 text-sm text-gray-600">
                    {(() => {
                      const list: any[] = (o as any).items || (o as any).products || [];
                      if (!Array.isArray(list) || list.length === 0) return <div className="text-xs text-gray-400">No items</div>;
                      const preview = list.slice(0, 2).map((it: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="font-medium">{it.title || it.name || it.productName || 'Item'}</div>
                          <div className="text-xs text-gray-500">x{it.quantity ?? it.qty ?? 1}</div>
                        </div>
                      ));
                      return (
                        <div>
                          {preview}
                          {list.length > 2 && <div className="text-xs text-gray-500 mt-1">and {list.length - 2} more item(s)</div>}
                        </div>
                      );
                    })()}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-md shadow">
              <h2 className="text-lg font-medium">No orders yet</h2>
              <p className="text-sm text-gray-600 mt-2">There are no orders to show right now.</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status || "").toLowerCase();
  const color = s.includes('pending') ? 'bg-yellow-100 text-yellow-800' : s.includes('cancel') ? 'bg-red-100 text-red-800' : s.includes('deliv') || s.includes('shipped') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700';
  return (
    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${color}`}>
      {status || 'Unknown'}
    </div>
  );
}
