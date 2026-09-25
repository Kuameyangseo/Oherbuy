"use client";

import React from "react";
import useSeller from '../../../hooks/useSeller';
import useSellerProducts from '../../../hooks/useSellerProducts';
import ProductCard from '../../../components/ProductCard';
import Stats from '../../../components/Stats';
import axiosInstance from '../../../utils/axiosinstance';

const sampleOrders = [
  { id: '#15847', customer: 'John Doe', email: 'john@example.com', product: 'iPhone 15 Pro', amount: '$1,299.00', status: 'Completed', date: 'May 22, 2025' },
  { id: '#15846', customer: 'Sarah Wilson', email: 'sarah@example.com', product: 'MacBook Pro', amount: '$2,499.00', status: 'Pending', date: 'May 21, 2025' },
  { id: '#15845', customer: 'Mike Johnson', email: 'mike@example.com', product: 'AirPods Pro', amount: '$249.00', status: 'Cancelled', date: 'May 20, 2025' },
];

export default function DashboardPage(): React.ReactElement {
  const { seller, isLoading: sellerLoading } = useSeller();
  const shopId = seller?.shop?.id ?? seller?.shopId ?? null;
  const { products, isLoading: productsLoading } = useSellerProducts(shopId);

  const totalProducts = products?.length ?? 0;
  const totalOrders = sampleOrders.length; // placeholder
  const totalUsers = 15847; // placeholder
  const totalRevenue = 48291; // placeholder

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative">
        {/* Floating seller preview (bottom-left) */}
        <div className="fixed bottom-6 left-6 z-50">
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <img src={seller?.shop?.avatarId ? seller.shop.avatarId : 'https://cdn-icons-png.flaticon.com/512/17003/17003310.png'} alt="Seller" className="w-10 h-10 rounded-full" />
              <div>
                <p className="text-white text-sm font-medium">{seller?.name ?? 'Seller'}</p>
                <p className="text-gray-400 text-xs">{seller?.shop?.name ? 'Store Owner' : 'Administrator'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-0 md:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600 text-sm mt-1">Welcome back, here's what's happening today</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none" />
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
                </div>
                <div className="relative">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118.6 14.6V11a6 6 0 10-12 0v3c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 text-sm font-medium flex items-center">▲ 12%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2z"/></svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 text-sm font-medium flex items-center">▲ 8%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-3M9 20H4v-2a4 4 0 014-4h1"/></svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalOrders}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 text-sm font-medium flex items-center">▲ 15%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3-8H5.4"/></svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 text-sm font-medium flex items-center">▲ 5%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
                  <p className="text-gray-600 text-sm">Monthly revenue overview</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md">6M</button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md">1Y</button>
                </div>
              </div>
              <div className="h-80 flex items-center justify-center text-gray-400">[Revenue chart placeholder]</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {(productsLoading ? [{id:'p1', title:'Loading...', price:0, stock:0}] : products.slice(0,4)).map((p:any, idx:number) => (
                  <div key={p.id ?? idx} className="flex items-center space-x-4">
                    <img src={p.images?.[0]?.url ?? '/images/placeholder.svg'} alt={p.title ?? 'Product'} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{p.title ?? p.name ?? '—'}</p>
                      <p className="text-sm text-gray-600">{p.category ?? ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${(p.sale_price ?? p.regular_price ?? 0).toFixed(2)}</p>
                      <p className="text-sm text-green-600">+12%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <p className="text-gray-600 text-sm">Latest customer orders and transactions</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Export</button>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Add Order</button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900">{o.id}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src="https://www.investopedia.com/thmb/NSwuyMYGVWCHVIi1AEoaPkdmMD0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Brand-loyalty_final-8ad57b86183e42348e18bc306c87778e.png" alt="Customer" className="w-8 h-8 rounded-full mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{o.customer}</div>
                            <div className="text-sm text-gray-500">{o.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{o.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${o.status === 'Completed' ? 'bg-green-100 text-green-800' : o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-800">View</button>
                          <button className="text-gray-600 hover:text-gray-900">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-500">sarah.johnson@email.com • 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Order completed</p>
                    <p className="text-xs text-gray-500">Order #15847 - $299.99 • 5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Product updated</p>
                    <p className="text-xs text-gray-500">iPhone 15 Pro - Stock: 25 • 8 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Payment received</p>
                    <p className="text-xs text-gray-500">$1,245.00 from client • 12 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Server Status</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Database</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">API Status</span>
                  </div>
                  <span className="text-sm text-yellow-600 font-medium">Warning</span>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Server Load</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
 