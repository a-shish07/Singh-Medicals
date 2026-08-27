import { useState } from 'react';
import { useApp } from '../context';
import { PRODUCTS } from '../data';

export default function ProductDetail() {
  const { selectedProductId, navigate, navigateToProduct, cartItems, addToCart, updateQty, addToast } = useApp();
  const product = PRODUCTS.find(p => p.id === selectedProductId);
  const [localQty, setLocalQty] = useState(1);
  const [tab, setTab] = useState<'description' | 'pack'>('description');

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B7280] mb-4">Product not found.</p>
          <button onClick={() => navigate('catalogue')} className="text-[#0D9A55] font-semibold hover:underline">Back to Catalogue</button>
        </div>
      </div>
    );
  }

  const discPct = Math.round(((product.mrp - product.net) / product.mrp) * 100);
  const cartItem = cartItems.find(i => i.productId === product.id);
  const similar = PRODUCTS.filter(p => p.id !== product.id && (p.category === product.category || p.company === product.company)).slice(0, 6);

  const handleAdd = () => {
    addToCart(product.id, localQty);
    addToast(`${product.name} added to cart`);
    setLocalQty(1);
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-xs text-[#9CA3AF]">
            <button onClick={() => navigate('home')} className="hover:text-[#0D9A55] transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate('catalogue')} className="hover:text-[#0D9A55] transition-colors">{product.category}</button>
            <span>/</span>
            <span className="text-[#1C1C1E] font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Image placeholder */}
          <div className="relative bg-gradient-to-br from-[#E8F5EE] to-[#F5F7F5] rounded-3xl aspect-square flex items-center justify-center overflow-hidden">
            <div className="absolute w-64 h-64 rounded-full bg-[#0D9A55]/8 blur-3xl" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-center">
                <svg className="w-12 h-12 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .3 2.7-1.1 2.7H3.9c-1.4 0-2.1-1.7-1.1-2.7L4.2 15.3" />
                </svg>
              </div>
              <span className="text-xs text-[#9CA3AF] font-medium">Product image not available</span>
            </div>

            {product.scheme && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg">
                🎁 {product.scheme}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="flex flex-col">
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="px-2.5 py-1 bg-[#F5F7F5] text-[#6B7280] text-xs font-semibold rounded-lg uppercase tracking-wide">{product.category}</span>
              <span className="px-2.5 py-1 bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold rounded-lg">{discPct}% off MRP</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] leading-tight mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {product.name}
            </h1>
            <p className="text-base font-semibold text-[#0D9A55] mb-1">{product.company}</p>
            <p className="text-sm text-[#6B7280] mb-5">{product.composition}</p>

            <div className="bg-[#F5F7F5] rounded-2xl p-4 mb-5">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>₹{product.net}</span>
                <span className="text-lg text-[#9CA3AF] line-through">₹{product.mrp}</span>
                <span className="text-sm text-[#6B7280]">MRP</span>
              </div>
              <p className="text-xs text-[#6B7280]">Net wholesale rate per pack · {product.pack}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div className="flex items-center gap-2 text-[#6B7280]">
                <svg className="w-4 h-4 text-[#0D9A55] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                Pack: <span className="font-semibold text-[#1C1C1E]">{product.pack}</span>
              </div>
              <div className="flex items-center gap-2 text-[#6B7280]">
                <svg className="w-4 h-4 text-[#0D9A55] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                Expiry: <span className="font-semibold text-[#1C1C1E]">{product.expiry}</span>
              </div>
            </div>

            {/* Cart action */}
            {cartItem ? (
              <div className="flex items-center justify-between bg-[#E8F5EE] rounded-2xl px-4 py-3 mb-4">
                <button onClick={() => updateQty(product.id, cartItem.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-[#0D9A55] hover:bg-[#0D9A55] hover:text-white rounded-xl transition-colors font-bold text-xl">−</button>
                <div className="text-center">
                  <span className="font-extrabold text-[#0D9A55] text-sm">In Cart · {cartItem.quantity} unit{cartItem.quantity !== 1 ? 's' : ''}</span>
                  <p className="text-xs text-[#6B7280] mt-0.5">₹{(product.net * cartItem.quantity).toLocaleString()} total</p>
                </div>
                <button onClick={() => updateQty(product.id, cartItem.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-[#0D9A55] hover:bg-[#0D9A55] hover:text-white rounded-xl transition-colors font-bold text-xl">+</button>
              </div>
            ) : (
              <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-1 bg-[#F5F7F5] rounded-xl border border-black/[0.08]">
                  <button onClick={() => setLocalQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:text-[#0D9A55] transition-colors font-bold text-lg">−</button>
                  <span className="w-10 text-center text-sm font-semibold">{localQty}</span>
                  <button onClick={() => setLocalQty(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:text-[#0D9A55] transition-colors font-bold text-lg">+</button>
                </div>
                <button onClick={handleAdd} className="flex-1 py-3 bg-[#0D9A55] text-white font-bold rounded-xl hover:bg-[#0A7A43] transition-all shadow-[0_4px_16px_rgba(13,154,85,0.3)] text-sm">
                  Add to Cart — ₹{(product.net * localQty).toLocaleString()}
                </button>
              </div>
            )}

            <button onClick={() => navigate('cart')} className="text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors text-center">
              View Cart →
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-10">
          <div className="flex gap-1 border-b border-black/[0.08] mb-6">
            {(['description', 'pack'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${tab === t ? 'border-[#0D9A55] text-[#0D9A55]' : 'border-transparent text-[#6B7280] hover:text-[#1C1C1E]'}`}
              >
                {t === 'description' ? 'Description & Composition' : 'Pack & Storage'}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <div className="prose prose-sm max-w-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                  <h4 className="font-bold text-[#1C1C1E] mb-3 text-sm uppercase tracking-wide">Composition</h4>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{product.composition}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                  <h4 className="font-bold text-[#1C1C1E] mb-3 text-sm uppercase tracking-wide">Manufacturer</h4>
                  <p className="text-[#6B7280] text-sm">{product.company}</p>
                  <p className="text-[#9CA3AF] text-xs mt-1">Sourced from authorised C&F agent</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:col-span-2">
                  <h4 className="font-bold text-[#1C1C1E] mb-3 text-sm uppercase tracking-wide">General Information</h4>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    This product is sold at wholesale net rates to registered retail pharmacy licence holders only.
                    Prescription requirements apply as per applicable drug schedules. All products are sourced
                    directly from authorised distributors and are guaranteed genuine.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'pack' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: 'Pack Size', value: product.pack },
                { label: 'Category', value: product.category },
                { label: 'Expiry', value: product.expiry },
                { label: 'Storage', value: 'Store below 25°C, away from direct sunlight and moisture.' },
                { label: 'Handling', value: 'Keep out of reach of children. Read package insert before dispensing.' },
                { label: 'GST Applicability', value: 'GST as applicable on pharmaceutical products. Consult your accountant for input credit details.' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-sm text-[#1C1C1E] font-medium leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Similar Products
              </h2>
              <button onClick={() => navigate('catalogue')} className="text-sm text-[#0D9A55] font-semibold hover:text-[#0A7A43] transition-colors">
                View All in {product.category} →
              </button>
            </div>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6" style={{ scrollbarWidth: 'none' }}>
              <div className="flex gap-3">
                {similar.map(p => {
                  const disc = Math.round(((p.mrp - p.net) / p.mrp) * 100);
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigateToProduct(p.id)}
                      className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.11)] hover:-translate-y-0.5 transition-all duration-200 p-4 text-left shrink-0 w-48"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .3 2.7-1.1 2.7H3.9c-1.4 0-2.1-1.7-1.1-2.7L4.2 15.3" />
                        </svg>
                      </div>
                      <p className="font-bold text-[#1C1C1E] text-sm leading-snug mb-0.5 line-clamp-2">{p.name}</p>
                      <p className="text-xs text-[#0D9A55] font-semibold mb-2">{p.company}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-[#1C1C1E]">₹{p.net}</span>
                        <span className="text-xs text-[#9CA3AF] line-through">₹{p.mrp}</span>
                        <span className="ml-auto text-[10px] font-bold bg-[#E8F5EE] text-[#0D9A55] px-1.5 py-0.5 rounded-lg">{disc}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.08] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30">
        {cartItem ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#E8F5EE] rounded-xl px-3 py-2">
              <button onClick={() => updateQty(product.id, cartItem.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-[#0D9A55] font-bold text-lg">−</button>
              <span className="w-8 text-center text-sm font-bold text-[#0D9A55]">{cartItem.quantity}</span>
              <button onClick={() => updateQty(product.id, cartItem.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-[#0D9A55] font-bold text-lg">+</button>
            </div>
            <button onClick={() => navigate('cart')} className="flex-1 py-3 bg-[#0D9A55] text-white font-bold rounded-xl text-sm">
              Go to Cart · ₹{(product.net * cartItem.quantity).toLocaleString()}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#F5F7F5] rounded-xl border border-black/[0.08]">
              <button onClick={() => setLocalQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-[#6B7280] font-bold text-lg">−</button>
              <span className="w-8 text-center text-sm font-semibold">{localQty}</span>
              <button onClick={() => setLocalQty(q => q + 1)} className="w-9 h-9 flex items-center justify-center text-[#6B7280] font-bold text-lg">+</button>
            </div>
            <button onClick={handleAdd} className="flex-1 py-3 bg-[#0D9A55] text-white font-bold rounded-xl text-sm shadow-[0_4px_12px_rgba(13,154,85,0.3)]">
              Add to Cart — ₹{(product.net * localQty).toLocaleString()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
