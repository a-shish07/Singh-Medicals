
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQGroup {
  topic: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQGroup[] = [
  {
    topic: "Ordering",
    items: [
      {
        q: "Do I need to register to place an order?",
        a: "Yes. A one-time registration with your valid drug licence number is required before placing your first order. Registration is free and takes under 2 minutes via OTP verification.",
      },
      {
        q: "What is the minimum order value or quantity?",
        a: "There is no minimum order value for registered retailers. You can order any quantity at the listed  net rate.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can be modified or cancelled within 2 hours of placement, as long as they have not moved to Packed status. Contact us on WhatsApp immediately for urgent changes.",
      },
      {
        q: "Can I order via WhatsApp instead of the website?",
        a: 'Yes. Use the "Order via WhatsApp" button in your cart to send your order list directly to our WhatsApp. Our team will confirm and process it manually.',
      },
    ],
  },
  {
    topic: "Pricing & Discounts",
    items: [
      {
        q: "How often are net rates updated?",
        a: "Net rates are revised every Monday based on current company price lists and availability. You always see the latest rates on the catalogue.",
      },
      {
        q: "Are scheme offers like 10+1 Free applied automatically?",
        a: "Yes, all active scheme offers are shown in the catalogue with a badge and are applied automatically at checkout. No coupon code is needed.",
      },
      {
        q: "Do I get better rates for larger orders?",
        a: "Yes. Regular retailers with monthly order volumes above ₹50,000 qualify for an additional trade discount. Contact our sales team to discuss your account terms.",
      },
      {
        q: "Is GST included in the net rate shown?",
        a: "No. The net rates shown are exclusive of GST. GST as applicable to each product under the pharmaceutical schedule will be shown separately at the invoice stage.",
      },
    ],
  },
  {
    topic: "Delivery",
    items: [
      {
        q: "How soon will my order be dispatched?",
        a: "Orders confirmed before 12:00 PM are dispatched the same day from our Padrauna warehouse. Orders placed after 12 PM are dispatched the next morning.",
      },
      {
        q: "Which areas do you deliver to?",
        a: "We currently serve pharmacies across all over India. Contact us for delivery to any areas.",
      },
      {
        q: "What are the delivery charges?",
        a: "Delivery is free for orders above ₹4,000. A nominal ₹45 freight charge applies on orders below ₹5,000 for local delivery. Outstation charges vary by distance.",
      },
      {
        q: "How do I track my order?",
        a: "Use the Order Tracking page with your Order ID and registered phone number. You can also ask for real-time updates on our WhatsApp.",
      },
    ],
  },
  {
    topic: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI (GPay, PhonePe, Paytm), NEFT/RTGS bank transfer, and cheque for established accounts. Cash payment is accepted at our Padrauna counter.",
      },
      {
        q: "Can I get a GST invoice for my orders?",
        a: "Yes, a GST invoice is generated for every order and sent via WhatsApp or email. You can also download it from your order history page.",
      },
    ],
  },
  {
    topic: "Account & Registration",
    items: [
      {
        q: "What documents are needed to register?",
        a: "You need a valid retail drug licence (Form 20B/21B), GSTIN if applicable, and a mobile number for OTP verification. Upload or WhatsApp the copies to complete KYC.",
      },
      {
        q: "Can I have multiple delivery addresses on one account?",
        a: "Yes. You can save up to 3 delivery addresses in your account and choose the appropriate one at checkout.",
      },
      {
        q: "What if I forget my registered phone number?",
        a: "Contact our support team on WhatsApp with your shop name and drug licence number. We will verify and help you update your registered number.",
      },
    ],
  },
];

const topicIcons: Record<string, React.ReactElement> = {
  Ordering: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path
        d="M3 6h18l-2 13H5L3 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 6a4 4 0 0 1 8 0M9 10v5M15 10v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),

  "Pricing & Discounts": (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path
        d="M20 12a2 2 0 0 0-.59-1.41l-6-6A2 2 0 0 0 12 4H6a2 2 0 0 0-2 2v6c0 .53.21 1.04.59 1.41l6 6a2 2 0 0 0 2.82 0l3-3 3-3c.38-.37.59-.88.59-1.41Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle
        cx="8.5"
        cy="8.5"
        r="1.2"
        fill="currentColor"
      />
    </svg>
  ),

  Delivery: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path
        d="M3 5h11v11H3V5ZM14 9h4l3 3v4h-7V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle
        cx="7"
        cy="18"
        r="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="18"
        cy="18"
        r="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  ),

  Payments: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 10h18M7 15h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),

  "Account & Registration": (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 20c.7-3.2 3.2-5 7-5s6.3 1.8 7 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
};

