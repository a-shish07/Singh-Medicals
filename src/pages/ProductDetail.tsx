import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../context";
import type { Product } from "../types";
import { pageVariants, itemVariants, staggerContainer } from "../lib/motionVariants";

function parseProductImages(image?: string) {
  if (!image) return [];
  try {
    const parsed = JSON.parse(image);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string" && value.length > 0)
      : [image];
  } catch {
    return [image];
  }
}

/* =========================================================
   ICONS
========================================================= */

function MedicineIcon({ size = "large" }: { size?: "small" | "large" }) {
  return (
    <svg
      className={size === "large" ? "h-14 w-14 text-[#0D9A55]" : "h-5 w-5 text-[#0D9A55]"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.4}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .3 2.7-1.1 2.7H3.9c-1.4 0-2.1-1.7-1.1-2.7L4.2 15.3"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1-1.5 0Z"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4.5 6v5.5c0 4.65 3.15 8.8 7.5 9.95 4.35-1.15 7.5-5.3 7.5-9.95V6L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.5 12 1.7 1.7 3.6-3.7" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A1.5 1.5 0 0 1 4.5 6h9A1.5 1.5 0 0 1 15 7.5v9H3v-9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10h3.3a1.5 1.5 0 0 1 1.2.6l1.5 2V16.5H15V10Z" />
      <circle cx="7" cy="17" r="1.75" />
      <circle cx="18" cy="17" r="1.75" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 7.5 7.5 4 7.5-4M12 11.5V21" />
    </svg>
  );
}

/* =========================================================
   PRODUCT DETAIL
========================================================= */

