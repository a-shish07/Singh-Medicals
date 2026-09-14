import { useApp } from "../context";
import type { Page } from "../types";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const { navigate } = useApp();

  const link = (label: string, p: Page) => (
    <li key={label}>
      <button
        onClick={() => navigate(p)}
        className="text-sm text-white/50 hover:text-[#0D9A55] transition-colors"
      >
        {label}
      </button>
    </li>
  );

  return (
    <footer className="bg-[#1C1C1E] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex h-20 w-16 items-center justify-center bg-transparent"
              >
                <img
                  src="/logo.png"
                  alt="Singh Medical Stores"
                  className="h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)] rounded-4xl"
                />
              </motion.div>

              <div>
                <p
                  className="font-bold text-sm leading-tight"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Singh Medical Stores
                </p>

                <p className="text-[10px] text-white/50 leading-tight uppercase tracking-wide">
                  Wholesale Pharma · Est. 1998
                </p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Trusted wholesale pharmaceutical distributor serving retail
              pharmacies across Eastern UP since 1998.
            </p>
            <a
              href="https://wa.me/918174958839"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/20 text-[#4ade80] rounded-xl text-xs font-semibold hover:bg-[#25D366]/30 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Order on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-semibold text-sm mb-4 text-white/80"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2">
              {link("Home", "home")}
              {link("Shop / Catalogue", "catalogue")}
              {link("About Us", "about")}
              {link("Contact Us", "contact")}
              {link("FAQ", "faq")}
              {link("Track Your Order", "tracking")}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4
              className="font-semibold text-sm mb-4 text-white/80"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Account
            </h4>
            <ul className="flex flex-col gap-2">
              {link("Login / Register", "login")}
              {link("My Orders", "orders")}
              {link("My Cart", "cart")}
              {link("Terms & Conditions", "terms")}
              {link("Privacy Policy", "privacy")}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-semibold text-sm mb-4 text-white/80"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Contact Us
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/918174958839"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-white/60 hover:text-[#0D9A55] transition-colors"
              >
                <svg
                  className="w-4 h-4 text-[#0D9A55] shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                +91 98765 43210
              </a>
              <div className="flex items-start gap-2.5 text-sm text-white/60">
                <svg
                  className="w-4 h-4 text-[#0D9A55] shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
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
                <span>
                  Padrauna Medical Complex,
                  <br />
                  Padrauna, Kushinagar,
                  <br />
                  Uttar Pradesh — 274304
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/60">
                <svg
                  className="w-4 h-4 text-[#0D9A55] shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                orders@singhmedical.in
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/30">
            © 2024 Singh Medical Stores. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Drug Licence No. UP-19-000123 · GST: 09XXXXX1234X1Z5
          </p>
        </div>
      </div>
    </footer>
  );
}
