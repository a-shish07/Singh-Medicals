import { useApp } from "../context";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    products,
    removeFromCart,
    updateQty,
    cartTotal,
    navigate,
  } = useApp();

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[101] flex h-full w-full max-w-md flex-col bg-white shadow-[-24px_0_48px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#1C1C1E]">
              Your Cart
            </h2>

            {cartItems.length > 0 && (
              <p className="mt-0.5 text-xs text-[#6B7280]">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? "item" : "items"} in your cart
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#1C1C1E]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {cartItems.length === 0 ? (
            /* Empty cart */
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-16">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#E8F5EE]">
                  <svg
                    className="h-10 w-10 text-[#0D9A55]"
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

                <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-[#0D9A55]/10 blur-xl" />
              </div>

              <div className="text-center">
                <p className="font-semibold text-[#1C1C1E]">
                  Your cart is empty
                </p>

                <p className="mt-1 text-sm text-[#6B7280]">
                  Browse the catalogue to add products
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-xl bg-[#0D9A55] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A7A43]"
              >
                Browse Catalogue
              </button>
            </div>
          ) : (
            /* Cart items */
            <div className="space-y-3">
              {cartItems.map((item) => {
                const product = products.find(
                  (p) => p.id === item.productId
                );

                if (!product) return null;

                const lineTotal =
                  (product.net ?? 0) * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="rounded-2xl border border-black/[0.06] bg-[#F8FAF8] p-3.5 transition-colors hover:border-[#0D9A55]/20"
                  >
                    <div className="flex gap-3">
                      {/* Product image */}
                      <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-white">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#E8F5EE]">
                            <svg
                              className="h-8 w-8 text-[#0D9A55]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v12m6-6H6"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product information */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-bold leading-snug text-[#1C1C1E]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-[#6B7280]">
                              {product.company}
                              {product.pack
                                ? ` · ${product.pack}`
                                : ""}
                            </p>
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item.productId)
                            }
                            aria-label={`Remove ${product.name}`}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.8}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Price + quantity */}
                        <div className="mt-3 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-[#0D9A55]">
                              ₹{(product.net ?? 0).toLocaleString()}
                            </p>

                            <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                              per unit
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Quantity */}
                            <div className="flex items-center overflow-hidden rounded-xl border border-black/[0.08] bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center text-base font-bold text-[#0D9A55] transition-colors hover:bg-[#E8F5EE]"
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>

                              <span className="flex h-8 w-8 items-center justify-center text-sm font-semibold text-[#1C1C1E]">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center text-base font-bold text-[#0D9A55] transition-colors hover:bg-[#E8F5EE]"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            {/* Line total */}
                            <p className="min-w-[62px] text-right text-sm font-bold text-[#1C1C1E]">
                              ₹{lineTotal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom checkout section */}
        {cartItems.length > 0 && (
          <div className="border-t border-black/[0.06] bg-white px-5 pb-5 pt-4 sm:px-6">
            {/* Subtotal */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">
                  Subtotal
                </p>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                  Taxes and delivery calculated at checkout
                </p>
              </div>

              <span className="text-xl font-bold text-[#1C1C1E]">
                ₹{cartTotal.toLocaleString()}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const msg = `Hi, I want to place a wholesale order.\n\n${cartItems
                    .map((item) => {
                      const p = products.find(
                        (x) => x.id === item.productId
                      );

                      return p
                        ? `${p.name} × ${item.quantity} — ₹${(
                            (p.net ?? 0) * item.quantity
                          ).toLocaleString()}`
                        : "";
                    })
                    .filter(Boolean)
                    .join("\n")}\n\nTotal: ₹${cartTotal.toLocaleString()}`;

                  window.open(
                    `https://wa.me/919876543210?text=${encodeURIComponent(
                      msg
                    )}`,
                    "_blank"
                  );
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#0D9A55] px-4 py-3 text-sm font-semibold text-[#0D9A55] transition-colors hover:bg-[#E8F5EE]"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371.074-.52.075-.149-.075-.371-.25-.52-.075-.149-.075-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>

                Order via WhatsApp
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate("checkout");
                }}
                className="rounded-2xl bg-[#0D9A55] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(13,154,85,0.3)] transition-colors hover:bg-[#0A7A43]"
              >
                Place Order / Checkout
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}