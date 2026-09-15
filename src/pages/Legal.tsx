
import { motion, type Variants  } from "framer-motion";
import { useApp } from "../context";
import { fadeUp, staggerContainer as stagger } from "../lib/motionVariants";

const TERMS_SECTIONS = [
  {
    title: "Eligibility & Registration",
    body: "Access to best pricing and the ability to place orders on Singh Medical Stores is restricted to registered retail pharmacy licence holders in India. By registering, you confirm that you hold a valid retail drug licence (Form 20B/21B) and are legally authorised to purchase and dispense pharmaceutical products.",
  },
  {
    title: "Ordering & Pricing",
    body: "All prices listed are exclusive of GST and are subject to change without prior notice. The final invoice price may differ from the catalogue price displayed at the time of browsing due to stock revisions. Orders are confirmed only after explicit confirmation from our team via the platform or WhatsApp.",
  },
  {
    title: "Delivery & Risk of Loss",
    body: "Delivery timelines are indicative and not guaranteed. Singh Medical Stores shall not be liable for delays caused by logistics partners, natural events, or circumstances beyond our reasonable control. Risk of loss transfers to the buyer upon handover to the delivery partner.",
  },
  {
    title: "Returns & Refunds",
    body: "Returns are accepted for damaged, expired, or incorrectly supplied products reported within 48 hours of delivery, accompanied by photographic evidence. Opened or partially used products are not eligible for return. Refunds are processed within 5–7 working days after verification.",
  },
  {
    title: "Intellectual Property",
    body: "All content on this platform, including product data, pricing, images, and trademarks, is the property of Singh Medical Stores or its licensors. Unauthorised copying, redistribution, or commercial use of any content is prohibited.",
  },
  {
    title: "Governing Law",
    body: "These terms are governed by the laws of India and the state of Uttar Pradesh. Any disputes arising shall be subject to the exclusive jurisdiction of courts in Kushinagar District, Uttar Pradesh.",
  },
];

const PRIVACY_SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect information you provide during registration (pharmacy name, drug licence number, phone number, address) and information generated through your use of the platform (order history, browsing data, communication records). We do not collect payment card data; all payments are handled through secure third-party processors.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to process and deliver your orders, verify your drug licence, send order updates via SMS/WhatsApp, improve our platform, and comply with applicable legal and regulatory requirements. We do not sell your personal data to third parties.",
  },
  {
    title: "Data Sharing",
    body: "We share your delivery address and contact details with our logistics partners solely for the purpose of delivering your orders. We may share anonymised, aggregated data with business analytics providers. We disclose personal information to law enforcement or regulatory authorities when required by law.",
  },
  {
    title: "Data Retention",
    body: "Account and order data is retained for a minimum of 7 years to comply with pharmaceutical distribution regulations and GST record-keeping requirements. You may request deletion of non-regulatory data by contacting our support team.",
  },
  {
    title: "Your Rights",
    body: "You have the right to access, correct, or delete your personal data, subject to regulatory retention requirements. To exercise these rights, contact us at privacy@singhmedical.in or via WhatsApp. We will respond within 10 working days.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this privacy policy periodically. Material changes will be communicated via a notice on the platform or by SMS/WhatsApp. Continued use of the platform after such notice constitutes acceptance of the updated policy.",
  },
];

interface LegalProps {
  type: "terms" | "privacy";
}

/* =========================================================
   ICON
========================================================= */

