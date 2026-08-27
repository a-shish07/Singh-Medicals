import { useState } from 'react';
import { useApp } from '../context';
import { PRODUCTS } from '../data';
import type { Category } from '../types';

const TESTIMONIALS = [
  { name: 'Rajesh Kumar', shop: 'Kumar Medical Store', city: 'Padrauna', quote: 'Best wholesale rates in the district. Same-day delivery and genuine stock every time. Been ordering for 4 years.', stars: 5 },
  { name: 'Sanjay Gupta', shop: 'Gupta Pharmacy', city: 'Kushinagar', quote: 'Very smooth ordering process. The net rates are competitive and they always honour the scheme offers on time.', stars: 5 },
  { name: 'Meena Devi', shop: 'New Life Medicals', city: 'Deoria', quote: 'Reliable supply of branded medicines. No shortage issues and the team is very responsive on WhatsApp.', stars: 5 },
  { name: 'Prakash Singh', shop: 'Singh Medical Agency', city: 'Gorakhpur', quote: 'Switched from another distributor 2 years ago. The pricing and service are genuinely better here.', stars: 4 },
];

const CATEGORIES: { label: Category; icon: React.ReactNode; desc: string; color: string }[] = [
  {
    label: 'Tablets',
    desc: 'Antibiotics, analgesics, chronic disease management',
    color: 'from-emerald-50 to-green-100',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <rect x="4" y="10" width="24" height="12" rx="6" fill="#0D9A55" opacity="0.15" />
        <rect x="4" y="10" width="12" height="12" rx="6" fill="#0D9A55" />
        <rect x="16" y="10" width="12" height="12" rx="6" fill="#0D9A55" opacity="0.4" />
      </svg>
    ),
  },
  {
    label: 'Syrups',
    desc: 'Cough syrups, antacids, paediatric formulations',
    color: 'from-blue-50 to-cyan-100',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <path d="M11 6h10l2 4H9L11 6z" fill="#0D9A55" opacity="0.5" />
        <rect x="9" y="10" width="14" height="16" rx="3" fill="#0D9A55" opacity="0.15" />
        <rect x="9" y="10" width="14" height="8" rx="3" fill="#0D9A55" opacity="0.4" />
      </svg>
    ),
  },
  {
    label: 'Injections',
    desc: 'IV fluids, antibiotics, vitamins in injectable form',
    color: 'from-purple-50 to-violet-100',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <path d="M6 26L18 14l3 3L9 29 6 26z" fill="#0D9A55" opacity="0.4" />
        <rect x="16" y="6" width="4" height="14" rx="2" transform="rotate(45 16 6)" fill="#0D9A55" />
        <circle cx="24" cy="8" r="3" fill="#0D9A55" opacity="0.3" />
      </svg>
    ),
  },
  {
    label: 'Eye Drops',
    desc: 'Antibiotics, lubricants, anti-inflammatory drops',
    color: 'from-amber-50 to-orange-100',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <ellipse cx="16" cy="16" rx="12" ry="8" fill="#0D9A55" opacity="0.15" />
        <circle cx="16" cy="16" r="5" fill="#0D9A55" opacity="0.4" />
        <circle cx="16" cy="16" r="2.5" fill="#0D9A55" />
        <path d="M16 6v4M16 22v4M6 16h4M22 16h4" stroke="#0D9A55" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  { q: 'Do I need to register to place an order?', a: 'Yes, a one-time registration with your drug licence number is required. Login is quick via mobile OTP — no passwords needed.' },
  { q: 'What is the minimum order value?', a: 'There is no minimum order for registered pharmacy retailers. Order any quantity at wholesale net rates.' },
  { q: 'How soon will my order be dispatched?', a: 'Orders confirmed before 12 PM are typically dispatched same day. Delivery to Padrauna and nearby areas is same day; other UP districts take 1-2 working days.' },
  { q: 'Are scheme offers (like 10+1 Free) automatically applied?', a: 'Yes, all active scheme offers are applied automatically at the net rate shown. No separate coupon needed.' },
];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function MiniProductCard({ product }: { product: typeof PRODUCTS[0] }) {
  const { navigateToProduct } = useApp();
  const disc = Math.round(((product.mrp - product.net) / product.mrp) * 100);
  return (
    <button
      onClick={() => navigateToProduct(product.id)}
      className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.11)] hover:-translate-y-0.5 transition-all duration-200 p-4 text-left shrink-0 w-48 flex flex-col"
    >
      <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .3 2.7-1.1 2.7H3.9c-1.4 0-2.1-1.7-1.1-2.7L4.2 15.3" />
        </svg>
      </div>
      <p className="font-bold text-[#1C1C1E] text-sm leading-snug mb-0.5 line-clamp-2">{product.name}</p>
      <p className="text-xs text-[#0D9A55] font-semibold mb-2">{product.company}</p>
      <div className="mt-auto flex items-baseline gap-1.5">
        <span className="text-base font-extrabold text-[#1C1C1E]">₹{product.net}</span>
        <span className="text-xs text-[#9CA3AF] line-through">₹{product.mrp}</span>
        <span className="ml-auto text-[10px] font-bold bg-[#E8F5EE] text-[#0D9A55] px-1.5 py-0.5 rounded-lg">{disc}%</span>
      </div>
    </button>
  );
}

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/[0.06] last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
      >
        <span className="font-semibold text-[#1C1C1E] text-sm group-hover:text-[#0D9A55] transition-colors">{q}</span>
        <svg
          className={`w-5 h-5 shrink-0 text-[#0D9A55] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-4 text-sm text-[#6B7280] leading-relaxed animate-fade-in">{a}</p>
      )}
    </div>
  );
}

export default function Home() {
  const { navigate } = useApp();
  const featured = PRODUCTS.filter(p => p.scheme || (((p.mrp - p.net) / p.mrp) > 0.25)).slice(0, 8);

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-blob absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0D9A55]/18 to-[#12B060]/5 blur-3xl -top-40 -right-32" />
          <div className="animate-blob absolute w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#0D9A55]/10 to-transparent blur-2xl top-40 -left-20" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="animate-fade-in-up inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E8F5EE] rounded-full mb-6" style={{ animationDelay: '0.1s' }}>
                <span className="w-2 h-2 rounded-full bg-[#0D9A55] animate-pulse" />
                <span className="text-xs font-semibold text-[#0D9A55] tracking-wide">Live Wholesale Rates · Updated Daily</span>
              </div>
              <h1 className="animate-fade-in-up text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1C1C1E] leading-[1.08] mb-5 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif", animationDelay: '0.2s' }}>
                Wholesale Pharma<br />
                <span className="text-[#0D9A55]">You Can Trust.</span>
              </h1>
              <p className="animate-fade-in-up text-lg text-[#6B7280] mb-8 leading-relaxed max-w-lg" style={{ animationDelay: '0.35s' }}>
                Direct wholesale rates for registered pharmacies across Eastern UP. 500+ products, same-day dispatch from Padrauna.
              </p>
              <div className="animate-fade-in-up flex flex-wrap gap-3" style={{ animationDelay: '0.5s' }}>
                <button
                  onClick={() => navigate('catalogue')}
                  className="px-7 py-3.5 bg-[#0D9A55] text-white font-bold rounded-2xl hover:bg-[#0A7A43] transition-all shadow-[0_4px_20px_rgba(13,154,85,0.35)] hover:shadow-[0_6px_28px_rgba(13,154,85,0.45)] hover:-translate-y-0.5 text-sm"
                >
                  Browse Catalogue →
                </button>
                <a
                  href="https://wa.me/919876543210?text=Hi%20Singh%20Medical%20Stores%2C%20I%20want%20to%20place%20a%20wholesale%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-7 py-3.5 border-2 border-[#0D9A55] text-[#0D9A55] font-bold rounded-2xl hover:bg-[#E8F5EE] transition-all text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Order via WhatsApp
                </a>
              </div>
            </div>

            {/* Right — floating shapes */}
            <div className="hidden lg:flex items-center justify-center relative h-72">
              <div className="animate-float absolute top-4 right-20 w-16 h-8 bg-[#0D9A55] rounded-full opacity-80 shadow-[0_4px_20px_rgba(13,154,85,0.4)]" style={{ animationDelay: '0s' }} />
              <div className="animate-float-slow absolute top-16 right-8 w-10 h-10 bg-[#E8F5EE] border-2 border-[#0D9A55]/30 rounded-2xl shadow-sm" style={{ animationDelay: '1s' }} />
              <div className="animate-float absolute bottom-16 right-28 w-20 h-10 bg-gradient-to-r from-[#0D9A55] to-[#12B060] rounded-full opacity-70 shadow-[0_4px_20px_rgba(13,154,85,0.35)]" style={{ animationDelay: '2s' }} />
              <div className="animate-float-slow absolute top-10 left-8 w-12 h-12 bg-amber-100 border-2 border-amber-300/50 rounded-2xl flex items-center justify-center shadow-sm" style={{ animationDelay: '0.5s' }}>
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .3 2.7-1.1 2.7H3.9c-1.4 0-2.1-1.7-1.1-2.7L4.2 15.3" /></svg>
              </div>
              <div className="animate-float absolute bottom-8 left-16 w-14 h-14 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-center" style={{ animationDelay: '1.5s' }}>
                <svg className="w-7 h-7 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
              </div>
              <div className="animate-float-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-to-br from-[#0D9A55]/10 to-[#12B060]/5 rounded-full blur-xl" style={{ animationDelay: '3s' }} />

              <div className="relative bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-6 w-56 z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0D9A55]">Order Placed</p>
                    <p className="text-[10px] text-[#9CA3AF]">ORD-2024-108</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-[#6B7280]">Augmentin 625</span><span className="font-semibold">×5</span></div>
                  <div className="flex justify-between text-xs"><span className="text-[#6B7280]">Dolo 650</span><span className="font-semibold">×10</span></div>
                  <div className="flex justify-between text-xs"><span className="text-[#6B7280]">Pan 40</span><span className="font-semibold">×3</span></div>
                </div>
                <div className="mt-4 pt-3 border-t border-black/[0.06] flex justify-between items-center">
                  <span className="text-xs text-[#6B7280]">Total</span>
                  <span className="font-extrabold text-[#0D9A55]">₹1,826</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="bg-[#0D9A55]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { num: '500+', label: 'Products In Stock' },
              { num: '200+', label: 'Retail Pharmacies' },
              { num: 'Same Day', label: 'Dispatch from Padrauna' },
              { num: '25+ yrs', label: 'Trusted Since 1998' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center py-2 text-white text-center">
                <span className="text-2xl font-extrabold leading-none" style={{ fontFamily: "'DM Sans', sans-serif" }}>{stat.num}</span>
                <span className="text-xs text-white/70 mt-0.5 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#0D9A55] uppercase tracking-widest mb-2">Browse By Category</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Every category,<br />wholesale rates.
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              onClick={() => navigate('catalogue')}
              className={`bg-gradient-to-br ${cat.color} rounded-2xl p-6 text-left hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-200 group`}
            >
              <div className="mb-4">{cat.icon}</div>
              <h3 className="font-extrabold text-[#1C1C1E] text-lg mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{cat.label}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">{cat.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0D9A55] group-hover:gap-2 transition-all">
                Browse <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white border-y border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#0D9A55] uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Order in 3 steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-10 left-1/3 w-1/3 h-px bg-gradient-to-r from-[#0D9A55]/30 to-[#0D9A55]/30 border-t-2 border-dashed border-[#0D9A55]/20" />
            <div className="hidden sm:block absolute top-10 left-2/3 w-1/3 h-px bg-gradient-to-r from-[#0D9A55]/30 to-transparent border-t-2 border-dashed border-[#0D9A55]/20" />

            {[
              {
                step: '01',
                title: 'Browse Catalogue',
                desc: 'Filter by category, company, or search by name. See live net rates, MRP, discount %, and scheme offers.',
                icon: <svg className="w-7 h-7 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
              },
              {
                step: '02',
                title: 'Add to Cart',
                desc: 'Select quantities with the stepper. Cart is saved across the session so you can browse and come back.',
                icon: <svg className="w-7 h-7 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
              },
              {
                step: '03',
                title: 'Checkout or WhatsApp',
                desc: 'Place the order online and get a confirmed order ID, or share cart directly to our WhatsApp for manual processing.',
                icon: <svg className="w-7 h-7 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
              },
            ].map(step => (
              <div key={step.step} className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-[#E8F5EE] flex items-center justify-center shadow-[0_2px_12px_rgba(13,154,85,0.12)]">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#0D9A55] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(13,154,85,0.4)]">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-extrabold text-[#1C1C1E] text-lg mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{step.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-[#0D9A55] uppercase tracking-widest mb-2">Best Deals</p>
            <h2 className="text-3xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Featured Products</h2>
          </div>
          <button onClick={() => navigate('catalogue')} className="text-sm font-semibold text-[#0D9A55] hover:text-[#0A7A43] transition-colors flex items-center gap-1">
            View All <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </button>
        </div>
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-3">
            {featured.map(p => <MiniProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-[#F5F7F5] border-y border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#0D9A55] uppercase tracking-widest mb-2">What Retailers Say</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Trusted by pharmacies<br />across UP</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} filled={i < t.stars} />)}
                </div>
                <p className="text-sm text-[#374151] leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-black/[0.06]">
                  <div className="w-9 h-9 rounded-full bg-[#E8F5EE] flex items-center justify-center font-bold text-sm text-[#0D9A55]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1C1C1E]">{t.name}</p>
                    <p className="text-xs text-[#6B7280]">{t.shop}, {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold text-[#0D9A55] uppercase tracking-widest mb-2">Why Singh Medical</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1E] mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              The distributor that<br />treats you like a partner.
            </h2>
            <p className="text-[#6B7280] leading-relaxed mb-8">
              Since 1998, we have served retail pharmacies across Kushinagar, Gorakhpur, Deoria, and surrounding districts with genuine branded medicines at fair net rates.
            </p>
            <button onClick={() => navigate('about')} className="text-sm font-semibold text-[#0D9A55] hover:text-[#0A7A43] transition-colors flex items-center gap-1">
              Our Story <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '✓', title: 'Genuine Stock Only', desc: 'All products sourced directly from authorised C&F agents. No parallel imports.' },
              { icon: '₹', title: 'Competitive Net Rates', desc: 'Wholesale rates revised weekly. Best rates on bulk orders for regular retailers.' },
              { icon: '⚡', title: 'Same-Day Dispatch', desc: 'Orders placed before 12 PM are dispatched the same day from our Padrauna warehouse.' },
              { icon: '↺', title: 'Easy Reorder', desc: 'Your order history is saved. Reorder previous lists in one click with updated pricing.' },
            ].map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#0D9A55] font-extrabold text-lg mb-3">
                  {v.icon}
                </div>
                <h3 className="font-bold text-[#1C1C1E] text-sm mb-1.5">{v.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ PREVIEW ── */}
      <section className="bg-white border-t border-black/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-[#0D9A55] uppercase tracking-widest mb-2">Common Questions</p>
            <h2 className="text-3xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Quick answers</h2>
          </div>
          <div className="bg-[#F5F7F5] rounded-2xl px-6 divide-y divide-black/[0.06]">
            {FAQ_ITEMS.map(item => (
              <AccordionItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
          <div className="text-center mt-6">
            <button onClick={() => navigate('faq')} className="text-sm font-semibold text-[#0D9A55] hover:text-[#0A7A43] transition-colors">
              View All FAQs →
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="relative overflow-hidden bg-[#0D9A55]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-80 h-80 rounded-full bg-white/5 blur-3xl -top-20 -right-20" />
          <div className="absolute w-60 h-60 rounded-full bg-white/5 blur-3xl -bottom-10 -left-10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Ready to start ordering?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Register your pharmacy today. Get access to exclusive net rates, saved order history, and priority dispatch.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('login')}
              className="px-8 py-3.5 bg-white text-[#0D9A55] font-bold rounded-2xl hover:bg-[#F5F7F5] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.15)] text-sm"
            >
              Login / Register →
            </button>
            <button
              onClick={() => navigate('catalogue')}
              className="px-8 py-3.5 border-2 border-white/50 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-sm"
            >
              Browse as Guest
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
