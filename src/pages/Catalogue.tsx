import { useState, useMemo } from 'react';
import { useApp } from '../context';
import type { Category, Product } from '../types';

const CATEGORIES: (Category | 'All')[] = ['All', 'Tablets', 'Syrups', 'Injections', 'Eye Drops', 'Topical'];

type ProductPricing = Product & {
  ptr?: number | null;
  gst?: number | null;
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount?: number | null;
  effectivePtr?: number | null;
  buyQuantity?: number | null;
  freeQuantity?: number | null;
  bonusProductId?: string | null;
};

// Single customer-facing price source.
// Legacy `net` is used only for older records that do not yet have Effective PTR.
function effectivePrice(product: ProductPricing) {
  const value = Number(product.effectivePtr);
  return Number.isFinite(value) ? value : Number(product.net || 0);
}

function offerLabel(product: ProductPricing): string | null {
  const type = product.discountType || 'NONE';
  const discount = Number(product.discountValue || 0);
  const buy = Number(product.buyQuantity || 0);
  const free = Number(product.freeQuantity || 0);

  switch (type) {
    case 'DISCOUNT_ON_PTR':
      return discount > 0 ? `${discount}% OFF` : null;
    case 'SAME_PRODUCT_BONUS':
      return buy > 0 && free > 0 ? `BUY ${buy} GET ${free} FREE` : null;
    case 'DIFFERENT_PRODUCT_BONUS':
      return buy > 0 && free > 0
        ? `BUY ${buy} GET ${free} FREE`
        : 'FREE PRODUCT';
    case 'SAME_PRODUCT_BONUS_AND_DISCOUNT':
      return buy > 0 && free > 0
        ? `BUY ${buy} GET ${free} FREE + ${discount}% OFF`
        : discount > 0 ? `${discount}% OFF` : null;
    case 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT':
      return discount > 0
        ? buy > 0 && free > 0
          ? `BUY ${buy} GET ${free} FREE + ${discount}% OFF`
          : `FREE PRODUCT + ${discount}% OFF`
        : 'FREE PRODUCT';
    default:
      return null;
  }
}

function GreenBlob({ className }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none rounded-full bg-gradient-to-br from-[#0D9A55]/20 to-[#12B060]/5 blur-3xl ${className}`} />
  );
}


function ProductCard({ product }: { product: ProductPricing }) {
  const {
    cartItems,
    addToCart,
    updateQty,
    addToast,
    navigateToProduct,
  } = useApp();

  const cartItem = cartItems.find(
    (i) => i.productId === product.id
  );

  const [localQty, setLocalQty] = useState(() => Math.max(1, product.minOrderQuantity || 1));
  const minQty = Math.max(1, Number(product.minOrderQuantity) || 1);

  const price = effectivePrice(product);
  const offer = offerLabel(product);

 const handleLocalQtyChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const value = e.target.value;

  if (value === "") {
    setLocalQty("");
    return;
  }

  const numericValue = Number(value);

  if (Number.isFinite(numericValue) && numericValue >= 0) {
    setLocalQty(Math.floor(numericValue));
  }
};

