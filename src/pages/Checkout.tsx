import { useState } from 'react';
import { useApp } from '../context';
import { PRODUCTS } from '../data';

export default function Checkout() {
  const { cartItems, cartTotal, placeOrder, navigate, isLoggedIn } = useApp();
  const [form, setForm] = useState({ shopName: isLoggedIn ? 'Kumar Medical Store' : '', address: isLoggedIn ? 'Shop 12, Gandhi Market, Padrauna, UP 274304' : '', contact: isLoggedIn ? '9876543210' : '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.shopName.trim()) e.shopName = 'Shop name is required';
    if (!form.address.trim()) e.address = 'Delivery address is required';
    if (!form.contact.trim() || !/^\d{10}$/.test(form.contact.trim())) e.contact = 'Enter a valid 10-digit mobile number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      placeOrder(form);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#6B7280]">Your cart is empty. Add products before checking out.</p>
        <button onClick={() => navigate('catalogue')} className="px-5 py-2.5 bg-[#0D9A55] text-white rounded-xl font-semibold hover:bg-[#0A7A43] transition-colors">Browse Catalogue</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('cart')} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        Back to Cart
      </button>

      <h1 className="text-2xl font-extrabold text-[#1C1C1E] mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6">
            <h2 className="font-bold text-[#1C1C1E] mb-5 flex items-center gap-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <span className="w-6 h-6 rounded-full bg-[#0D9A55] text-white text-xs flex items-center justify-center font-bold">1</span>
              Delivery Details
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">Shop / Pharmacy Name *</label>
                <input
                  type="text"
                  value={form.shopName}
                  onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                  placeholder="e.g. Kumar Medical Store"
                  className={`w-full px-4 py-3 bg-[#F5F7F5] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all ${errors.shopName ? 'border-red-400' : 'border-black/[0.08]'}`}
                />
                {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">Delivery Address *</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Shop number, street, city, PIN code..."
                  rows={3}
                  className={`w-full px-4 py-3 bg-[#F5F7F5] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all resize-none ${errors.address ? 'border-red-400' : 'border-black/[0.08]'}`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">Contact Number *</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-3 bg-[#F5F7F5] border border-black/[0.08] rounded-xl text-sm text-[#6B7280] font-medium">+91</div>
                  <input
                    type="tel"
                    value={form.contact}
                    onChange={e => setForm(f => ({ ...f, contact: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="10-digit mobile"
                    className={`flex-1 px-4 py-3 bg-[#F5F7F5] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all ${errors.contact ? 'border-red-400' : 'border-black/[0.08]'}`}
                  />
                </div>
                {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
              </div>

              <div className="mt-2 p-3 bg-[#E8F5EE] rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 text-[#0D9A55] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                <p className="text-xs text-[#0A7A43]">GST and freight charges will be calculated and communicated at order confirmation. Final invoice will be shared before dispatch.</p>
              </div>

              <button
                type="submit"
                className="mt-2 w-full py-3.5 bg-[#0D9A55] text-white rounded-2xl font-bold hover:bg-[#0A7A43] active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(13,154,85,0.3)]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Confirm Order →
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 sticky top-28">
            <h2 className="font-bold text-[#1C1C1E] mb-4 flex items-center gap-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <span className="w-6 h-6 rounded-full bg-[#0D9A55] text-white text-xs flex items-center justify-center font-bold">2</span>
              Order Summary
            </h2>

            <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
              {cartItems.map(item => {
                const product = PRODUCTS.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex justify-between items-start text-sm gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1C1C1E] truncate">{product.name}</p>
                      <p className="text-xs text-[#6B7280]">×{item.quantity} @ ₹{product.net}</p>
                    </div>
                    <span className="font-semibold shrink-0">₹{(product.net * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-black/[0.06] mb-3" />
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#6B7280]">Subtotal</span>
              <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#6B7280]">GST</span>
              <span className="text-[#6B7280] text-xs">TBD</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-[#6B7280]">Freight</span>
              <span className="text-[#6B7280] text-xs">TBD</span>
            </div>
            <div className="h-px bg-black/[0.06] mb-3" />
            <div className="flex justify-between">
              <span className="font-bold">Payable Now</span>
              <span className="text-xl font-extrabold text-[#0D9A55]" style={{ fontFamily: "'DM Sans', sans-serif" }}>₹{cartTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
