import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import Stats from '../components/Stats';
import SellerPanel from '../components/SellerPanel';
import Header from '../components/Header';

const Feature = ({title, desc, icon}: {title: string; desc: string; icon: React.ReactNode}) => (
  <div className="bg-white/80 rounded shadow p-6">
    <div className="h-12 w-12 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-600 mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

const Page = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <Header />

      <section className="bg-gradient-to-r from-emerald-700 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-sm font-medium mb-4">Seller tools • Fast • Secure</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">Sell smarter — scale with confidence</h1>
              <p className="mt-4 text-lg text-emerald-100 max-w-xl">Manage listings, track inventory, and run promotions from one lightweight dashboard. Focus on growth while we handle the rest.</p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/(routes)/dashboard" className="inline-flex items-center gap-3 bg-white text-emerald-900 px-6 py-3 rounded-full shadow hover:shadow-lg">Go to dashboard</Link>
                <Link href="/(routes)/dashboard/create-product" className="inline-flex items-center gap-2 border border-white/20 text-white px-5 py-3 rounded-full">Create product</Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="bg-white/10 px-3 py-2 rounded-full text-sm">Fast Listings</div>
                <div className="bg-white/10 px-3 py-2 rounded-full text-sm">Inventory Alerts</div>
                <div className="bg-white/10 px-3 py-2 rounded-full text-sm">Promo Tools</div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-lg">
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg">
                  <img src="/images/placeholder.svg" alt="hero illustration" className="w-full h-64 object-cover" />
                  <div className="absolute left-6 bottom-6 bg-white rounded-lg p-3 shadow">
                    <div className="text-xs text-gray-500">Featured</div>
                    <div className="text-sm font-semibold text-gray-900">Organic Honey</div>
                    <div className="text-sm text-emerald-600 font-bold mt-1">$12.50</div>
                  </div>
                  <div className="absolute right-6 top-6 bg-white rounded-lg p-3 shadow">
                    <div className="text-xs text-gray-500">Insights</div>
                    <div className="text-sm font-semibold text-gray-900">+28% sales</div>
                    <div className="text-xs text-gray-500">last 30 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="container mx-auto px-4 md:px-0 py-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Powerful features for sellers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature
            title="Fast product creation"
            desc="Create listings quickly with an intuitive form and presets for recurring items."
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>}
          />

          <Feature
            title="Inventory insights"
            desc="Track stock levels and sales trends so you never run out of best-sellers."
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
            </svg>}
          />

          <Feature
            title="Discounts & promos"
            desc="Create limited-time discounts to boost conversions and clear inventory."
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
            </svg>}
          />
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Your store at a glance</h3>
          <Stats />
        </div>

        <div className="mt-8">
          <SellerPanel />
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Featured products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {id: 'p1', title: 'Organic Honey', price: 12.5, stock: 24},
              {id: 'p2', title: 'Herbal Tea - Calm', price: 8.0, stock: 6},
              {id: 'p3', title: 'Handmade Soap', price: 5.5, stock: 3},
            ].map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">What sellers say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <blockquote className="bg-white/90 p-6 rounded shadow">
              <p className="text-sm text-gray-700">"Listing products is a breeze — our sales improved within a week."</p>
              <cite className="block mt-4 text-xs text-gray-500">— Ama, store owner</cite>
            </blockquote>
            <blockquote className="bg-white/90 p-6 rounded shadow">
              <p className="text-sm text-gray-700">"Inventory insights helped me avoid stockouts during promotions."</p>
              <cite className="block mt-4 text-xs text-gray-500">— Kofi, merchant</cite>
            </blockquote>
            <blockquote className="bg-white/90 p-6 rounded shadow">
              <p className="text-sm text-gray-700">"Fast and clean UI — my team loves it."</p>
              <cite className="block mt-4 text-xs text-gray-500">— Selina, seller</cite>
            </blockquote>
          </div>
        </div>
      </section>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 md:px-0 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">© <span suppressHydrationWarning>{new Date().getFullYear()}</span> Oherbuy. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600">Privacy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Page;