const handleLocalQtyBlur = () => {
  const value = Number(localQty);

  if (!Number.isFinite(value) || value < minQty) {
    setLocalQty(minQty);
    return;
  }

  const normalized = Math.floor(value / minQty) * minQty;

  setLocalQty(Math.max(minQty, normalized));
};

  const handleAdd = () => {
    const quantity = Math.max(product.minOrderQuantity || 1, localQty);

    addToCart(product.id, quantity);

    addToast(
      `${product.name} × ${quantity} added to cart`
    );

    setLocalQty(Math.max(1, product.minOrderQuantity || 1));
  };

  const handleCartQtyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    if (value === "") {
      updateQty(product.id, 1);
      return;
    }

    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      updateQty(
        product.id,
        Math.max(1, Math.floor(numericValue))
      );
    }
  };

  

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">
      <div className="p-4 flex-1 flex flex-col">

        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="px-2 py-0.5 bg-[#F5F7F5] text-[#6B7280] text-[10px] font-semibold rounded-lg uppercase tracking-wide">
            {product.category}
          </span>

          {offer && (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-200">
              🎁 {offer}
            </span>
          )}
        </div>

        {/* Product name & company */}
        <h3
          onClick={() => navigateToProduct(product.id)}
          className="font-bold text-[#1C1C1E] text-base leading-tight mb-1 hover:text-[#0D9A55] cursor-pointer transition-colors"
          style={{
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {product.name}
        </h3>

        <p className="text-xs font-semibold text-[#0D9A55] mb-0.5">
          {product.company}
        </p>

        <p className="text-xs text-[#6B7280] leading-relaxed mb-1 line-clamp-2">
          {product.composition}
        </p>

        {/* Pack / Expiry */}
        <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-3">
          <span className="flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            {product.pack}
          </span>

          <span className="flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v11.25A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75Zm0 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            Exp: {product.expiry}
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-2 mb-4">
          <div>
            <p className="text-xs text-[#6B7280]">
              Net Rate
            </p>

            <p
              className="text-xl font-bold text-[#1C1C1E]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ₹{price.toFixed(2)}
            </p>
          </div>

          <p className="text-sm text-[#6B7280] line-through mb-0.5">
            ₹{product.mrp}
          </p>

          <p className="text-xs text-[#6B7280] mb-0.5">
            MRP
          </p>
        </div>

        {/* Actions */}
        <div className="mt-auto">

          {cartItem ? (
            /* =========================
               ALREADY IN CART
            ========================== */
            <div className="rounded-xl bg-[#E8F5EE] p-2.5">

              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    updateQty(
                      product.id,
                      cartItem.quantity - minQty
                    )
                  }
                  className="w-8 h-8 shrink-0 flex items-center justify-center bg-white text-[#0D9A55] hover:bg-[#0D9A55] hover:text-white rounded-lg transition-colors font-bold text-lg shadow-sm"
                >
                  −
                </button>

                <input
                  type="number"
                  min={1}
                  value={cartItem.quantity}
                  onChange={handleCartQtyChange}
                  className="w-16 h-8 text-center bg-white border border-[#0D9A55]/20 rounded-lg text-sm font-bold text-[#0D9A55] focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30"
                />

                <button
                  onClick={() =>
                    updateQty(
                      product.id,
                      cartItem.quantity + minQty
                    )
                  }
                  className="w-8 h-8 shrink-0 flex items-center justify-center bg-white text-[#0D9A55] hover:bg-[#0D9A55] hover:text-white rounded-lg transition-colors font-bold text-lg shadow-sm"
                >
                  +
                </button>

              </div>

              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-[11px] font-bold text-[#0D9A55]">
                  In Cart
                </span>

                <span className="text-[11px] text-[#6B7280]">
                  ₹{(
                    price * cartItem.quantity
                  ).toLocaleString()} total
                </span>
              </div>

            </div>
          ) : (
            /* =========================
               NOT IN CART
            ========================== */
            <div>

              <div className="flex items-center gap-2">

                {/* Minus */}
                <button
                 onClick={() =>
  setLocalQty((q) =>
    q === "" ? minQty : Math.max(minQty, q - minQty)
  )
}
                  className="w-9 h-9 shrink-0 flex items-center justify-center bg-[#F5F7F5] border border-black/[0.06] text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-xl transition-colors font-bold text-lg"
                >
                  −
                </button>

                {/* Editable quantity */}
             <input
  type="number"
  min={minQty}
  step={minQty}
  value={localQty}
  onChange={handleLocalQtyChange}
  onBlur={handleLocalQtyBlur}
  aria-label={`Quantity for ${product.name}`}
                  className="w-16 h-9 text-center bg-[#F5F7F5] border border-black/[0.08] rounded-xl text-sm font-bold text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55]"
                />

                {/* Plus */}
                <button
                  onClick={() =>
  setLocalQty((q) =>
    q === "" ? minQty : q + minQty
  )
}
                  className="w-9 h-9 shrink-0 flex items-center justify-center bg-[#F5F7F5] border border-black/[0.06] text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-xl transition-colors font-bold text-lg"
                >
                  +
                </button>

                {/* Add */}
                <button
                  onClick={handleAdd}
                  className="flex-1 min-w-0 h-9 bg-[#0D9A55] text-white text-sm font-semibold rounded-xl hover:bg-[#0A7A43] active:scale-95 transition-all duration-150 shadow-[0_2px_8px_rgba(13,154,85,0.25)]"
                >
                  Add to Cart
                </button>

              </div>

              {/* Quick quantity buttons */}
              {/* <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-[#9CA3AF] mr-0.5">
                  Quick:
                </span>

                {[10, 25, 50, 100].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setLocalQty(qty)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      localQty === qty
                        ? "bg-[#0D9A55] text-white"
                        : "bg-[#F5F7F5] text-[#6B7280] hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div> */}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function Catalogue() {
  const { products, cartItems, addToCart, updateQty, addToast, navigateToProduct } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [company, setCompany] = useState('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.company.toLowerCase().includes(q) || p.composition.toLowerCase().includes(q);
      const matchCat = category === 'All' || p.category === category;
      const matchCompany = company === 'All' || p.company === company;
      return matchSearch && matchCat && matchCompany;
    });
  }, [search, category, company, products]);

  const companies = useMemo(() => {
    return [...new Set(products.map(p => p.company))].sort();
  }, [products]);

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
              <span className="text-xs font-semibold text-[#0D9A55]">Live Best Rates · Updated Today</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1E] mb-3 leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
               Pharma Catalogue
            </h1>
            <p className="text-[#6B7280] text-lg mb-6">
              Trusted best rates for retail pharmacies — direct from distributor, no middlemen.
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
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
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
              <ProductCard key={product.id} product={product as ProductPricing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
