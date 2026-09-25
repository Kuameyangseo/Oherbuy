"use client";

import React, { useEffect, useState } from "react";

type Order = {
  id: string;
  total?: number;
  status?: string;
  createdAt?: string;
  customerName?: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const ORDERS_ENDPOINT = API_BASE ? `${API_BASE}/orders` : "/orders";
      const res = await fetch(ORDERS_ENDPOINT, {
        cache: "no-store",
        headers: { Accept: "application/json" },
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
          // Defensive: if backend returned HTML (e.g. Next.js index or error page), show guidance
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

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
        </div>

        <section>
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-lg shadow animate-pulse h-32" />
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
            <div className="p-4 bg-red-50 text-red-800 rounded-md">Error: {error}</div>
          )}

          {!loading && !error && !notFound && (orders && orders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((o) => (
                <article key={o.id} className="p-4 bg-white rounded-lg shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{o.id}</h3>
                      <p className="text-sm text-gray-500">{o.customerName ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{o.status ?? "—"}</div>
                      <div className="font-semibold">${(o.total ?? 0).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400" suppressHydrationWarning>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</div>
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