function LegalIcon({
  type,
}: {
  type: "terms" | "privacy";
}) {
  if (type === "privacy") {
    return (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3 4.5 6v5.5c0 4.65 3.15 8.8 7.5 9.95 4.35-1.15 7.5-5.3 7.5-9.95V6L12 3Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.5 12 11 13.5l3.5-3.5"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3.75h7.5L19 8.25V20a.75.75 0 0 1-.75.75h-10.5A.75.75 0 0 1 7 20V3.75Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 3.75v4.5H19M10 12h4M10 15.5h4"
      />
    </svg>
  );
}

/* =========================================================
   LEGAL PAGE
========================================================= */

export default function Legal({
  type,
}: LegalProps) {
  const { navigate } = useApp();

  const isTerms = type === "terms";

  const title = isTerms
    ? "Terms & Conditions"
    : "Privacy Policy";

  const sections = isTerms
    ? TERMS_SECTIONS
    : PRIVACY_SECTIONS;

  const intro = isTerms
    ? "By accessing and using the Singh Medical Stores wholesale ordering platform, you agree to be bound by these terms and conditions. Please read them carefully before placing any order."
    : "This policy describes how Singh Medical Stores collects, uses, and protects the personal information of registered retail pharmacy users and visitors of this platform.";

  return (
    <div className="min-h-screen bg-[#F8FAF8]">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-black/[0.05] bg-white">

        {/* Background glow */}
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-28 -top-28 h-[430px] w-[430px] rounded-full bg-[#0D9A55]/10 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -bottom-40 -left-24 h-[300px] w-[300px] rounded-full bg-[#0D9A55]/[0.05] blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">

          {/* Breadcrumb */}
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="mb-7 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => navigate("home")}
              className="group flex items-center gap-1.5 text-xs font-semibold text-[#9CA3AF] transition-colors hover:text-[#0D9A55]"
            >
              <svg
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15 19-7-7 7-7"
                />
              </svg>

              Home
            </button>

            <span className="text-[#D1D5DB]">
              /
            </span>

            <span className="text-xs font-semibold text-[#1C1C1E]">
              {title}
            </span>
          </motion.div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* Icon */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
                rotate: -8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.1,
              }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5EE] text-[#0D9A55] shadow-[0_6px_20px_rgba(13,154,85,0.10)]"
            >
              <LegalIcon type={type} />
            </motion.div>

            <div>
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
                  duration: 0.55,
                  delay: 0.15,
                }}
              >
                <span className="mb-2 inline-flex rounded-full bg-[#E8F5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0D9A55]">
                  Singh Medical Stores
                </span>
              </motion.div>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                }}
                className="text-3xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-4xl"
                style={{
                  fontFamily:
                    "'DM Sans', sans-serif",
                }}
              >
                {title}
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                }}
                className="mt-2 text-xs font-medium text-[#9CA3AF]"
              >
                Last updated: 1 November 2024
                <span className="mx-2">
                  ·
                </span>
                Padrauna, Uttar Pradesh
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">

        {/* Intro */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.3,
          }}
          variants={fadeUp}
          className="relative mb-8 overflow-hidden rounded-3xl border border-[#0D9A55]/10 bg-gradient-to-br from-[#E8F5EE] to-[#F5F9F6] p-6 shadow-[0_4px_18px_rgba(13,154,85,0.06)] sm:p-7"
        >
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/40 blur-2xl" />

          <div className="relative flex gap-4">
            <div className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D9A55] shadow-sm sm:flex">
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
                  d="M13 16h-1v-4h-1m1-8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>

            <p className="text-sm leading-7 text-[#374151]">
              {intro}
            </p>
          </div>
        </motion.div>

        {/* =================================================
            SECTIONS
        ================================================== */}

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.08,
          }}
          className="space-y-4"
        >
          {sections.map(
            (sec, index) => (
              <motion.article
                key={sec.title}
                variants={fadeUp}
                whileHover={{
                  y: -3,
                }}
                className="group relative overflow-hidden rounded-3xl border border-black/[0.05] bg-white p-6 shadow-[0_3px_15px_rgba(0,0,0,0.045)] transition-all duration-300 hover:border-[#0D9A55]/10 hover:shadow-[0_12px_30px_rgba(0,0,0,0.075)] sm:p-7"
              >
                {/* Hover accent */}
                <div className="absolute bottom-0 left-0 top-0 w-1 origin-bottom scale-y-0 rounded-full bg-[#0D9A55] transition-transform duration-300 group-hover:scale-y-100" />

                <div className="flex gap-4">

                  {/* Number */}
                  <motion.div
                    whileHover={{
                      scale: 1.08,
                      rotate: 4,
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5EE] text-xs font-extrabold text-[#0D9A55] transition-colors duration-300 group-hover:bg-[#0D9A55] group-hover:text-white"
                  >
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </motion.div>

                  <div className="min-w-0 flex-1">

                    <h2
                      className="mb-3 text-base font-extrabold tracking-tight text-[#1C1C1E] sm:text-lg"
                      style={{
                        fontFamily:
                          "'DM Sans', sans-serif",
                      }}
                    >
                      {sec.title}
                    </h2>

                    <p className="text-sm leading-7 text-[#6B7280]">
                      {sec.body}
                    </p>
                  </div>
                </div>
              </motion.article>
            )
          )}
        </motion.div>

        {/* =================================================
            FOOTER INFO
        ================================================== */}

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
          className="mt-12 border-t border-black/[0.06] pt-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="space-y-1 text-xs leading-5 text-[#9CA3AF]">
              <p>
                Drug Licence: UP-19-000123
                <span className="mx-2">
                  ·
                </span>
                GSTIN: 09XXXXX1234X1Z5
              </p>

              <p>
                © 2024 Singh Medical Stores,
                Padrauna, Kushinagar, UP —
                274304
              </p>
            </div>

            {/* Switch policy */}
            <motion.button
              type="button"
              whileHover={{
                x: 3,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() =>
                navigate(
                  isTerms
                    ? "privacy"
                    : "terms"
                )
              }
              className="group flex shrink-0 items-center gap-2 rounded-xl border border-[#0D9A55]/15 bg-[#E8F5EE] px-4 py-2.5 text-xs font-bold text-[#0D9A55] transition-all duration-300 hover:border-[#0D9A55]/30 hover:bg-[#0D9A55] hover:text-white"
            >
              {isTerms
                ? "Privacy Policy"
                : "Terms & Conditions"}

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
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {/* =================================================
            BACK HOME
        ================================================== */}

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
          className="mt-8 text-center"
        >
          <button
            type="button"
            onClick={() => navigate("home")}
            className="group inline-flex items-center gap-2 text-xs font-bold text-[#6B7280] transition-colors hover:text-[#0D9A55]"
          >
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15 19-7-7 7-7"
              />
            </svg>

            Back to Singh Medical Stores
          </button>
        </motion.div>
      </main>
    </div>
  );
}

/* =========================================================
   EXPORTS
========================================================= */

export function TermsPage() {
  return <Legal type="terms" />;
}

export function PrivacyPage() {
  return <Legal type="privacy" />;
}
