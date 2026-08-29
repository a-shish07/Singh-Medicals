
import { motion } from "framer-motion";
import { useApp } from "../context";

export default function About() {
  const { navigate } = useApp();

  const stats = [
    {
      num: "1998",
      label: "Year Founded",
      icon: "calendar",
    },
    {
      num: "500+",
      label: "Products Listed",
      icon: "box",
    },
    {
      num: "200+",
      label: "Partner Pharmacies",
      icon: "users",
    },
    {
      num: "25+",
      label: "Years of Service",
      icon: "award",
    },
  ];

  const values = [
    {
      icon: "🔬",
      title: "Quality Assurance",
      desc: "Every product is sourced exclusively from authorised C&F agents of original manufacturers. We maintain a strict no-parallel-import policy.",
    },
    {
      icon: "🚚",
      title: "Reliable Supply",
      desc: "We maintain buffer stock on all fast-moving products. Your orders are not subject to supply disruptions caused by downstream chain gaps.",
    },
    {
      icon: "₹",
      title: "Fair Pricing",
      desc: "Net rates are revised every week based on current market. We do not inflate margins — you get the best wholesale price available in the region.",
    },
    {
      icon: "🤝",
      title: "Strong Relationships",
      desc: "We believe in long-term partnerships. Loyal retailers get priority dispatch, advance notice of scheme offers, and dedicated support.",
    },
  ];

  const iconForStat = (icon: string) => {
    if (icon === "calendar") {
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path
            strokeLinecap="round"
            d="M16 2v4M8 2v4M3 10h18"
          />
        </svg>
      );
    }

    if (icon === "box") {
      return (
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
            d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 7.5 7.5 4 7.5-4M12 11.5V21"
          />
        </svg>
      );
    }

    if (icon === "users") {
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="9" cy="8" r="3" />
          <path
            strokeLinecap="round"
            d="M3.5 20c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5"
          />
          <path
            strokeLinecap="round"
            d="M16 5.5a3 3 0 010 5.5M17 15c1.8.5 3 2 3.5 5"
          />
        </svg>
      );
    }

    return (
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
          d="m12 3 2.1 4.25 4.7.68-3.4 3.3.8 4.67-4.2-2.2-4.2 2.2.8-4.67-3.4-3.3 4.7-.68L12 3Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 17.5 6.5 21l5.5-2.5 5.5 2.5-1.5-3.5"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#F8FAF8] text-[#1C1C1E]">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-black/[0.05] bg-white">

        {/* Main glow */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.2,
          }}
          className="pointer-events-none absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full bg-[#0D9A55]/[0.07] blur-3xl"
        />

        {/* Secondary glow */}
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#0D9A55]/[0.035] blur-3xl"
        />

        {/* Floating shape */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 7, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute right-[13%] top-24 hidden h-20 w-20 rounded-3xl bg-[#E8F5EE] sm:block"
        />

        {/* Decorative dots */}
        <div className="pointer-events-none absolute right-[25%] top-20 hidden grid-cols-4 gap-2 opacity-40 lg:grid">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.span
              key={i}
              animate={{
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: 2,
                delay: i * 0.06,
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
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0D9A55]/10 bg-[#E8F5EE] px-3.5 py-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0D9A55] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0D9A55]" />
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#0D9A55]">
                Since 1998 · Padrauna, UP
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.65,
                delay: 0.1,
              }}
              className="mb-5 text-4xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-5xl lg:text-6xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Built on trust.
              <br />
              <span className="text-[#0D9A55]">
                Grown through service.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                delay: 0.2,
              }}
              className="max-w-2xl text-base leading-7 text-[#6B7280] sm:text-lg"
            >
              Singh Medical Stores has been the wholesale pharmaceutical
              partner of choice for retail pharmacies across Eastern Uttar
              Pradesh for over 25 years.
            </motion.p>

            {/* Hero trust indicators */}
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
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
                  Trusted since 1998
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-black/[0.05] bg-white px-4 py-2.5 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F5EE] text-xs">
                  🤝
                </span>
                <span className="text-sm font-semibold text-[#374151]">
                  200+ retail partners
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STORY SECTION
      ====================================================== */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">

          {/* Story text */}
          <motion.div
            initial={{
              opacity: 0,
              x: -25,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.6,
            }}
            className="lg:col-span-7"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#0D9A55]">
              Our Story
            </p>

            <h2
              className="mb-6 text-3xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-4xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              A family business,
              <br />
              <span className="text-[#0D9A55]">
                a community institution.
              </span>
            </h2>

            <div className="space-y-5 text-sm leading-7 text-[#6B7280]">
              <p>
                Founded in 1998 in Padrauna, Kushinagar by Mr. Harpal Singh,
                Singh Medical Stores started as a small wholesale
                pharmaceutical outlet serving local pharmacies with a
                handful of essential medicines. Over the decades, through
                honest dealings and reliable supply, we grew to become the
                most trusted distributor in the region.
              </p>

              <p>
                Today, we supply over 500 pharmaceutical products from more
                than 50 leading brands to 200+ registered retail pharmacy
                outlets across Kushinagar, Gorakhpur, Deoria, Basti, Mau,
                and Azamgarh districts. Every product we supply is sourced
                from authorised C&F agents, guaranteeing genuine stock at
                every transaction.
              </p>

              <p>
                We continue to operate with the same values Mr. Singh
                instilled from the start: fair pricing, reliable supply,
                and a relationship-first approach. For us, your pharmacy is
                not just an account number — it is a partnership.
              </p>
            </div>

            {/* Story highlight */}
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.5,
                delay: 0.15,
              }}
              className="mt-7 flex items-start gap-3 rounded-2xl border border-[#0D9A55]/10 bg-[#E8F5EE] p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D9A55] shadow-sm">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v18M3 12h18"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-bold text-[#1C1C1E]">
                  More than a distributor
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[#6B7280]">
                  We build lasting relationships with the pharmacies and
                  communities we serve.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Statistics */}
          <motion.div
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
              amount: 0.15,
            }}
            transition={{
              duration: 0.6,
            }}
            className="relative lg:col-span-5"
          >
            {/* Background */}
            <div className="absolute -inset-3 rounded-[2rem] bg-[#E8F5EE]/60 blur-sm" />

            <div className="relative rounded-[2rem] border border-[#0D9A55]/10 bg-gradient-to-br from-[#E8F5EE] to-[#F5F7F5] p-5 sm:p-6">

              {/* Small header */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0D9A55]">
                    By the numbers
                  </p>

                  <p className="mt-1 text-xs text-[#6B7280]">
                    A quarter century of service
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0D9A55] shadow-sm">
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
                      d="M4 19V5M4 19h16"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m7 15 4-4 3 2 5-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{
                      opacity: 0,
                      scale: 0.92,
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.08,
                    }}
                    whileHover={{
                      y: -4,
                    }}
                    className="group rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_10px_25px_rgba(0,0,0,0.07)]"
                  >
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F5EE] text-[#0D9A55] transition-transform duration-300 group-hover:scale-110">
                      {iconForStat(stat.icon)}
                    </div>

                    <p
                      className="mb-1 text-3xl font-extrabold text-[#0D9A55]"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {stat.num}
                    </p>

                    <p className="text-xs font-medium text-[#6B7280]">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Bottom statement */}
              <div className="mt-4 rounded-2xl bg-[#0D9A55] p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
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
                        d="M12 3 4.5 7v5c0 4.5 3 7.8 7.5 9 4.5-1.2 7.5-4.5 7.5-9V7L12 3Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9 12 2 2 4-4"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Genuine stock. Trusted supply.
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/70">
                      Sourced through authorised channels.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          VALUES SECTION
      ====================================================== */}
      <section className="border-y border-black/[0.05] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">

          {/* Heading */}
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
              duration: 0.55,
            }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0D9A55]">
              What We Stand For
            </p>

            <h2
              className="text-3xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-4xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Our Mission & Values
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              The principles that have shaped how we serve our pharmacy
              partners for more than two decades.
            </p>
          </motion.div>

          {/* Values */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -5,
                }}
                className="group relative overflow-hidden rounded-3xl border border-black/[0.05] bg-[#F8FAF8] p-6 transition-all duration-300 hover:border-[#0D9A55]/10 hover:bg-[#E8F5EE] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] sm:p-7"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#0D9A55]/[0.05] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex gap-5">
                  {/* Icon */}
                  <motion.div
                    whileHover={{
                      scale: 1.08,
                      rotate: 3,
                    }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                  >
                    {value.icon}
                  </motion.div>

                  <div className="pt-0.5">
                    <h3 className="mb-2 text-base font-extrabold text-[#1C1C1E]">
                      {value.title}
                    </h3>

                    <p className="text-sm leading-6 text-[#6B7280]">
                      {value.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom line */}
                <motion.div
                  initial={{
                    width: "0%",
                  }}
                  whileInView={{
                    width: "28%",
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.7,
                    delay: 0.3 + index * 0.08,
                  }}
                  className="mt-6 h-0.5 rounded-full bg-[#0D9A55]"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          PARTNERSHIP / CTA
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#0D9A55]">

        {/* Background decoration */}
        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.06] blur-2xl"
        />

        <motion.div
          animate={{
            x: [0, -15, 0],
            y: [0, 12, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/[0.04] blur-2xl"
        />

        {/* Decorative rings */}
        <div className="pointer-events-none absolute right-[10%] top-1/2 hidden -translate-y-1/2 md:block">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="h-48 w-48 rounded-full border border-white/10"
          />

          <div className="absolute inset-6 rounded-full border border-white/[0.08]" />
          <div className="absolute inset-12 rounded-full border border-white/[0.06]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">

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
              duration: 0.55,
            }}
          >
            {/* Badge */}
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />

              <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/90">
                Join our network
              </span>
            </div>

            <h2
              className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Become a partner retailer
            </h2>

            <p className="mx-auto mb-8 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Register your pharmacy and get instant access to 500+ products
              at wholesale net rates, with same-day dispatch.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">

              {/* Get Started */}
              <motion.button
                type="button"
                onClick={() => navigate("login")}
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-[#0D9A55] shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
              >
                Get Started

                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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

              {/* Contact */}
              <motion.button
                type="button"
                onClick={() => navigate("contact")}
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
              >
                Contact Us
              </motion.button>
            </div>

            {/* CTA reassurance */}
            <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="text-white">✓</span>
                Free registration
              </span>

              <span className="flex items-center gap-1.5">
                <span className="text-white">✓</span>
                Wholesale pricing
              </span>

              <span className="flex items-center gap-1.5">
                <span className="text-white">✓</span>
                Same-day dispatch
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

