import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context";
import { submitContactQuery } from "../lib/api";

export default function Contact() {
  const { addToast } = useApp();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9]\d{9}$/.test(form.phone)) {
      addToast("Please enter a valid 10-digit phone number.", "error");
      return;
    }
    try {
      setSending(true);
      await submitContactQuery(form);
      setSubmitted(true);
      addToast("Message sent! We will get back to you shortly.", "success");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Could not send your message. Please try again.",
        "error",
      );
    } finally {
      setSending(false);
    }
  };

  const contactDetails = [
    {
      label: "Address",
      value:
        "Singh Medical Complex, Station Road,\nPadrauna, Kushinagar, UP — 274304",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
      ),
    },

    {
      label: "Phone",
      value: "+91 98765 43210",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
          />
        </svg>
      ),
    },

    {
      label: "Email",
      value: "orders@singhmedical.in",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      ),
    },

    {
      label: "Business Hours",
      value: "Mon–Sat: 9:00 AM – 7:00 PM\nSunday: 10:00 AM – 2:00 PM",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#F8FAF8] text-[#1C1C1E]">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-black/[0.05] bg-white">
        {/* Large glowing background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#0D9A55]/[0.07] blur-3xl"
        />

        <motion.div
          animate={{
            y: [0, -18, 0],
            rotate: [0, 6, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute right-[13%] top-20 h-20 w-20 rounded-3xl bg-[#E8F5EE]/80"
        />

        <motion.div
          animate={{
            y: [0, 12, 0],
            x: [0, 8, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute bottom-8 left-[8%] hidden h-14 w-14 rounded-2xl bg-[#E8F5EE]/70 md:block"
        />

        {/* Small decorative dots */}
        <div className="pointer-events-none absolute right-[27%] top-28 hidden grid-cols-3 gap-2 opacity-40 sm:grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.span
              key={i}
              animate={{
                opacity: [0.25, 0.7, 0.25],
              }}
              transition={{
                duration: 2,
                delay: i * 0.08,
                repeat: Infinity,
              }}
              className="h-1.5 w-1.5 rounded-full bg-[#0D9A55]"
            />
          ))}
        </div>

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
                Get In Touch
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
              Let&apos;s Start a
              <br />
              <span className="text-[#0D9A55]">Conversation</span>
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
              Have a question, want to register, or need help with an order?
              Reach out and our team will get back to you the same day.
            </motion.p>

            {/* Trust badges */}
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
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F5EE] text-xs font-bold text-[#0D9A55]">
                  ✓
                </span>

                <span className="text-sm font-semibold text-[#374151]">
                  Same-day response
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-black/[0.05] bg-white px-4 py-2.5 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F5EE] text-xs">
                  💬
                </span>

                <span className="text-sm font-semibold text-[#374151]">
                  WhatsApp support
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-10">
          {/* =================================================
              LEFT COLUMN
          ================================================== */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            {/* Contact Details Card */}
            <motion.div
              whileHover={{
                y: -3,
              }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden rounded-3xl border border-black/[0.05] bg-white shadow-[0_8px_35px_rgba(0,0,0,0.05)]"
            >
              {/* Card Header */}
              <div className="border-b border-black/[0.05] px-6 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5EE] text-[#0D9A55]">
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
                        d="M3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 17.25V6.75Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m3.75 6 7.09 5.1a2 2 0 002.32 0L20.25 6"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2
                      className="text-lg font-extrabold text-[#1C1C1E]"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Contact Details
                    </h2>

                    <p className="mt-0.5 text-xs text-[#9CA3AF]">
                      We&apos;re here to help
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1 px-6 py-5 sm:px-7">
                {contactDetails.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.07,
                    }}
                    whileHover={{
                      x: 3,
                    }}
                    className="group flex gap-4 rounded-2xl p-3 transition-colors duration-200 hover:bg-[#F8FAF8]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5EE] text-[#0D9A55] transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
                      {item.icon}
                    </div>

                    <div className="min-w-0 pt-0.5">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">
                        {item.label}
                      </p>

                      <p className="whitespace-pre-line text-sm leading-6 text-[#1C1C1E]">
                        {item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* WhatsApp button */}
              <div className="px-6 pb-6 sm:px-7">
                <motion.a
                  href="https://wa.me/918174958839?text=Hi%20Singh%20Medical%20Stores%2C%20I%20have%20a%20query."
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{
                    y: -2,
                    scale: 1.01,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(37,211,102,0.22)] transition-all duration-300 hover:shadow-[0_10px_25px_rgba(37,211,102,0.28)]"
                >
                  {/* Shine animation */}
                  <span className="absolute inset-y-0 -left-20 w-12 skew-x-[-20deg] bg-white/20 transition-all duration-700 group-hover:left-[110%]" />

                  <svg
                    className="relative h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>

                  <span className="relative">Chat on WhatsApp</span>

                  <svg
                    className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14m-6-6 6 6-6 6"
                    />
                  </svg>
                </motion.a>
              </div>
            </motion.div>

            {/* =================================================
                LOCATION CARD
            ================================================== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -3 }}
              className="relative h-52 overflow-hidden rounded-3xl border border-[#0D9A55]/10 bg-[#E8F5EE] shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              {/* Decorative grid */}
              <div className="absolute inset-0 opacity-30">
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(13,154,85,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(13,154,85,0.12) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
              </div>

              {/* Map circles */}
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0D9A55]/20"
              />

              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.15, 0.4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0D9A55]/15"
              />

              {/* Location marker */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%]">
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0D9A55] text-white shadow-[0_8px_20px_rgba(13,154,85,0.3)]">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  </div>

                  <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1 rounded-full bg-[#0D9A55]/30 blur-sm" />
                </motion.div>
              </div>

              {/* Location text */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#0D9A55]">
                      Padrauna, Kushinagar
                    </p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      Uttar Pradesh — 274304
                    </p>
                  </div>

                  <span className="rounded-full bg-[#E8F5EE] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0D9A55]">
                    Location
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* =================================================
              RIGHT COLUMN — FORM
          ================================================== */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="h-fit"
          >
            <div className="overflow-hidden rounded-3xl border border-black/[0.05] bg-white shadow-[0_8px_35px_rgba(0,0,0,0.06)]">
              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ==========================================
                     SUCCESS STATE
                  =========================================== */
                  <motion.div
                    key="success"
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className="flex min-h-[560px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10"
                  >
                    {/* Animated success icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 15,
                        delay: 0.1,
                      }}
                      className="relative mb-6"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.35, 0, 0.35],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="absolute inset-0 rounded-full bg-[#0D9A55]"
                      />

                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F5EE]">
                        <svg
                          className="h-10 w-10 text-[#0D9A55]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <motion.path
                            initial={{
                              pathLength: 0,
                            }}
                            animate={{
                              pathLength: 1,
                            }}
                            transition={{
                              duration: 0.5,
                              delay: 0.3,
                            }}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75"
                          />

                          <motion.circle
                            initial={{
                              pathLength: 0,
                            }}
                            animate={{
                              pathLength: 1,
                            }}
                            transition={{
                              duration: 0.7,
                              delay: 0.1,
                            }}
                            cx="12"
                            cy="12"
                            r="9"
                          />
                        </svg>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <h2
                        className="mb-2 text-2xl font-extrabold text-[#1C1C1E]"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Message Sent!
                      </h2>

                      <p className="mx-auto mb-7 max-w-sm text-sm leading-6 text-[#6B7280]">
                        Thank you for reaching out. Our team will get back to
                        you within a few hours.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setForm({
                            name: "",
                            phone: "",
                            message: "",
                          });
                        }}
                        className="rounded-xl border-2 border-[#0D9A55] px-5 py-2.5 text-sm font-bold text-[#0D9A55] transition-all duration-300 hover:bg-[#E8F5EE] hover:shadow-sm"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  </motion.div>
                ) : (
                  /* ==========================================
                     FORM STATE
                  =========================================== */
                  <motion.div
                    key="form"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="p-6 sm:p-8"
                  >
                    {/* Form header */}
                    <div className="mb-7">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5EE] text-[#0D9A55]">
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
                            d="M21 11.5a8.5 8.5 0 01-9 8.5 8.9 8.9 0 01-3.8-.85L3 21l1.4-4.6A8.2 8.2 0 013 11.5 8.5 8.5 0 0112 3a8.5 8.5 0 019 8.5Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 10h8M8 14h5"
                          />
                        </svg>
                      </div>

                      <h2
                        className="text-2xl font-extrabold text-[#1C1C1E]"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Send a Message
                      </h2>

                      <p className="mt-1.5 text-sm leading-6 text-[#6B7280]">
                        Fill in your details and our team will get back to you
                        shortly.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-5"
                    >
                      {/* Name */}
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="mb-2 block text-sm font-bold text-[#1C1C1E]"
                        >
                          Your Name <span className="text-red-400">*</span>
                        </label>

                        <div className="group relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors group-focus-within:text-[#0D9A55]">
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <circle cx="12" cy="8" r="3.5" />
                              <path
                                strokeLinecap="round"
                                d="M5 20c.7-3.2 3.2-5 7-5s6.3 1.8 7 5"
                              />
                            </svg>
                          </span>

                          <input
                            id="contact-name"
                            required
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Rajesh Kumar"
                            className="w-full rounded-xl border border-black/[0.08] bg-[#F5F7F5] py-3.5 pl-11 pr-4 text-sm text-[#1C1C1E] outline-none transition-all duration-300 placeholder:text-[#A3A7AE] focus:border-[#0D9A55] focus:bg-white focus:ring-4 focus:ring-[#0D9A55]/10"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label
                          htmlFor="contact-phone"
                          className="mb-2 block text-sm font-bold text-[#1C1C1E]"
                        >
                          Phone Number <span className="text-red-400">*</span>
                        </label>

                        <div className="group relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors group-focus-within:text-[#0D9A55]">
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                              />
                            </svg>
                          </span>

                          <input
                            id="contact-phone"
                            required
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={form.phone}
                            onChange={(e) => {
                              // Allow only numbers
                              let value = e.target.value.replace(/\D/g, "");

                              // Don't allow 0 as the first digit
                              if (value.startsWith("0")) {
                                value = value.slice(1);
                              }

                              // Maximum 10 digits
                              value = value.slice(0, 10);

                              setForm((f) => ({
                                ...f,
                                phone: value,
                              }));
                            }}
                            placeholder="8174958839"
                            className="w-full rounded-xl border border-black/[0.08] bg-[#F5F7F5] py-3.5 pl-11 pr-4 text-sm text-[#1C1C1E] outline-none transition-all duration-300 placeholder:text-[#A3A7AE] focus:border-[#0D9A55] focus:bg-white focus:ring-4 focus:ring-[#0D9A55]/10"
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor="contact-message"
                            className="block text-sm font-bold text-[#1C1C1E]"
                          >
                            Message <span className="text-red-400">*</span>
                          </label>

                          <span className="text-[11px] text-[#9CA3AF]">
                            We&apos;ll respond quickly
                          </span>
                        </div>

                        <div className="group relative">
                          <span className="pointer-events-none absolute left-4 top-4 text-[#9CA3AF] transition-colors group-focus-within:text-[#0D9A55]">
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 10h8M8 14h5"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 11.5a8.5 8.5 0 01-9 8.5 8.9 8.9 0 01-3.8-.85L3 21l1.4-4.6A8.2 8.2 0 013 11.5 8.5 8.5 0 0112 3a8.5 8.5 0 019 8.5Z"
                              />
                            </svg>
                          </span>

                          <textarea
                            id="contact-message"
                            required
                            rows={6}
                            value={form.message}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                message: e.target.value,
                              }))
                            }
                            placeholder="I would like to register my pharmacy and start ordering..."
                            className="w-full resize-none rounded-xl border border-black/[0.08] bg-[#F5F7F5] py-3.5 pl-11 pr-4 text-sm leading-6 text-[#1C1C1E] outline-none transition-all duration-300 placeholder:text-[#A3A7AE] focus:border-[#0D9A55] focus:bg-white focus:ring-4 focus:ring-[#0D9A55]/10"
                          />
                        </div>
                      </div>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={sending}
                        whileHover={{
                          y: -2,
                          scale: 1.01,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                        className="group relative mt-1 flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0D9A55] py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(13,154,85,0.2)] transition-all duration-300 hover:bg-[#0A7A43] hover:shadow-[0_12px_28px_rgba(13,154,85,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {/* Shine */}
                        <span className="absolute inset-y-0 -left-20 w-12 skew-x-[-20deg] bg-white/20 transition-all duration-700 group-hover:left-[110%]" />

                        <span className="relative">
                          {sending ? "Sending..." : "Send Message"}
                        </span>

                        <svg
                          className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14m-6-6 6 6-6 6"
                          />
                        </svg>
                      </motion.button>

                      {/* Privacy note */}
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <svg
                          className="h-3.5 w-3.5 text-[#0D9A55]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m9 12 2 2 4-4"
                          />
                        </svg>

                        <span className="text-[11px] text-[#9CA3AF]">
                          Your information is kept private and secure.
                        </span>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* =================================================
            BOTTOM QUICK HELP
        ================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.55,
          }}
          className="mt-10 overflow-hidden rounded-3xl border border-[#0D9A55]/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <div className="grid grid-cols-1 divide-y divide-black/[0.05] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {/* Response */}
            <div className="flex items-center gap-4 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5EE] text-[#0D9A55]">
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
                    d="M12 6v6l4 2"
                  />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-bold text-[#1C1C1E]">
                  Quick Response
                </p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  Same-day support
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/918174958839?text=Hi%20Singh%20Medical%20Stores%2C%20I%20need%20help."
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 transition-colors hover:bg-[#F8FAF8] sm:p-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5EE] text-[#25D366] transition-transform duration-300 group-hover:scale-105">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1C1C1E]">
                  WhatsApp Support
                </p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  Chat directly with us
                </p>
              </div>

              <svg
                className="ml-auto h-4 w-4 text-[#9CA3AF] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#0D9A55]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-6-6 6 6-6 6"
                />
              </svg>
            </a>

            {/* Business hours */}
            <div className="flex items-center gap-4 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5EE] text-[#0D9A55]">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 7v5l3 2"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-bold text-[#1C1C1E]">Open Today</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  Mon–Sat · 9 AM–7 PM
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
