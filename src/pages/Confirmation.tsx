import { useApp } from '../context';

export default function Confirmation() {
  const { confirmedOrderId, navigate, orders } = useApp();
  const order = orders.find(o => o.id === confirmedOrderId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_48px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Green header */}
          <div className="relative bg-gradient-to-br from-[#0D9A55] to-[#0A7A43] px-8 py-10 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute w-64 h-64 rounded-full bg-white/10 -top-16 -right-16" />
              <div className="absolute w-40 h-40 rounded-full bg-white/10 -bottom-10 -left-10" />
            </div>
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Order Placed!</h1>
              <p className="text-white/80 text-sm">Your order has been received</p>
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6 p-4 bg-[#F5F7F5] rounded-2xl">
              <div>
                <p className="text-xs text-[#6B7280] font-medium">Order ID</p>
                <p className="font-bold text-[#1C1C1E] font-mono text-lg">{confirmedOrderId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#6B7280] font-medium">Status</p>
                <span className="inline-flex px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Submitted</span>
              </div>
            </div>

            {order && (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-[#1C1C1E] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>Items Ordered</h3>
                  <div className="flex flex-col gap-1.5">
                    {order.items.map(item => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">{item.productName} × {item.quantity}</span>
                        <span className="font-semibold text-[#1C1C1E]">₹{(item.rate * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-black/[0.06] mt-3 mb-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-[#0D9A55]">₹{order.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#E8F5EE] rounded-2xl mb-5">
                  <h3 className="text-sm font-bold text-[#0A7A43] mb-2">What happens next?</h3>
                  <ol className="flex flex-col gap-1.5">
                    {[
                      'Our team will review and confirm your order within 2 hours',
                      'You will receive an SMS/WhatsApp confirmation',
                      'Order will be packed and dispatched within 24 hours',
                      'Delivery to your shop within 1–2 business days',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#0A7A43]">
                        <span className="w-4 h-4 rounded-full bg-[#0D9A55] text-white text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate('tracking')}
                className="flex-1 py-3 border-2 border-[#0D9A55] text-[#0D9A55] rounded-2xl font-semibold text-sm hover:bg-[#E8F5EE] transition-colors"
              >
                Track Order
              </button>
              <button
                onClick={() => navigate('catalogue')}
                className="flex-1 py-3 bg-[#0D9A55] text-white rounded-2xl font-semibold text-sm hover:bg-[#0A7A43] transition-colors shadow-[0_4px_16px_rgba(13,154,85,0.3)]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
