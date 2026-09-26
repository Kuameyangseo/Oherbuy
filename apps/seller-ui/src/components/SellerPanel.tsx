'use client';

import React from 'react';
import useSeller from '../hooks/useSeller';
import useSellerProducts from '../hooks/useSellerProducts';
import ProductCard from './ProductCard';

const SellerPanel: React.FC = () => {
  const { seller, isLoading: sellerLoading } = useSeller();
  const shopId = seller?.shop?.id ?? seller?.shopId ?? null;
  const { products, isLoading: productsLoading } = useSellerProducts(shopId);

  if (sellerLoading) return <div className="p-4">Loading seller...</div>;

  return (
    <section className="bg-transparent mt-8">
      <div className="bg-white/90 p-6 rounded shadow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{seller?.name ?? 'Seller'}</h3>
            <div className="text-sm text-gray-600">{seller?.shop?.name ?? 'No shop yet'}</div>
            {seller?.shop?.address && <div className="text-xs text-gray-500">{seller.shop.address}</div>}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Products</div>
            <div className="text-2xl font-bold text-indigo-600">{products?.length ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-semibold mb-3">Your products</h4>

        {productsLoading ? (
          <div className="p-4">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No products found for your shop.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p: any) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  title: p.title,
                  price: p.sale_price ?? p.regular_price ?? 0,
                  stock: p.stock ?? 0,
                  image: p.images?.[0]?.url ?? '/images/placeholder.svg',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SellerPanel;
