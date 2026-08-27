import { useApp } from '../context';
import { PRODUCTS } from '../data';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, cartTotal, navigate, addToast } = useApp();

  const whatsappOrder = () => {
    const msg = `Hi Singh Medical Stores, I want to place a wholesale order.\n\nItems:\n${cartItems.map(i => {
      const p = PRODUCTS.find(x => x.id === i.productId);
      return `• ${p?.name} (${p?.pack}) × ${i.quantity} = ₹${((p?.net ?? 0) * i.quantity).toLocaleString()}`;
    }).join('\n')}\n\nTotal: ₹${cartTotal.toLocaleString()}`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-24 px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#0D9A55]/10 blur-3xl scale-150" />
          <div className="relative w-24 h-24 rounded-2xl bg-[#E8F5EE] flex items-center justify-center">
            <svg className="w-12 h-12 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>Your cart is empty</h2>
        <p className="text-[#6B7280] mb-8">Browse the catalogue and add medicines to place a wholesale order.</p>
        <button
          onClick={() => navigate('catalogue')}
          className="px-6 py-3 bg-[#0D9A55] text-white rounded-2xl font-semibold hover:bg-[#0A7A43] transition-colors shadow-[0_4px_16px_rgba(13,154,85,0.3)]"
        >
          Browse Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-[#1C1C1E] mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Your Cart <span className="text-[#6B7280] text-lg font-medium ml-2">({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {cartItems.map(item => {
            const product = PRODUCTS.find(p => p.id === item.productId);
            if (!product) return null;
            const lineTotal = product.net * item.quantity;
            return (
              <div key={item.productId} className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .3 2.7-1.1 2.7H3.9c-1.4 0-2.1-1.7-1.1-2.7L4.2 15.3" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#1C1C1E] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>{product.name}</h3>
                  <p className="text-xs text-[#6B7280]">{product.company} · {product.pack}</p>
                  <p className="text-xs text-[#0D9A55] font-semibold mt-0.5">₹{product.net} per pack</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => { removeFromCart(item.productId); addToast(`${product.name} removed from cart`, 'info'); }}
                    className="text-[#9CA3AF] hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1 bg-[#F5F7F5] rounded-xl border border-black/[0.06]">
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-[#6B7280] hover:text-[#0D9A55] transition-colors font-bold"
                    >−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-[#6B7280] hover:text-[#0D9A55] transition-colors font-bold"
                    >+</button>
                  </div>

                  <p className="text-base font-bold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    ₹{lineTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 sticky top-28">
            <h2 className="font-bold text-[#1C1C1E] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Order Summary</h2>

            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} units)</span>
                <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">GST</span>
                <span className="text-[#6B7280] text-xs">Calculated at confirmation</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Freight</span>
                <span className="text-[#6B7280] text-xs">Calculated at confirmation</span>
              </div>
              <div className="h-px bg-black/[0.06] my-1" />
              <div className="flex justify-between">
                <span className="font-bold text-[#1C1C1E]">Subtotal</span>
                <span className="text-xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={whatsappOrder}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#0D9A55] text-[#0D9A55] rounded-2xl font-semibold hover:bg-[#E8F5EE] transition-colors text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Order via WhatsApp
              </button>
              <button
                onClick={() => navigate('checkout')}
                className="px-4 py-3 bg-[#0D9A55] text-white rounded-2xl font-semibold hover:bg-[#0A7A43] transition-colors shadow-[0_4px_16px_rgba(13,154,85,0.3)] text-sm"
              >
                Place Order / Checkout →
              </button>
            </div>

            <button
              onClick={() => navigate('catalogue')}
              className="w-full mt-3 text-center text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
