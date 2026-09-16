import { useApp } from '../context';
import { finalOrderItemPrice } from '../lib/pricing';

type OrderItemWithOffer = {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;

  paidQuantity?: number;
  freeQuantity?: number;
  totalQuantity?: number;
  isFree?: boolean;
};

export default function Confirmation() {
  const { confirmedOrderId, navigate, orders, products } = useApp();

  const order = orders.find(
    (o) => o.id === confirmedOrderId
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_48px_rgba(0,0,0,0.08)] overflow-hidden">

          {/* Green Header */}
          <div className="relative bg-gradient-to-br from-[#0D9A55] to-[#0A7A43] px-8 py-10 text-center overflow-hidden">

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute w-64 h-64 rounded-full bg-white/10 -top-16 -right-16" />
              <div className="absolute w-40 h-40 rounded-full bg-white/10 -bottom-10 -left-10" />
            </div>

            <div className="relative">

              {/* Success Icon */}
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-9 h-9 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h1
                className="text-2xl font-extrabold text-white mb-1"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Order Placed!
              </h1>

              <p className="text-white/80 text-sm">
                Your order has been received
              </p>

            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">

            {/* Order ID + Status */}
            <div className="flex items-center justify-between mb-6 p-4 bg-[#F5F7F5] rounded-2xl">

              <div>
                <p className="text-xs text-[#6B7280] font-medium">
                  Order ID
                </p>

                <p className="font-bold text-[#1C1C1E] font-mono text-lg">
                  {confirmedOrderId}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-[#6B7280] font-medium">
                  Status
                </p>

                <span className="inline-flex px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  Submitted
                </span>
              </div>

            </div>

            {order && (
              <>

                {/* Items */}
                <div className="mb-4">

                  <h3
                    className="text-base font-bold text-[#1C1C1E] mb-3"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Items Ordered
                  </h3>

                  <div className="flex flex-col">

                    {order.items.map((rawItem) => {
                      const item =
                        rawItem as typeof rawItem &
                          OrderItemWithOffer;

                      /*
                       * Paid quantity
                       * Backend stores this as paidQuantity.
                       * quantity is kept as fallback for older orders.
                       */
                      const paidQuantity = Number(
                        item.paidQuantity ??
                          item.quantity ??
                          0
                      );

                      /*
                       * Free quantity from the offer.
                       */
                      const freeQuantity = Number(
                        item.freeQuantity ?? 0
                      );

                      /*
                       * Total physical quantity received.
                       */
                      const totalQuantity = Number(
                        item.totalQuantity ??
                          paidQuantity + freeQuantity
                      );

                      /*
                       * IMPORTANT:
                       * item.rate is the Effective PTR / Net Rate
                       * used by Catalogue and backend.
                       *
                       * Amount charged is ONLY:
                       * Effective PTR × Paid Quantity
                       *
                       * Free quantity is NOT charged.
                       */
                      const effectivePtr = finalOrderItemPrice(
                        products.find((product) => product.id === item.productId),
                        paidQuantity,
                        item.rate
                      );

                      const chargedAmount =
                        effectivePtr * paidQuantity;

                      return (
                        <div
                          key={item.productId}
                          className="py-3 border-b border-black/[0.06] last:border-0"
                        >

                          {/* Product + Amount */}
                          <div className="flex justify-between items-start gap-3">

                            <div className="min-w-0">
                              <p className="text-base font-semibold text-[#1C1C1E]">
                                {item.productName}
                              </p>
                            </div>

                            <span className="font-bold text-[#1C1C1E] shrink-0">
                              ₹
                              {chargedAmount.toLocaleString(
                                'en-IN',
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>

                          </div>

                          {/* Quantity Information */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm">

                            {/* Paid */}
                            <span className="text-[#6B7280]">
                              Paid:{' '}
                              <strong className="text-[#1C1C1E]">
                                {paidQuantity}
                              </strong>
                            </span>

                            {/* Free */}
                            {freeQuantity > 0 && (
                              <span className="text-[#0D9A55] font-bold">
                                Free:{' '}
                                {freeQuantity}
                              </span>
                            )}

                            {/* Total */}
                            {freeQuantity > 0 && (
                              <span className="text-[#6B7280]">
                                Total:{' '}
                                <strong className="text-[#1C1C1E]">
                                  {totalQuantity}
                                </strong>
                              </span>
                            )}

                          </div>

                          {/* Effective PTR */}
                          <div className="flex items-center gap-2 mt-1.5">

                            <span className="text-[13px] text-[#6B7280]">
                              Effective PTR:
                            </span>

                            <span className="text-[11px] font-bold text-[#0D9A55]">
                              ₹
                              {effectivePtr.toLocaleString(
                                'en-IN',
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>

                            {freeQuantity > 0 && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                BUY {paidQuantity > 0
                                  ? Math.floor(
                                      paidQuantity /
                                      Math.max(
                                        1,
                                        paidQuantity
                                      )
                                    )
                                  : 0}{' '}
                                OFFER
                              </span>
                            )}

                          </div>

                        </div>
                      );
                    })}

                  </div>

                  {/* Order Total */}
                  <div className="h-px bg-black/[0.06] mt-3 mb-3" />

                  <div className="flex justify-between items-center font-bold">

                    <span className="text-[#1C1C1E]">
                      Total
                    </span>

                    <span className="text-[#0D9A55] text-lg">
                      ₹
                      {Number(order.total || 0).toLocaleString(
                        'en-IN',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>

                  </div>

                </div>

                {/* What Happens Next */}
                <div className="p-4 bg-[#E8F5EE] rounded-2xl mb-5">

                  <h3 className="text-sm font-bold text-[#0A7A43] mb-2">
                    What happens next?
                  </h3>

                  <ol className="flex flex-col gap-1.5">

                    {[
                      'Our team will review and confirm your order within 2 hours',
                      'You will receive an SMS/WhatsApp confirmation',
                      'Order will be packed and dispatched within 24 hours',
                      'Delivery to your shop within 1–2 business days',
                    ].map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-[#0A7A43]"
                      >

                        <span className="w-4 h-4 rounded-full bg-[#0D9A55] text-white text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                          {i + 1}
                        </span>

                        {step}

                      </li>
                    ))}

                  </ol>

                </div>

              </>
            )}

            {/* Buttons */}
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
