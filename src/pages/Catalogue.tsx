import { useState, useMemo } from 'react';
import { useApp } from '../context';
import { PRODUCTS, COMPANIES } from '../data';
import type { Category } from '../types';

const CATEGORIES: (Category | 'All')[] = ['All', 'Tablets', 'Syrups', 'Injections', 'Eye Drops', 'Topical'];

function GreenBlob({ className }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none rounded-full bg-gradient-to-br from-[#0D9A55]/20 to-[#12B060]/5 blur-3xl ${className}`} />
  );
}

function DiscountBadge({ mrp, net }: { mrp: number; net: number }) {
  const pct = Math.round(((mrp - net) / mrp) * 100);
  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold rounded-lg">
      {pct}% off
    </span>
  );
}

function ProductCard({ product }: { product: typeof PRODUCTS[0] }) {
  const { cartItems, addToCart, updateQty, addToast, navigateToProduct } = useApp();
  const cartItem = cartItems.find(i => i.productId === product.id);
  const [localQty, setLocalQty] = useState(1);

  const discountPct = Math.round(((product.mrp - product.net) / product.mrp) * 100);

  const handleAdd = () => {
    addToCart(product.id, localQty);
    addToast(`${product.name} added to cart`);
    setLocalQty(1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">
      <div className="p-4 flex-1 flex flex-col">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="px-2 py-0.5 bg-[#F5F7F5] text-[#6B7280] text-[10px] font-semibold rounded-lg uppercase tracking-wide">{product.category}</span>
          <DiscountBadge mrp={product.mrp} net={product.net} />
          {product.scheme && (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-200">
              🎁 {product.scheme}
            </span>
          )}
        </div>

        {/* Product name & company */}
        <h3
          onClick={() => navigateToProduct(product.id)}
          className="font-bold text-[#1C1C1E] text-base leading-tight mb-1 hover:text-[#0D9A55] cursor-pointer transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {product.name}
        </h3>
        <p className="text-xs font-semibold text-[#0D9A55] mb-0.5">{product.company}</p>
        <p className="text-xs text-[#6B7280] leading-relaxed mb-1 line-clamp-2">{product.composition}</p>

        <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
            {product.pack}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            Exp: {product.expiry}
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-2 mb-4">
          <div>
            <p className="text-xs text-[#6B7280]">Net Rate</p>
            <p className="text-xl font-bold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>₹{product.net}</p>
          </div>
          <p className="text-sm text-[#6B7280] line-through mb-0.5">₹{product.mrp}</p>
          <p className="text-xs text-[#6B7280] mb-0.5">MRP</p>
        </div>

        {/* Actions */}
        <div className="mt-auto">
          {cartItem ? (
            <div className="flex items-center justify-between bg-[#E8F5EE] rounded-xl px-3 py-2">
              <button
                onClick={() => updateQty(product.id, cartItem.quantity - 1)}
                className="w-6 h-6 flex items-center justify-center text-[#0D9A55] hover:bg-[#0D9A55] hover:text-white rounded-lg transition-colors font-bold text-lg leading-none"
              >−</button>
              <span className="text-sm font-bold text-[#0D9A55]">In Cart · {cartItem.quantity}</span>
              <button
                onClick={() => updateQty(product.id, cartItem.quantity + 1)}
                className="w-6 h-6 flex items-center justify-center text-[#0D9A55] hover:bg-[#0D9A55] hover:text-white rounded-lg transition-colors font-bold text-lg leading-none"
              >+</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F5F7F5] rounded-xl border border-black/[0.06]">
                <button
                  onClick={() => setLocalQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#0D9A55] transition-colors font-bold"
                >−</button>
                <span className="w-7 text-center text-sm font-semibold">{localQty}</span>
                <button
                  onClick={() => setLocalQty(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#0D9A55] transition-colors font-bold"
                >+</button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 py-2 bg-[#0D9A55] text-white text-sm font-semibold rounded-xl hover:bg-[#0A7A43] active:scale-95 transition-all duration-150 shadow-[0_2px_8px_rgba(13,154,85,0.25)]"
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Catalogue() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [company, setCompany] = useState('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PRODUCTS.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.company.toLowerCase().includes(q) || p.composition.toLowerCase().includes(q);
      const matchCat = category === 'All' || p.category === category;
      const matchCompany = company === 'All' || p.company === company;
      return matchSearch && matchCat && matchCompany;
    });
  }, [search, category, company]);

  return (
    <div className="min-h-screen">
      {/* Hero Band */}
      <section className="relative overflow-hidden bg-white border-b border-black/[0.06]">
        <GreenBlob className="w-[500px] h-[500px] -top-40 -right-40 opacity-60" />
        <GreenBlob className="w-[300px] h-[300px] -bottom-20 -left-20 opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F5EE] rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-[#0D9A55] animate-pulse" />
              <span className="text-xs font-semibold text-[#0D9A55]">Live Wholesale Rates · Updated Today</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1E] mb-3 leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Wholesale Pharma Catalogue
            </h1>
            <p className="text-[#6B7280] text-lg mb-6">
              Trusted wholesale rates for retail pharmacies — direct from distributor, no middlemen.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search by medicine name, company, or composition..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#F5F7F5] border border-black/[0.08] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all placeholder:text-[#9CA3AF]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1C1C1E] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 bg-[#F5F7F5]/95 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all duration-150 ${
                  category === cat
                    ? 'bg-[#0D9A55] text-white shadow-[0_2px_8px_rgba(13,154,85,0.3)]'
                    : 'bg-white text-[#6B7280] hover:bg-[#E8F5EE] hover:text-[#0D9A55] border border-black/[0.08]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white border border-black/[0.08] rounded-xl text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all"
          >
            <option value="All">All Companies</option>
            {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </section>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {search && (
          <p className="text-sm text-[#6B7280] mb-4">
            {filtered.length > 0 ? `${filtered.length} result${filtered.length === 1 ? '' : 's'} for "${search}"` : `No results for "${search}"`}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
              <GreenBlob className="w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
              <div className="relative w-20 h-20 rounded-2xl bg-[#E8F5EE] flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#1C1C1E] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>No medicines found</h3>
            <p className="text-[#6B7280] max-w-sm">Try adjusting your search term or changing the filters.</p>
            <button
              onClick={() => { setSearch(''); setCategory('All'); setCompany('All'); }}
              className="mt-6 px-5 py-2.5 bg-[#0D9A55] text-white rounded-xl text-sm font-semibold hover:bg-[#0A7A43] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
