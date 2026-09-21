import { useEffect, useState, useMemo } from "react";
import { useApp } from "../context";
import type { Product } from "../types";
import { calculateCart, calculateLine } from "../lib/pricing";

function effectivePrice(product: Product) {
  const value = (product as Product & { effectivePtr?: number | null }).effectivePtr;
  return Number.isFinite(Number(value)) ? Number(value) : Number(product.net || 0);
}

type CheckoutForm = {
  shopName: string;
  address: string;
  contact: string;
};

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; } }

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(); script.onerror = () => reject(new Error('Secure payment checkout could not be loaded.'));
    document.head.appendChild(script);
  });
}

export default function Checkout() {
  const {
    cartItems,
    placeOrder,
    navigate,
    isLoggedIn,
    customerProfile,
    refreshCustomerProfile,
    addToast,
    products,
    startOnlinePayment,
    confirmOnlinePayment,
    cancelOrder,
  } = useApp();

  const [form, setForm] = useState<CheckoutForm>({
    shopName: "",
    address: "",
    contact: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('COD');

  const checkout = useMemo(() => calculateCart(products, cartItems), [cartItems, products]);
  const subtotal = checkout.subtotal;
const checkoutTotal = checkout.grandTotal;
  // Load the customer's latest profile
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!isLoggedIn) {
        setLoadingProfile(false);
        return;
      }

      try {
        const profile = await refreshCustomerProfile();

        if (cancelled) return;

        if (profile) {
          setForm({
            shopName: profile.shopName || "",
            address: [
              profile.address,
              profile.city,
              profile.state,
              profile.pincode,
            ]
              .filter(Boolean)
              .join(", "),
            contact: profile.phone || "",
          });
        }
      } catch (error) {
        console.error("Failed to load checkout profile:", error);
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, refreshCustomerProfile]);

  const updateField = (
    field: keyof CheckoutForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    // Remove error as the user fixes the field
    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.shopName.trim()) {
      nextErrors.shopName = "Shop / Pharmacy name is required";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Delivery address is required";
    }

    if (!form.contact.trim()) {
      nextErrors.contact = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.contact.trim())) {
      nextErrors.contact = "Enter a valid 10-digit mobile number";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isLoggedIn) {
      addToast("Please sign in before placing an order.", "info");
      navigate("login");
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setPlacingOrder(true);

      const details = {
        shopName: form.shopName.trim(),
        address: form.address.trim(),
        contact: form.contact.trim(),
      };
      if (paymentMethod === 'COD') {
        await placeOrder(details);
        return;
      }
      const session = await startOnlinePayment(details);
      await loadRazorpay();
      if (!window.Razorpay) throw new Error('Secure payment checkout is unavailable.');
      new window.Razorpay({
        key: session.razorpay.keyId, order_id: session.razorpay.orderId, amount: session.razorpay.amount, currency: session.razorpay.currency,
        name: 'Singh Medicals', description: `Order ${session.orderId}`,
        prefill: { name: form.shopName, contact: form.contact },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try { await confirmOnlinePayment(response); }
          catch { addToast("We're verifying your payment. Please check your orders before trying again.", 'info'); }
        },
        modal: {
  ondismiss: async () => {
    try {
      await cancelOrder(
        session.orderId,
        'Customer cancelled Razorpay payment'
      );

      addToast(
        'Payment cancelled. The order has been cancelled and stock has been restored.',
        'info'
      );
    } catch (error) {
      console.error('Failed to cancel cancelled Razorpay order:', error);

      addToast(
        'Payment was not completed. Your order will be reconciled automatically.',
        'info'
      );
    }
  },
},
        theme: { color: '#0D9A55' },
      }).open();
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Could not place order.",
        "error"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 rounded-2xl bg-[#E8F5EE] flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[#0D9A55]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </div>

        <p className="text-[#6B7280] text-center">
          Your cart is empty. Add products before checking out.
        </p>

        <button
          onClick={() => navigate("catalogue")}
          className="px-5 py-2.5 bg-[#0D9A55] text-white rounded-xl font-semibold hover:bg-[#0A7A43] transition-colors"
        >
          Browse Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("cart")}
        className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back to Cart
      </button>

      <div className="mb-6">
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Checkout
        </h1>

        <p className="text-sm text-[#6B7280] mt-1">
          Review your delivery details and place your order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Delivery Details */}
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 sm:p-6">
            <h2
              className="font-bold text-[#1C1C1E] mb-5 flex items-center gap-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <span className="w-7 h-7 rounded-full bg-[#0D9A55] text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Delivery Details
            </h2>

            {loadingProfile ? (
              <div className="py-8 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-[#0D9A55]/20 border-t-[#0D9A55] rounded-full animate-spin" />
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                {/* Shop */}
                <div>
                  <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">
                    Shop / Pharmacy Name *
                  </label>

                  <input
                    type="text"
                    value={form.shopName}
                    onChange={(event) =>
                      updateField(
                        "shopName",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Singh Medical Store"
                    className={`w-full px-4 py-3 bg-[#F5F7F5] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all ${
                      errors.shopName
                        ? "border-red-400"
                        : "border-black/[0.08]"
                    }`}
                  />

                  {errors.shopName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.shopName}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">
                    Delivery Address *
                  </label>

                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      updateField(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="Shop number, street, city, state, PIN code..."
                    rows={4}
                    className={`w-full px-4 py-3 bg-[#F5F7F5] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all resize-none ${
                      errors.address
                        ? "border-red-400"
                        : "border-black/[0.08]"
                    }`}
                  />

                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#1C1C1E] mb-1.5">
                    Contact Number *
                  </label>

                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 bg-[#F5F7F5] border border-black/[0.08] rounded-xl text-sm text-[#6B7280] font-medium">
                      +91
                    </div>

                    <input
                      type="tel"
                      value={form.contact}
                      onChange={(event) =>
                        updateField(
                          "contact",
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10)
                        )
                      }
                      placeholder="10-digit mobile"
                      className={`flex-1 px-4 py-3 bg-[#F5F7F5] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all ${
                        errors.contact
                          ? "border-red-400"
                          : "border-black/[0.08]"
                      }`}
                    />
                  </div>

                  {errors.contact && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.contact}
                    </p>
                  )}
                </div>

                {/* Profile info */}
                <div className="p-3 bg-[#F5F7F5] rounded-xl">
                  <p className="text-xs text-[#6B7280]">
                    These details are taken from your profile. You
                    can update them here for this order.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method */}
          {/* Payment Method */}
<div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 sm:p-6">
  <h2
    className="font-bold text-[#1C1C1E] mb-5 flex items-center gap-2"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    <span className="w-7 h-7 rounded-full bg-[#0D9A55] text-white text-xs flex items-center justify-center font-bold">
      2
    </span>
    Payment Method
  </h2>

  <div className="flex flex-col gap-3">

    {/* COD */}
    <button
      type="button"
      onClick={() => setPaymentMethod("COD")}
      className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
        paymentMethod === "COD"
          ? "border-[#0D9A55] bg-[#E8F5EE]"
          : "border-black/[0.08] bg-white hover:border-[#0D9A55]/40"
      }`}
    >
      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
          <span className="text-xl">💵</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#1C1C1E]">
                Cash on Delivery
              </h3>

              <p className="text-xs text-[#6B7280] mt-1">
                Pay when your order is delivered
              </p>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === "COD"
                  ? "border-[#0D9A55] bg-[#0D9A55]"
                  : "border-[#9CA3AF]"
              }`}
            >
              {paymentMethod === "COD" && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12l4 4L19 6"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>

    {/* Online Payment */}
    <button
      type="button"
      onClick={() => setPaymentMethod("RAZORPAY")}
      className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
        paymentMethod === "RAZORPAY"
          ? "border-[#0D9A55] bg-[#E8F5EE]"
          : "border-black/[0.08] bg-white hover:border-[#0D9A55]/40"
      }`}
    >
      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
          <span className="text-xl">💳</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#1C1C1E]">
                Pay Online
              </h3>

              <p className="text-xs text-[#6B7280] mt-1">
                UPI, Credit/Debit Card, Net Banking
              </p>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === "RAZORPAY"
                  ? "border-[#0D9A55] bg-[#0D9A55]"
                  : "border-[#9CA3AF]"
              }`}
            >
              {paymentMethod === "RAZORPAY" && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12l4 4L19 6"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>

  </div>
</div>

          {/* Notice */}
          <div className="p-4 bg-[#FFF9E8] border border-[#F1D98A] rounded-2xl flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#A07800] shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <div>
              <p className="text-sm font-semibold text-[#6B7280]">
                GST & Freight
              </p>

              <p className="text-xs text-[#7A6A32] mt-0.5">
                Prices exclude GST. GST is 5%; freight is ₹45 for a subtotal
                of ₹4,000 or less and free above ₹4,000.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — SUMMARY */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 sticky top-28">
            <h2
              className="font-bold text-[#1C1C1E] mb-4 flex items-center gap-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <span className="w-7 h-7 rounded-full bg-[#0D9A55] text-white text-sm flex items-center justify-center font-bold">
                3
              </span>
              Order Summary
            </h2>

            {/* Items */}
            <div className="flex flex-col gap-3 mb-4 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const product = products.find(
                  (product) => product.id === item.productId
                );

                if (!product) return null;

                const line = calculateLine(product, item.quantity);
                const lineTotal = line.taxableAmount;

                return (
                  <div
                    key={item.productId}
                    className="flex justify-between items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1C1C1E] text-base truncate">
                        {product.name}
                      </p>

                      <p className="text-sm text-[#6B7280] mt-0.5">
                        {product.pack} × {item.quantity} paid
                        {line.freeQuantityEarned + line.bonusStrips > 0
                          ? line.isSameProductOffer
                            ? ` + ${line.freeQuantityEarned} free = ${line.totalStrips} total`
                            : ` + ${line.bonusStrips} bonus free`
                          : ""}
                      </p>
                      <p className="text-[12px] text-[#0D9A55] mt-0.5">
                        Effective rate: ₹{line.pricePerPaidStrip.toFixed(2)}
                      </p>
                    </div>

                    <span className="font-semibold text-sm shrink-0">
                      ₹{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-black/[0.06] mb-3" />

            {/* Totals */}
            <div className="flex justify-between text-base mb-1">
              <span className="text-[#404349]">
                Subtotal
              </span>

             <span className="font-semibold">
  ₹{subtotal.toFixed(2)}
</span>
            </div>

            <div className="flex justify-between text-base mb-1">
              <span className="text-[#494d54]">
                GST (5%)
              </span>

              <span className="text-[#121213] text-base ">
                ₹{checkout.gst.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-base mb-3">
              <span className="text-[#6B7280]">
                Freight
              </span>

              <span className="text-[#101010] text-base">
                {checkout.shipping === 0 ? "FREE" : `₹${checkout.shipping.toFixed(2)}`}
              </span>
            </div>

            <div className="h-px bg-black/[0.06] mb-3" />

            <div className="flex justify-between items-end gap-3">
              <div>
                <p className="font-bold text-[#1C1C1E]">
                  Order Value
                </p>

                <p className="text-xs text-[#6B7280] mt-0.5">
                  {paymentMethod === 'COD'  ? "Confirm COD Order →"
  : `Pay ₹${checkoutTotal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Online →`}
                </p>
              </div>

              <span
                className="text-2xl font-extrabold text-[#0D9A55]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                ₹{checkoutTotal.toLocaleString()}
              </span>
            </div>

            {/* Confirm */}
            <button
              onClick={handleSubmit}
              disabled={
                placingOrder || loadingProfile
              }
              className="mt-5 w-full py-3.5 bg-[#0D9A55] text-white rounded-2xl font-bold hover:bg-[#0A7A43] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(13,154,85,0.3)]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {placingOrder ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </span>
              ) : (
                paymentMethod === 'COD' ? "Confirm COD Order →" : `Pay ₹${checkoutTotal.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} Online →`
              )}
            </button>

            <p className="text-[11px] text-center text-[#9CA3AF] mt-3">
              {paymentMethod === 'COD' ? 'You will pay when the order is delivered.' : 'Payment is confirmed only after secure server verification.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