function AccordionItem({
  q,
  a,
  index,
}: {
  q: string;
  a: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
      }}
      className="group"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-5 py-5 text-left"
      >
        <div className="flex items-start gap-4">
          <motion.div
            animate={{
              scale: open ? 1 : 0.92,
              rotate: open ? 0 : -5,
            }}
            transition={{ duration: 0.25 }}
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
              open
                ? "bg-[#0D9A55] text-white shadow-[0_6px_18px_rgba(13,154,85,0.22)]"
                : "bg-[#E8F5EE] text-[#0D9A55] group-hover:bg-[#DDF1E6]"
            }`}
          >
            <span className="text-sm font-bold">
              {String(index + 1).padStart(2, "0")}
            </span>
          </motion.div>

          <span
            className={`pt-1 text-[15px] sm:text-base font-semibold leading-snug transition-colors duration-200 ${
              open
                ? "text-[#0D9A55]"
                : "text-[#1C1C1E] group-hover:text-[#0D9A55]"
            }`}
          >
            {q}
          </span>
        </div>

        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
          transition={{ duration: 0.3 }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            open
              ? "bg-[#0D9A55] text-white"
              : "bg-[#F5F7F5] text-[#6B7280] group-hover:bg-[#E8F5EE] group-hover:text-[#0D9A55]"
          }`}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m6 9 6 6 6-6"
            />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              height: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              },
              opacity: {
                duration: 0.2,
              },
            }}
            className="overflow-hidden"
          >
            <div className="pb-5 pl-12 pr-10">
              <motion.div
                initial={{ y: -5 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.25 }}
                className="border-l-2 border-[#DDF1E6] pl-4"
              >
                <p className="text-sm sm:text-[15px] leading-7 text-[#6B7280]">
                  {a}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [activeGroup, setActiveGroup] = useState("Ordering");

  const activeFAQ =
    FAQ_DATA.find((group) => group.topic === activeGroup) || FAQ_DATA[0];

  return (
    <div className="min-h-screen overflow-hidden bg-[#F8FAF8] text-[#1C1C1E]">

      {/* =========================
          HERO SECTION
      ========================== */}
      <section className="relative overflow-hidden border-b border-black/[0.05] bg-white">

        {/* Background decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-[#0D9A55]/[0.07] blur-3xl"
        />

        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 8, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute right-[12%] top-20 h-20 w-20 rounded-3xl bg-[#E8F5EE]/70 rotate-12 blur-[1px]"
        />

        <motion.div
          animate={{
            y: [0, 12, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute left-[7%] bottom-10 hidden h-14 w-14 rounded-2xl bg-[#E8F5EE]/60 md:block"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">

          <div className="max-w-3xl">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0D9A55]/10 bg-[#E8F5EE] px-3.5 py-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0D9A55] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0D9A55]" />
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#0D9A55]">
                Help Centre
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.65,
                delay: 0.1,
              }}
              className="mb-5 text-4xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-5xl lg:text-6xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Frequently Asked
              <br />
              <span className="text-[#0D9A55]">Questions</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.2,
              }}
              className="max-w-2xl text-base leading-7 text-[#6B7280] sm:text-lg"
            >
              Quick answers to the most common questions about ordering,
              pricing, delivery, payments, and your account.
            </motion.p>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.3,
              }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <div className="flex items-center gap-2 rounded-xl border border-black/[0.05] bg-white px-4 py-2.5 shadow-sm">
                <span className="text-lg">✓</span>
                <span className="text-sm font-semibold text-[#374151]">
                  Quick answers
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-black/[0.05] bg-white px-4 py-2.5 shadow-sm">
                <span className="text-lg">⚡</span>
                <span className="text-sm font-semibold text-[#374151]">
                  Fast support
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-black/[0.05] bg-white px-4 py-2.5 shadow-sm">
                <span className="text-lg">💬</span>
                <span className="text-sm font-semibold text-[#374151]">
                  WhatsApp help
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================
          FAQ CONTENT
      ========================== */}
      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-10">

          {/* =========================
              TOPICS SIDEBAR
          ========================== */}
          <aside className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
              className="lg:sticky lg:top-24"
            >
              <div className="mb-3 px-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">
                  Browse by topic
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-black/[0.05] bg-white p-2 shadow-[0_8px_35px_rgba(0,0,0,0.05)]">

                {FAQ_DATA.map((group, index) => {
                  const active = activeGroup === group.topic;

                  return (
                    <motion.button
                      key={group.topic}
                      type="button"
                      onClick={() => setActiveGroup(group.topic)}
                      whileHover={{ x: active ? 0 : 3 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left last:mb-0"
                    >
                      {active && (
                        <motion.div
                          layoutId="activeTopic"
                          className="absolute inset-0 rounded-2xl bg-[#E8F5EE]"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      <span
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                          active
                            ? "bg-[#0D9A55] text-white shadow-[0_7px_20px_rgba(13,154,85,0.25)]"
                            : "bg-[#F5F7F5] text-[#6B7280]"
                        }`}
                      >
                        {topicIcons[group.topic]}
                      </span>

                      <span className="relative z-10 min-w-0 flex-1">
                        <span
                          className={`block text-sm font-bold ${
                            active
                              ? "text-[#0D9A55]"
                              : "text-[#374151]"
                          }`}
                        >
                          {group.topic}
                        </span>

                        <span className="mt-0.5 block text-xs text-[#9CA3AF]">
                          {group.items.length} questions
                        </span>
                      </span>

                      <span
                        className={`relative z-10 flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-bold ${
                          active
                            ? "bg-white text-[#0D9A55]"
                            : "bg-[#F5F7F5] text-[#9CA3AF]"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Support card */}
             
            </motion.div>
          </aside>

          {/* =========================
              QUESTIONS
          ========================== */}
          <section className="lg:col-span-8">

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFAQ.topic}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  duration: 0.3,
                }}
              >

                {/* Section heading */}
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0D9A55]">
                      Questions & Answers
                    </p>

                    <h2
                      className="text-2xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-3xl"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {activeFAQ.topic}
                    </h2>
                  </div>

                  <div className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#9CA3AF] shadow-sm sm:block">
                    {activeFAQ.items.length} questions
                  </div>
                </div>

                {/* Questions card */}
                <div className="overflow-hidden rounded-3xl border border-black/[0.05] bg-white px-5 shadow-[0_8px_35px_rgba(0,0,0,0.05)] sm:px-7">
                  {activeFAQ.items.map((item, index) => (
                    <div
                      key={item.q}
                      className="border-b border-black/[0.06] last:border-0"
                    >
                      <AccordionItem
                        q={item.q}
                        a={item.a}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

             <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                className="relative mt-5 overflow-hidden rounded-3xl bg-[#0D9A55] p-6 text-white shadow-[0_15px_40px_rgba(13,154,85,0.18)]"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-white/[0.06]" />

                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 11.5a8.38 8.38 0 0 1-9 8.3 8.8 8.8 0 0 1-3.7-.8L3 20l1.2-4.8A8.2 8.2 0 0 1 3 11.5 8.38 8.38 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5Z"
                      />
                    </svg>
                  </div>

                  <h3 className="mb-2 text-lg font-extrabold">
                    Still need help?
                  </h3>

                  <p className="mb-5 text-sm leading-6 text-white/80">
                    Our support team is available Mon–Sat, 9 AM–7 PM.
                  </p>

                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0D9A55] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Ask on WhatsApp

                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.04 2C6.58 2 2.14 6.44 2.14 11.9c0 1.75.46 3.46 1.34 4.96L2 22l5.29-1.39a9.86 9.86 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm5.77 14.1c-.24.67-1.39 1.28-1.91 1.36-.49.07-1.11.1-1.8-.11-.42-.13-.95-.31-1.64-.61-2.89-1.25-4.77-4.34-4.92-4.54-.14-.2-1.18-1.57-1.18-2.99s.74-2.12 1-2.4c.25-.28.55-.35.73-.35.18 0 .36 0 .52.01.17.01.39-.07.61.46.22.53.75 1.83.82 1.96.07.13.11.29.02.46-.08.18-.13.29-.26.45-.13.15-.27.34-.39.46-.13.13-.26.27-.11.53.15.26.67 1.11 1.44 1.8.99.88 1.82 1.15 2.08 1.28.26.13.41.11.56-.07.15-.18.64-.75.81-1.01.17-.26.34-.22.57-.13.24.09 1.51.71 1.77.84.26.13.44.2.5.31.07.1.07.62-.17 1.29Z" />
                    </svg>
                  </a>
                </div>
              </motion.div>

            {/* =========================
                BOTTOM CTA
            ========================== */}
          
          </section>
        </div>
      </main>
    </div>
  );
};
