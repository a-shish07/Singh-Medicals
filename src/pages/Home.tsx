
import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context";
import { PRODUCTS } from "../data";
import type { Category } from "../types";
import { fadeUp, fadeLeft, fadeRight, staggerContainer } from "../lib/motionVariants";

/* =========================================================
   DATA
========================================================= */

const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    shop: "Kumar Medical Store",
    city: "Padrauna",
    quote:
      "Best wholesale rates in the district. Same-day delivery and genuine stock every time. Been ordering for 4 years.",
    stars: 5,
  },
  {
    name: "Sanjay Gupta",
    shop: "Gupta Pharmacy",
    city: "Kushinagar",
    quote:
      "Very smooth ordering process. The net rates are competitive and they always honour the scheme offers on time.",
    stars: 5,
  },
  {
    name: "Meena Devi",
    shop: "New Life Medicals",
    city: "Deoria",
    quote:
      "Reliable supply of branded medicines. No shortage issues and the team is very responsive on WhatsApp.",
    stars: 5,
  },
  {
    name: "Prakash Singh",
    shop: "Singh Medical Agency",
    city: "Gorakhpur",
    quote:
      "Switched from another distributor 2 years ago. The pricing and service are genuinely better here.",
    stars: 4,
  },
];

const CATEGORIES: {
  label: Category;
  icon: React.ReactNode;
  desc: string;
  color: string;
}[] = [
  {
    label: "Tablets",
    desc: "Antibiotics, analgesics, chronic disease management",
    color: "from-emerald-50 to-green-100",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <rect
          x="4"
          y="10"
          width="24"
          height="12"
          rx="6"
          fill="#0D9A55"
          opacity="0.15"
        />
        <rect
          x="4"
          y="10"
          width="12"
          height="12"
          rx="6"
          fill="#0D9A55"
        />
        <rect
          x="16"
          y="10"
          width="12"
          height="12"
          rx="6"
          fill="#0D9A55"
          opacity="0.4"
        />
      </svg>
    ),
  },
  {
    label: "Syrups",
    desc: "Cough syrups, antacids, paediatric formulations",
    color: "from-blue-50 to-cyan-100",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <path
          d="M11 6h10l2 4H9l2-4z"
          fill="#0D9A55"
          opacity="0.5"
        />
        <rect
          x="9"
          y="10"
          width="14"
          height="16"
          rx="3"
          fill="#0D9A55"
          opacity="0.15"
        />
        <rect
          x="9"
          y="10"
          width="14"
          height="8"
          rx="3"
          fill="#0D9A55"
          opacity="0.4"
        />
      </svg>
    ),
  },
  {
    label: "Injections",
    desc: "IV fluids, antibiotics, vitamins in injectable form",
    color: "from-purple-50 to-violet-100",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <path
          d="M6 26L18 14l3 3L9 29 6 26z"
          fill="#0D9A55"
          opacity="0.4"
        />
        <rect
          x="16"
          y="6"
          width="4"
          height="14"
          rx="2"
          transform="rotate(45 16 6)"
          fill="#0D9A55"
        />
        <circle
          cx="24"
          cy="8"
          r="3"
          fill="#0D9A55"
          opacity="0.3"
        />
      </svg>
    ),
  },
  {
    label: "Eye Drops",
    desc: "Antibiotics, lubricants, anti-inflammatory drops",
    color: "from-amber-50 to-orange-100",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
        <ellipse
          cx="16"
          cy="16"
          rx="12"
          ry="8"
          fill="#0D9A55"
          opacity="0.15"
        />
        <circle
          cx="16"
          cy="16"
          r="5"
          fill="#0D9A55"
          opacity="0.4"
        />
        <circle cx="16" cy="16" r="2.5" fill="#0D9A55" />
        <path
          d="M16 6v4M16 22v4M6 16h4M22 16h4"
          stroke="#0D9A55"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: "Do I need to register to place an order?",
    a: "Yes, a one-time registration with your drug licence number is required. Login is quick via mobile OTP — no passwords needed.",
  },
  {
    q: "What is the minimum order value?",
    a: "There is no minimum order for registered pharmacy retailers. Order any quantity at wholesale net rates.",
  },
  {
    q: "How soon will my order be dispatched?",
    a: "Orders confirmed before 12 PM are typically dispatched same day. Delivery to Padrauna and nearby areas is same day; other UP districts take 1-2 working days.",
  },
  {
    q: "Are scheme offers automatically applied?",
    a: "Yes, all active scheme offers are applied automatically at the net rate shown. No separate coupon needed.",
  },
];
/* =========================================================
   STAR ICON
========================================================= */

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${
        filled ? "text-amber-400" : "text-gray-200"
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/* =========================================================
   MINI PRODUCT CARD
========================================================= */

function MiniProductCard({
  product,
}: {
  product: (typeof PRODUCTS)[0];
}) {
  const { navigateToProduct } = useApp();

  const disc = Math.round(
    ((product.mrp - product.net) / product.mrp) * 100
  );

  return (
    <motion.button
      onClick={() => navigateToProduct(product.id)}
      whileHover={{
        y: -7,
        scale: 1.015,
      }}
      whileTap={{
        scale: 0.98,
      }}
      className="group flex w-52 shrink-0 flex-col rounded-3xl border border-black/[0.05] bg-white p-4 text-left shadow-[0_3px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_14px_35px_rgba(0,0,0,0.11)]"
    >
      {/* Product visual */}
      <div className="relative mb-4 flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8F5EE] to-[#F5F9F6]">
        <motion.div
          whileHover={{
            scale: 1.12,
            rotate: 4,
          }}
          transition={{
            duration: 0.3,
          }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"
        >
          <svg
            className="h-6 w-6 text-[#0D9A55]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.7}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .3 2.7-1.1 2.7H3.9c-1.4 0-2.1-1.7-1.1-2.7L4.2 15.3"
            />
          </svg>
        </motion.div>

       
      </div>

      <p className="mb-0.5 line-clamp-2 text-sm font-bold leading-snug text-[#1C1C1E]">
        {product.name}
      </p>

      <p className="mb-3 text-xs font-semibold text-[#0D9A55]">
        {product.company}
      </p>

      <div className="mt-auto flex items-baseline gap-1.5">
        <span className="text-base font-extrabold text-[#1C1C1E]">
          ₹{product.net}
        </span>

        <span className="text-xs text-[#9CA3AF] line-through">
          ₹{product.mrp}
        </span>

        <span className="ml-auto rounded-lg bg-[#E8F5EE] px-1.5 py-0.5 text-[10px] font-bold text-[#0D9A55]">
          {disc}% OFF
        </span>
      </div>
    </motion.button>
  );
}

/* =========================================================
   ACCORDION
========================================================= */

function AccordionItem({
  q,
  a,
}: {
  q: string;
  a: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/[0.06] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span
          className={`text-sm font-semibold transition-colors duration-200 ${
            open
              ? "text-[#0D9A55]"
              : "text-[#1C1C1E] group-hover:text-[#0D9A55]"
          }`}
        >
          {q}
        </span>

        <motion.span
          animate={{
            rotate: open ? 180 : 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F5EE] text-[#0D9A55]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19 9-7 7-7-7"
            />
          </svg>
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm leading-6 text-[#6B7280]">
          {a}
        </p>
      </motion.div>
    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const { navigate } = useApp();

  const featured = PRODUCTS.filter(
    (p) =>
      (p.mrp - p.net) / p.mrp > 0.25
  ).slice(0, 8);

  return (
    <div className="min-h-screen overflow-hidden bg-[#F8FAF8]">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-white">

        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{
              x: [0, 25, 0],
              y: [0, -20, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-32 -top-40 h-[620px] w-[620px] rounded-full bg-gradient-to-br from-[#0D9A55]/15 to-[#12B060]/[0.02] blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -20, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -left-28 top-48 h-[300px] w-[300px] rounded-full bg-[#0D9A55]/[0.06] blur-3xl"
          />

          {/* Dots */}
          <div className="absolute right-[8%] top-24 hidden grid-cols-5 gap-2 opacity-30 lg:grid">
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  opacity: [0.15, 0.65, 0.15],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.05,
                  repeat: Infinity,
                }}
                className="h-1.5 w-1.5 rounded-full bg-[#0D9A55]"
              />
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

            {/* LEFT */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >

              {/* Badge */}
              <motion.div variants={fadeUp}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0D9A55]/10 bg-[#E8F5EE] px-4 py-2 shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0D9A55] opacity-50" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#0D9A55]" />
                  </span>

                  <span className="text-xs font-bold tracking-wide text-[#0D9A55]">
                    Live Wholesale Rates · Updated Daily
                  </span>
                </div>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={fadeUp}
                className="mb-5 text-4xl font-extrabold leading-[1.04] tracking-tight text-[#1C1C1E] sm:text-5xl lg:text-6xl"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Wholesale Pharma
                <br />
                <span className="relative text-[#0D9A55]">
                  You Can Trust.
                  <motion.span
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: "75%",
                    }}
                    transition={{
                      delay: 1,
                      duration: 0.8,
                    }}
                    className="absolute -bottom-1 left-0 h-1 rounded-full bg-[#0D9A55]/20"
                  />
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="mb-8 max-w-xl text-base leading-7 text-[#6B7280] sm:text-lg"
              >
                Direct wholesale rates for registered pharmacies across
                Eastern UP.{" "}
                <span className="font-semibold text-[#374151]">
                  500+ products
                </span>
                , genuine stock, and same-day dispatch from Padrauna.
              </motion.p>

              {/* Buttons */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <motion.button
                  onClick={() => navigate("catalogue")}
                  whileHover={{
                    y: -3,
                    scale: 1.015,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="group flex items-center justify-center gap-2 rounded-2xl bg-[#0D9A55] px-7 py-3.5 text-sm font-bold text-white shadow-[0_7px_25px_rgba(13,154,85,0.30)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(13,154,85,0.42)]"
                >
                  Browse Catalogue

                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14m-6-6 6 6-6 6"
                    />
                  </svg>
                </motion.button>

                <motion.a
                  href="https://wa.me/919876543210?text=Hi%20Singh%20Medical%20Stores%2C%20I%20want%20to%20place%20a%20wholesale%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{
                    y: -3,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="group flex items-center justify-center gap-2 rounded-2xl border-2 border-[#0D9A55]/20 bg-white px-7 py-3.5 text-sm font-bold text-[#0D9A55] transition-all duration-300 hover:border-[#0D9A55] hover:bg-[#E8F5EE]"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.198.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>

                  Order via WhatsApp
                </motion.a>
              </motion.div>

              {/* Trust points */}
              <motion.div
                variants={fadeUp}
                className="mt-7 flex flex-wrap gap-x-6 gap-y-2"
              >
                {[
                  "Genuine stock",
                  "Wholesale pricing",
                  "Same-day dispatch",
                ].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280]"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E8F5EE] text-[9px] font-bold text-[#0D9A55]">
                      ✓
                    </span>
                    {item}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT HERO VISUAL */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative hidden h-[400px] lg:block"
            >
              {/* Main glow */}
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.5, 0.75, 0.5],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0D9A55]/10 blur-3xl"
              />

              {/* Floating pill */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 3, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-10 top-5 flex h-11 w-24 items-center justify-center rounded-full bg-[#0D9A55] shadow-[0_8px_25px_rgba(13,154,85,0.3)]"
              >
                <span className="text-xs font-bold text-white">
                  500+ Products
                </span>
              </motion.div>

              {/* Floating box */}
              <motion.div
                animate={{
                  y: [0, 12, 0],
                  rotate: [0, -3, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute left-8 top-16 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#0D9A55]/10 bg-white shadow-[0_8px_25px_rgba(0,0,0,0.08)]"
              >
                <svg
                  className="h-7 w-7 text-[#0D9A55]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 7.5 7.5 4 7.5-4M12 11.5V21"
                  />
                </svg>
              </motion.div>

              {/* Main order card */}
              <motion.div
                animate={{
                  y: [0, -7, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 z-10 w-64 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-black/[0.04] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5EE]">
                    <svg
                      className="h-5 w-5 text-[#0D9A55]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#0D9A55]">
                      Order Placed
                    </p>
                    <p className="text-[10px] text-[#9CA3AF]">
                      ORD-2024-108
                    </p>
                  </div>

                  <span className="ml-auto rounded-full bg-[#E8F5EE] px-2 py-1 text-[9px] font-bold text-[#0D9A55]">
                    CONFIRMED
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    ["Augmentin 625", "×5"],
                    ["Dolo 650", "×10"],
                    ["Pan 40", "×3"],
                  ].map(([name, qty]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-[#6B7280]">
                        {name}
                      </span>
                      <span className="text-xs font-bold text-[#374151]">
                        {qty}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
                  <span className="text-xs text-[#6B7280]">
                    Wholesale Total
                  </span>

                  <span className="text-lg font-extrabold text-[#0D9A55]">
                    ₹1,826
                  </span>
                </div>
              </motion.div>

              {/* Bottom floating card */}
              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.7,
                }}
                className="absolute bottom-12 left-10 z-20 flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-white px-4 py-3 shadow-[0_8px_25px_rgba(0,0,0,0.09)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F5EE] text-[#0D9A55]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.7}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#1C1C1E]">
                    Same-day dispatch
                  </p>
                  <p className="text-[10px] text-[#9CA3AF]">
                    From Padrauna
                  </p>
                </div>
              </motion.div>

              {/* Decorative circle */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute right-12 bottom-5 h-24 w-24 rounded-full border border-dashed border-[#0D9A55]/20"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST STRIP
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#0D9A55]">
        <motion.div
          animate={{
            x: ["-10%", "110%"],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute top-0 h-full w-32 bg-white/[0.04] blur-2xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.3,
            }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              {
                num: "500+",
                label: "Products In Stock",
              },
              {
                num: "200+",
                label: "Retail Pharmacies",
              },
              {
                num: "Same Day",
                label: "Dispatch from Padrauna",
              },
              {
                num: "25+ yrs",
                label: "Trusted Since 1998",
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                whileHover={{
                  y: -2,
                }}
                className="flex flex-col items-center py-2 text-center text-white"
              >
                <span
                  className="text-xl font-extrabold sm:text-2xl"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {stat.num}
                </span>

                <span className="mt-0.5 text-[10px] font-medium text-white/65 sm:text-xs">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
          }}
          variants={fadeUp}
          className="mb-10"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0D9A55]">
            Browse By Category
          </p>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <h2
              className="text-3xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-4xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Every category,
              <br />
              <span className="text-[#0D9A55]">
                wholesale rates.
              </span>
            </h2>

            <button
              onClick={() => navigate("catalogue")}
              className="group flex items-center gap-1 text-sm font-bold text-[#0D9A55]"
            >
              View all products
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.15,
          }}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.label}
              variants={fadeUp}
              onClick={() => navigate("catalogue")}
              whileHover={{
                y: -7,
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${cat.color} p-6 text-left shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-shadow duration-300 hover:shadow-[0_14px_35px_rgba(0,0,0,0.09)]`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                }}
                className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm"
              >
                {cat.icon}
              </motion.div>

              <h3
                className="mb-1 text-lg font-extrabold text-[#1C1C1E]"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {cat.label}
              </h3>

              <p className="text-xs leading-relaxed text-[#6B7280]">
                {cat.desc}
              </p>

              <div className="mt-5 flex items-center gap-1 text-xs font-bold text-[#0D9A55]">
                Browse

                <svg
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="border-y border-black/[0.05] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            variants={fadeUp}
            className="mb-12 text-center"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0D9A55]">
              Simple Process
            </p>

            <h2
              className="text-3xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-4xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Order in 3 simple steps
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6B7280]">
              From finding the right medicine to getting it dispatched,
              we keep wholesale ordering simple.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            className="relative grid grid-cols-1 gap-10 sm:grid-cols-3"
          >
            {/* Connecting line */}
            <div className="absolute left-[16.5%] right-[16.5%] top-10 hidden border-t-2 border-dashed border-[#0D9A55]/15 sm:block" />

            {[
              {
                step: "01",
                title: "Browse Catalogue",
                desc: "Filter by category, company, or search by name. See live net rates, MRP, discount %, and scheme offers.",
                icon: (
                  <svg
                    className="h-7 w-7 text-[#0D9A55]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Add to Cart",
                desc: "Select quantities with the stepper. Cart is saved across the session so you can browse and come back.",
                icon: (
                  <svg
                    className="h-7 w-7 text-[#0D9A55]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Checkout or WhatsApp",
                desc: "Place the order online and get a confirmed order ID, or share your cart directly to WhatsApp.",
                icon: (
                  <svg
                    className="h-7 w-7 text-[#0D9A55]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                    />
                  </svg>
                ),
              },
            ].map((step) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <motion.div
                  whileHover={{
                    y: -5,
                    scale: 1.04,
                  }}
                  className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E8F5EE] shadow-[0_5px_20px_rgba(13,154,85,0.10)]"
                >
                  {step.icon}

                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#0D9A55] text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(13,154,85,0.3)]">
                    {step.step}
                  </span>
                </motion.div>

                <h3
                  className="mb-2 text-lg font-extrabold text-[#1C1C1E]"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {step.title}
                </h3>

                <p className="max-w-xs text-sm leading-6 text-[#6B7280]">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FEATURED PRODUCTS
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
          }}
          variants={fadeUp}
          className="mb-8 flex items-end justify-between gap-4"
        >
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0D9A55]">
              Best Deals
            </p>

            <h2
              className="text-3xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-4xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Featured Products
            </h2>

            <p className="mt-2 text-sm text-[#6B7280]">
              Popular medicines at competitive wholesale rates.
            </p>
          </div>

          <button
            onClick={() => navigate("catalogue")}
            className="group hidden items-center gap-1 text-sm font-bold text-[#0D9A55] sm:flex"
          >
            View All

            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m13.5 4.5 7.5 7.5m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </motion.div>

        <div
          className="-mx-4 overflow-x-auto px-4 pb-5 sm:-mx-6 sm:px-6"
          style={{
            scrollbarWidth: "none",
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
            }}
            whileInView={{
              opacity: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
            }}
            className="flex gap-4"
          >
            {featured.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{
                  opacity: 0,
                  x: 25,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                }}
              >
                <MiniProductCard
                  product={p}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="mt-2 text-center sm:hidden">
          <button
            onClick={() => navigate("catalogue")}
            className="text-sm font-bold text-[#0D9A55]"
          >
            View all products →
          </button>
        </div>
      </section>

      {/* =====================================================
          TESTIMONIALS
      ====================================================== */}

      <section className="border-y border-black/[0.05] bg-[#F5F7F5]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            variants={fadeUp}
            className="mb-12 text-center"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0D9A55]">
              What Retailers Say
            </p>

            <h2
              className="text-3xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-4xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Trusted by pharmacies
              <br />
              <span className="text-[#0D9A55]">
                across Eastern UP
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                whileHover={{
                  y: -6,
                }}
                className="group rounded-3xl border border-black/[0.04] bg-white p-6 shadow-[0_3px_16px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_14px_35px_rgba(0,0,0,0.09)]"
              >
                {/* Quote icon */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({
                      length: 5,
                    }).map((_, i) => (
                      <StarIcon
                        key={i}
                        filled={i < t.stars}
                      />
                    ))}
                  </div>

                  <span className="text-2xl font-serif leading-none text-[#0D9A55]/15">
                    "
                  </span>
                </div>

                <p className="mb-6 text-sm italic leading-6 text-[#374151]">
                  “{t.quote}”
                </p>

                <div className="flex items-center gap-3 border-t border-black/[0.06] pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5EE] text-sm font-extrabold text-[#0D9A55]">
                    {t.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#1C1C1E]">
                      {t.name}
                    </p>

                    <p className="truncate text-xs text-[#6B7280]">
                      {t.shop}, {t.city}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          WHY CHOOSE US
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={fadeLeft}
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0D9A55]">
              Why Singh Medical
            </p>

            <h2
              className="mb-5 text-3xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-4xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              The distributor that
              <br />
              <span className="text-[#0D9A55]">
                treats you like a partner.
              </span>
            </h2>

            <p className="mb-7 max-w-xl leading-7 text-[#6B7280]">
              Since 1998, we have served retail pharmacies across
              Kushinagar, Gorakhpur, Deoria, and surrounding districts
              with genuine branded medicines at fair net rates.
            </p>

            <motion.button
              onClick={() => navigate("about")}
              whileHover={{
                x: 4,
              }}
              className="group flex items-center gap-2 text-sm font-bold text-[#0D9A55]"
            >
              Discover Our Story

              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m13.5 4.5 7.5 7.5m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </motion.button>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              {
                icon: "✓",
                title: "Genuine Stock Only",
                desc: "All products sourced directly from authorised C&F agents. No parallel imports.",
              },
              {
                icon: "₹",
                title: "Competitive Net Rates",
                desc: "Wholesale rates revised weekly. Best rates on bulk orders for regular retailers.",
              },
              {
                icon: "⚡",
                title: "Same-Day Dispatch",
                desc: "Orders placed before 12 PM are dispatched the same day from our Padrauna warehouse.",
              },
              {
                icon: "↺",
                title: "Easy Reorder",
                desc: "Your order history is saved. Reorder previous lists in one click with updated pricing.",
              },
            ].map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                whileHover={{
                  y: -5,
                }}
                className="group rounded-3xl border border-black/[0.05] bg-white p-5 shadow-[0_3px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-[#0D9A55]/10 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
              >
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    rotate: 4,
                  }}
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5EE] text-lg font-extrabold text-[#0D9A55]"
                >
                  {v.icon}
                </motion.div>

                <h3 className="mb-1.5 text-sm font-extrabold text-[#1C1C1E]">
                  {v.title}
                </h3>

                <p className="text-xs leading-5 text-[#6B7280]">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ====================================================== */}

      <section className="border-t border-black/[0.05] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            variants={fadeUp}
            className="mb-10 text-center"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0D9A55]">
              Common Questions
            </p>

            <h2
              className="text-3xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-4xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Quick answers
            </h2>

            <p className="mt-3 text-sm text-[#6B7280]">
              Everything you need to know before placing your first order.
            </p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
            }}
            className="rounded-3xl border border-black/[0.05] bg-[#F8FAF8] px-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:px-7"
          >
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.q}
                q={item.q}
                a={item.a}
              />
            ))}
          </motion.div>

          <div className="mt-7 text-center">
            <motion.button
              whileHover={{
                y: -2,
              }}
              onClick={() => navigate("faq")}
              className="text-sm font-bold text-[#0D9A55]"
            >
              View All FAQs →
            </motion.button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#0D9A55]">

        {/* Decorative blobs */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/[0.07] blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/[0.05] blur-3xl"
        />

        {/* Rings */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute right-[7%] top-1/2 hidden h-56 w-56 -translate-y-1/2 rounded-full border border-white/10 md:block"
        >
          <div className="absolute inset-8 rounded-full border border-white/[0.08]" />
          <div className="absolute inset-16 rounded-full border border-white/[0.07]" />
        </motion.div>

        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />

              <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/90">
                Your trusted wholesale partner
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Ready to start ordering?
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mx-auto mb-8 max-w-xl text-sm leading-6 text-white/75 sm:text-base"
            >
              Register your pharmacy today. Get access to exclusive net
              rates, saved order history, and priority dispatch.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col justify-center gap-3 sm:flex-row"
            >
              <motion.button
                onClick={() => navigate("login")}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-[#0D9A55] shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-shadow duration-300 hover:shadow-[0_14px_35px_rgba(0,0,0,0.2)]"
              >
                Login / Register

                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m13.5 4.5 7.5 7.5m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </motion.button>

              <motion.button
                onClick={() => navigate("catalogue")}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="rounded-2xl border-2 border-white/30 px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
              >
                Browse as Guest
              </motion.button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/60"
            >
              <span>✓ Free registration</span>
              <span>✓ Wholesale pricing</span>
              <span>✓ Same-day dispatch</span>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}