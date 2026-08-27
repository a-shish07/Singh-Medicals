import { useApp } from '../context';
import { PRODUCTS } from '../data';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQty, cartTotal, addToast, navigate } = useApp();

  return (
    <>
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-[−24px_0_48px_rgba(0,0,0,0.12)] flex flex-col transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06]">
          <h2 className="text-lg font-bold text-[#1C1C1E]">Your Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-16">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#E8F5EE] flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-full bg-[#0D9A55]/10 blur-xl -z-10 scale-150" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#1C1C1E]">Your cart is empty</p>
                <p className="text-sm text-[#6B7280] mt-1">Browse the catalogue to add products</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2 bg-[#0D9A55] text-white rounded-xl text-sm font-semibold hover:bg-[#0A7A43] transition-colors"
              >
                Browse Catalogue
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cartItems.map(item => {
                const product = PRODUCTS.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex items-start gap-3 p-4 bg-[#F5F7F5] rounded-2xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#1C1C1E] leading-tight">{product.name}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{product.company} · {product.pack}</p>
                      <p className="text-sm font-bold text-[#0D9A55] mt-1">₹{product.net} <span className="font-normal text-[#6B7280]">× {item.quantity}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-1 bg-white rounded-xl border border-black/[0.08]">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#0D9A55] hover:bg-[#E8F5EE] rounded-l-xl transition-colors font-bold"
                        >−</button>
                        <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#0D9A55] hover:bg-[#E8F5EE] rounded-r-xl transition-colors font-bold"
                        >+</button>
                      </div>
                      <p className="text-sm font-bold text-[#1C1C1E]">₹{(product.net * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="px-6 py-5 border-t border-black/[0.06] bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#6B7280]">Subtotal</span>
              <span className="text-xl font-bold text-[#1C1C1E]">₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const msg = `Hi, I want to place a wholesale order. Total: ₹${cartTotal.toLocaleString()}. Items: ${cartItems.map(i => { const p = PRODUCTS.find(x => x.id === i.productId); return `${p?.name} ×${i.quantity}`; }).join(', ')}`;
                  window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#0D9A55] text-[#0D9A55] rounded-2xl font-semibold hover:bg-[#E8F5EE] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Order via WhatsApp
              </button>
              <button
                onClick={() => { setIsCartOpen(false); navigate('checkout'); }}
                className="px-4 py-3 bg-[#0D9A55] text-white rounded-2xl font-semibold hover:bg-[#0A7A43] transition-colors shadow-[0_4px_16px_rgba(13,154,85,0.3)]"
              >
                Place Order / Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