export default function ProductDetail() {
  const { selectedProductId, navigate, navigateToProduct, cartItems, addToCart, updateQty, addToast } = useApp();
  const { products } = useApp();

  const product = products.find((p) => p.id === selectedProductId);

  const [localQty, setLocalQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  /* =======================================================
     PRODUCT NOT FOUND
  ====================================================== */

  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[70vh] items-center justify-center bg-[#F8FAF8] px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-3xl border border-black/[0.05] bg-white p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.07)]"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F5EE]">
            <MedicineIcon />
          </div>

          <h2 className="mb-2 text-xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Product not found
          </h2>

          <p className="mb-6 text-sm text-[#6B7280]">
            The product you're looking for may no longer be available.
          </p>

          <button
            onClick={() => navigate("catalogue")}
            className="rounded-xl bg-[#0D9A55] px-6 py-3 text-sm font-bold text-white shadow-[0_5px_18px_rgba(13,154,85,0.25)] transition-all hover:bg-[#0A7A43]"
          >
            Back to Catalogue
          </button>
        </motion.div>
      </motion.div>
    );
  }

  /* =======================================================
     DATA
  ====================================================== */

  const effectivePrice = (product: Product) => product.effectivePtr ?? product.net;

  const currentPrice = effectivePrice(product);
  const productImages = parseProductImages(product.image);
  const activeImage = productImages[activeImageIndex] || productImages[0];

  const discPct =
    product.mrp > 0 ? Math.max(0, Math.round(((Number(product.mrp) - currentPrice) / Number(product.mrp)) * 100)) : 0;

  const cartItem = cartItems.find((item) => item.productId === product.id);

  const similar = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.company === product.company))
    .slice(0, 6);

  /* =======================================================
     HANDLERS
  ====================================================== */

  const handleAdd = () => {
    addToCart(product.id, localQty);
    addToast(`${product.name} added to cart`);
    setLocalQty(1);
  };

  const decreaseLocalQty = () => setLocalQty((q) => Math.max(1, q - 1));
  const increaseLocalQty = () => setLocalQty((q) => q + 1);

  /* =======================================================
     RENDER
  ====================================================== */

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#F8FAF8] pb-20 md:pb-0"
    >
      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b border-black/[0.05] bg-white"
      >
        <div className="mx-auto max-w-6xl px-4 py-3.5 sm:px-6">
          <nav className="flex items-center gap-2 overflow-hidden text-xs">
            <button onClick={() => navigate("home")} className="flex shrink-0 items-center gap-1 text-[#9CA3AF] transition-colors hover:text-[#0D9A55]">
              Home
            </button>
            <span className="text-[#D1D5DB]">/</span>
            <button onClick={() => navigate("catalogue")} className="shrink-0 text-[#9CA3AF] transition-colors hover:text-[#0D9A55]">
              {product.category}
            </button>
            <span className="text-[#D1D5DB]">/</span>
            <span className="truncate font-semibold text-[#1C1C1E]">{product.name}</span>
          </nav>
        </div>
      </motion.div>

      {/* =====================================================
          MAIN PRODUCT
      ====================================================== */}

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.05fr] lg:items-start"
        >
          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <motion.div variants={itemVariants} className="lg:sticky lg:top-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.04] bg-gradient-to-br from-[#E8F5EE] via-[#F7FAF8] to-white shadow-[0_8px_35px_rgba(0,0,0,0.06)]">
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0D9A55]/10 blur-3xl"
              />

              <div className="relative flex aspect-square min-h-[300px] items-center justify-center sm:min-h-[380px]">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute inset-5 rounded-[2rem] bg-[#0D9A55]/10 blur-2xl" />

                  <div className="relative flex h-56 w-56 items-center justify-center rounded-[2rem] border border-black/[0.04] bg-white shadow-[0_15px_45px_rgba(0,0,0,0.10)] sm:h-[24rem] sm:w-[24rem]">
                    {activeImage ? (
                      <img src={activeImage} alt={product.name} className="h-full w-full rounded-[2rem] object-contain p-4 sm:p-5" />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#E8F5EE] sm:h-28 sm:w-28">
                        <MedicineIcon />
                      </div>
                    )}
                  </div>
                </motion.div>

                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-4 flex max-w-[65%] gap-2 overflow-x-auto rounded-xl bg-white/80 p-2 shadow-sm backdrop-blur-sm">
                    {productImages.map((image, index) => (
                      <button
                        key={`${image.slice(0, 30)}-${index}`}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === image ? "border-[#0D9A55]" : "border-transparent"}`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img src={image} alt="" className="h-full w-full object-contain bg-white" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl border border-[#0D9A55]/10 bg-white/90 px-3 py-2 text-[10px] font-bold text-[#0D9A55] shadow-[0_5px_18px_rgba(0,0,0,0.08)] backdrop-blur-sm">
                  <CheckIcon />
                  Genuine Stock
                </div>
              </div>
            </div>

            {/* Trust strip — inline, not boxed */}
            <div className="mt-4 flex items-center justify-between gap-3 px-1 text-[#6B7280]">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-[#0D9A55]"><ShieldIcon /></span> Authorised source
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-[#0D9A55]"><TruckIcon /></span> Same-day dispatch
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-[#0D9A55]"><PackageIcon /></span> Secure packing
              </span>
            </div>
          </motion.div>

          {/* =================================================
              PRODUCT INFO — everything important, once
          ================================================= */}

          <motion.div variants={itemVariants} className="flex flex-col">
            {/* Category + discount */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#9CA3AF]">{product.category}</span>
              {discPct > 0 && (
                <>
                  <span className="text-[#D1D5DB]">·</span>
                  <span className="text-xs font-bold text-[#0D9A55]">Save {discPct}% on MRP</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-3xl font-extrabold leading-[1.1] tracking-tight text-[#1C1C1E] sm:text-4xl"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {product.name}
            </h1>

            {/* Company + composition, said once */}
            <p className="mt-2 text-base font-bold text-[#0D9A55]">{product.company}</p>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">{product.composition}</p>

            {/* Price — the single most important number, given room but not a big card */}
            <div className="mt-5 flex flex-wrap items-baseline gap-2.5 border-t border-black/[0.06] pt-5">
              <span className="text-4xl font-extrabold tracking-tight text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                ₹{effectivePrice(product).toLocaleString()}
              </span>
              {product.mrp > currentPrice && (
                <span className="text-lg text-[#9CA3AF] line-through">₹{product.mrp.toLocaleString()}</span>
              )}
              {discPct > 0 && (
                <span className="rounded-lg bg-[#E8F5EE] px-2 py-1 text-[10px] font-extrabold text-[#0D9A55]">{discPct}% OFF</span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#9CA3AF]">Wholesale net rate per pack</p>

            {/* Pack size + expiry — inline meta, no boxes */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#0D9A55]"><PackageIcon /></span>
                <span className="font-semibold text-[#1C1C1E]">{product.pack}</span>
              </span>
              <span className="text-[#D1D5DB]">·</span>
              <span>
                Expiry <span className="font-semibold text-[#1C1C1E]">{product.expiry}</span>
              </span>
            </div>

            {/* =============================================
                CART ACTION
            ============================================== */}

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {cartItem ? (
                  <motion.div
                    key="in-cart"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[#E8F5EE] p-3"
                  >
                    <div className="flex items-center gap-2 pl-1">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D9A55] text-white">
                        <CheckIcon />
                      </span>
                      <div>
                        <p className="text-sm font-extrabold text-[#0D9A55]">In cart</p>
                        <p className="text-xs text-[#6B7280]">
                          {cartItem.quantity} unit{cartItem.quantity !== 1 ? "s" : ""} · ₹{(effectivePrice(product) * cartItem.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-2xl bg-white p-1 shadow-sm">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQty(product.id, cartItem.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold text-[#0D9A55] transition-colors hover:bg-[#E8F5EE]"
                      >
                        −
                      </motion.button>
                      <span className="w-8 text-center text-sm font-extrabold text-[#1C1C1E]">{cartItem.quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQty(product.id, cartItem.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold text-[#0D9A55] transition-colors hover:bg-[#E8F5EE]"
                      >
                        +
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="add-cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
                    <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-black/[0.07] bg-white p-1 shadow-[0_2px_8px_rgba(0,0,0,0.035)]">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={decreaseLocalQty}
                        className="flex h-10 w-9 items-center justify-center rounded-xl text-xl font-bold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                      >
                        −
                      </motion.button>
                      <span className="w-9 text-center text-sm font-extrabold text-[#1C1C1E]">{localQty}</span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={increaseLocalQty}
                        className="flex h-10 w-9 items-center justify-center rounded-xl text-xl font-bold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                      >
                        +
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAdd}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0D9A55] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_7px_22px_rgba(13,154,85,0.28)] transition-all duration-300 hover:bg-[#0A7A43] hover:shadow-[0_10px_30px_rgba(13,154,85,0.35)]"
                    >
                      <CartIcon />
                      <span>Add to Cart — ₹{(effectivePrice(product) * localQty).toLocaleString()}</span>
                      <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                      </svg>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={() => navigate("cart")} className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-bold text-[#6B7280] transition-colors hover:text-[#0D9A55]">
                View Cart
                <span>→</span>
              </button>
            </div>

            {/* =============================================
                ADDITIONAL INFO — only what isn't said above
            ============================================== */}

            <div className="mt-8 space-y-3 border-t border-black/[0.06] pt-6 text-sm">
              <div className="flex items-start gap-2 text-[#6B7280]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F5EE] text-[#0D9A55]">
                  <CheckIcon />
                </span>
                <span>Sourced from an authorised C&amp;F agent.</span>
              </div>
              <div className="flex items-start gap-2 text-[#6B7280]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F5EE] text-[#0D9A55]">
                  <CheckIcon />
                </span>
                <span>Store below 25°C, away from direct sunlight and moisture. Keep out of reach of children.</span>
              </div>
              <div className="flex items-start gap-2 text-[#6B7280]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F5EE] text-[#0D9A55]">
                  <CheckIcon />
                </span>
                <span>GST applicable as per pharmaceutical product rates — check with your accountant for input credit.</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* =====================================================
            SIMILAR PRODUCTS
        ====================================================== */}

        {similar.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.6 }}
            className="mt-14"
          >
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Similar Products
              </h2>

              <button onClick={() => navigate("catalogue")} className="hidden text-xs font-bold text-[#0D9A55] transition-colors hover:text-[#0A7A43] sm:block">
                View All →
              </button>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 pb-5 sm:-mx-6 sm:px-6" style={{ scrollbarWidth: "none" }}>
              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="flex gap-4">
                {similar.map((p) => {
                  const pCurrentPrice = p.effectivePtr ?? p.net;
                  const disc = p.mrp > 0 ? Math.max(0, Math.round(((p.mrp - pCurrentPrice) / p.mrp) * 100)) : 0;

                  return (
                    <motion.button
                      key={p.id}
                      variants={itemVariants}
                      whileHover={{ y: -7, scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigateToProduct(p.id)}
                      className="group w-52 shrink-0 rounded-3xl border border-black/[0.04] bg-white p-4 text-left shadow-[0_3px_14px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_14px_32px_rgba(0,0,0,0.10)]"
                    >
                      <div className="relative mb-4 flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8F5EE] to-[#F5F8F5]">
                        <motion.div whileHover={{ scale: 1.12, rotate: 4 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <MedicineIcon size="small" />
                        </motion.div>
                      </div>

                      <p className="mb-1 line-clamp-2 text-sm font-extrabold leading-snug text-[#1C1C1E]">{p.name}</p>
                      <p className="mb-3 truncate text-xs font-semibold text-[#0D9A55]">{p.company}</p>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-[#1C1C1E]">₹{pCurrentPrice.toLocaleString()}</span>
                        <span className="text-xs text-[#9CA3AF] line-through">₹{p.mrp.toLocaleString()}</span>
                        <span className="ml-auto rounded-lg bg-[#E8F5EE] px-1.5 py-0.5 text-[9px] font-extrabold text-[#0D9A55]">{disc}%</span>
                      </div>

                      <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#0D9A55] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        View Product
                        <span>→</span>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>

            <button onClick={() => navigate("catalogue")} className="mt-1 block w-full text-center text-xs font-bold text-[#0D9A55] sm:hidden">
              View all products →
            </button>
          </motion.section>
        )}
      </main>

      {/* =====================================================
          MOBILE STICKY CART
      ====================================================== */}

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.07] bg-white/95 px-3 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.09)] backdrop-blur-xl md:hidden"
      >
        <AnimatePresence mode="wait">
          {cartItem ? (
            <motion.div key="mobile-cart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-2">
              <div className="flex shrink-0 items-center gap-1 rounded-xl bg-[#E8F5EE] px-2 py-1.5">
                <button onClick={() => updateQty(product.id, cartItem.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-bold text-[#0D9A55]">
                  −
                </button>
                <span className="w-7 text-center text-xs font-extrabold text-[#0D9A55]">{cartItem.quantity}</span>
                <button onClick={() => updateQty(product.id, cartItem.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-bold text-[#0D9A55]">
                  +
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("cart")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0D9A55] py-3 text-xs font-extrabold text-white shadow-[0_5px_15px_rgba(13,154,85,0.25)]"
              >
                <CartIcon />
                Go to Cart · ₹{(effectivePrice(product) * cartItem.quantity).toLocaleString()}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="mobile-add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-2">
              <div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-black/[0.07] bg-[#F5F7F5]">
                <button onClick={decreaseLocalQty} className="flex h-10 w-8 items-center justify-center text-lg font-bold text-[#6B7280]">
                  −
                </button>
                <span className="w-7 text-center text-xs font-bold">{localQty}</span>
                <button onClick={increaseLocalQty} className="flex h-10 w-8 items-center justify-center text-lg font-bold text-[#6B7280]">
                  +
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0D9A55] py-3 text-xs font-extrabold text-white shadow-[0_5px_15px_rgba(13,154,85,0.25)]"
              >
                <CartIcon />
                Add to Cart · ₹{(effectivePrice(product) * localQty).toLocaleString()}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}