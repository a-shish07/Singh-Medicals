import { useState } from 'react';
import { useApp } from '../context';
import type { OrderStatus } from '../types';

const STEPS: OrderStatus[] = ['Submitted', 'Confirmed', 'Packed', 'Dispatched', 'Delivered'];

const STEP_DESC: Record<string, string> = {
  Submitted: 'Order received and under review.',
  Confirmed: 'Order confirmed. Picking started.',
  Packed: 'All items packed and invoice ready.',
  Dispatched: 'Order handed to delivery partner.',
  Delivered: 'Order delivered successfully.',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  Submitted: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Packed: 'bg-purple-100 text-purple-700',
  Dispatched: 'bg-cyan-100 text-cyan-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function Tracking() {
  const { orders, navigate } = useApp();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<typeof orders[0] | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    const found = orders.find(o =>
      o.id.toLowerCase() === orderId.trim().toLowerCase() &&
      o.retailerPhone.replace(/\D/g, '').endsWith(phone.trim().replace(/\D/g, '').slice(-10))
    );
    if (found) {
      setResult(found);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const currentStepIndex = result ? STEPS.indexOf(result.status as OrderStatus) : -1;

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F5EE] rounded-full mb-4">
          <svg className="w-4 h-4 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          <span className="text-xs font-semibold text-[#0D9A55]">Public Order Tracking</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1C1C1E] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>Track Your Order</h1>
        <p className="text-[#6B7280] text-sm">Enter your Order ID and registered phone number to see the current status.</p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={e => { setOrderId(e.target.value); setNotFound(false); }}
              placeholder="e.g. ORD-2024-001"
              className="w-full px-4 py-3 bg-[#F5F7F5] border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all placeholder:text-[#9CA3AF] font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">Registered Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setNotFound(false); }}
              placeholder="10-digit mobile number"
              className="w-full px-4 py-3 bg-[#F5F7F5] border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all placeholder:text-[#9CA3AF]"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!orderId.trim() || !phone.trim()}
            className="py-3 bg-[#0D9A55] text-white font-bold rounded-xl hover:bg-[#0A7A43] transition-all shadow-[0_4px_16px_rgba(13,154,85,0.3)] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Track Order →
          </button>
        </div>

        <p className="text-xs text-[#9CA3AF] mt-3 text-center">
          Demo: try <span className="font-mono font-semibold">ORD-2024-001</span> with phone <span className="font-mono font-semibold">9876543210</span>
        </p>
      </div>

      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center mb-6 animate-fade-in">
          <p className="font-semibold text-red-700 text-sm">No order found</p>
          <p className="text-red-500 text-xs mt-1">Please check the Order ID and phone number and try again.</p>
        </div>
      )}

      {result && (
        <div className="animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-6 mb-4">
            <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
              <div>
                <p className="font-mono font-bold text-xl text-[#1C1C1E]">{result.id}</p>
                <p className="text-sm text-[#6B7280]">{result.retailerShop} · {new Date(result.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_COLORS[result.status]}`}>
                {result.status}
              </span>
            </div>

            {/* Timeline */}
            {result.status !== 'Cancelled' ? (
              <div className="relative">
                {STEPS.map((step, idx) => {
                  const done = idx <= currentStepIndex;
                  const active = idx === currentStepIndex;
                  return (
                    <div key={step} className="flex gap-4 pb-6 last:pb-0 relative">
                      {idx < STEPS.length - 1 && (
                        <div className={`absolute left-4 top-8 w-0.5 h-full -translate-x-0.5 ${done ? 'bg-[#0D9A55]' : 'bg-[#E5E7EB]'}`} />
                      )}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${active ? 'bg-[#0D9A55] shadow-[0_0_0_4px_rgba(13,154,85,0.2)]' : done ? 'bg-[#0D9A55]' : 'bg-[#E5E7EB]'}`}>
                        {done ? (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-white/60" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={`font-semibold text-sm ${done ? 'text-[#1C1C1E]' : 'text-[#9CA3AF]'}`}>{step}</p>
                        <p className={`text-xs mt-0.5 ${active ? 'text-[#0D9A55] font-medium' : done ? 'text-[#6B7280]' : 'text-[#D1D5DB]'}`}>{STEP_DESC[step]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 flex items-center gap-3 text-red-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p className="font-semibold text-sm">Order Cancelled</p>
                  <p className="text-xs text-red-400 mt-0.5">This order was cancelled. Contact us for more information.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-5">
            <h3 className="font-bold text-sm text-[#6B7280] uppercase tracking-wide mb-3">Order Items</h3>
            <div className="divide-y divide-black/[0.05]">
              {result.items.map(item => (
                <div key={item.productId} className="flex justify-between items-center py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-[#1C1C1E]">{item.productName}</p>
                    <p className="text-xs text-[#9CA3AF]">Qty: {item.quantity} × ₹{item.rate}</p>
                  </div>
                  <span className="font-bold text-[#1C1C1E]">₹{(item.quantity * item.rate).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 font-bold">
                <span className="text-[#1C1C1E]">Order Total</span>
                <span className="text-lg text-[#0D9A55]">₹{result.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={() => { setResult(null); setOrderId(''); setPhone(''); }} className="flex-1 py-3 border-2 border-[#0D9A55] text-[#0D9A55] rounded-xl font-semibold text-sm hover:bg-[#E8F5EE] transition-colors">
              Track Another
            </button>
            <button onClick={() => navigate('catalogue')} className="flex-1 py-3 bg-[#0D9A55] text-white rounded-xl font-semibold text-sm hover:bg-[#0A7A43] transition-colors">
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
