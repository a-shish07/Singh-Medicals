
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context";

export default function Navbar() {
  const {
    navigate,
    cartCount,
    setIsCartOpen,
    isLoggedIn,
    setIsLoggedIn,
    addToast,
    page,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const navLinks = [
    {
      label: "Home",
      page: "home" as const,
    },
    {
      label: "Shop",
      page: "catalogue" as const,
    },
    {
      label: "About Us",
      page: "about" as const,
    },
    {
      label: "Contact",
      page: "contact" as const,
    },
    {
      label: "FAQ",
      page: "faq" as const,
    },
  ];

  const isActive = (p: string) =>
    page === p;

  const handleNavigation = (
    target: typeof navLinks[number]["page"]
  ) => {
    navigate(target);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/90 shadow-[0_2px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">

      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <div className="flex h-[68px] items-center justify-between gap-4">

          {/* =====================================================
              LOGO
          ====================================================== */}

          <motion.button
            type="button"
            onClick={() =>
              handleNavigation("home")
            }
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="group flex shrink-0 items-center gap-2.5"
          >
            <motion.div
              whileHover={{
                rotate: 5,
                scale: 1.06,
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D9A55] to-[#0A7A43] shadow-[0_3px_10px_rgba(13,154,85,0.28)]"
            >
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15M19.5 12h-15"
                />
              </svg>
            </motion.div>

            <div className="text-left">
              <p
                className="text-sm font-extrabold leading-tight tracking-tight text-[#1C1C1E]"
                style={{
                  fontFamily:
                    "'DM Sans', sans-serif",
                }}
              >
                Singh Medical
              </p>

              <p className="text-[9px] font-semibold uppercase leading-tight tracking-[0.18em] text-[#6B7280]">
                Stores
              </p>
            </div>
          </motion.button>

          {/* =====================================================
              DESKTOP NAV
          ====================================================== */}

          <nav className="hidden items-center gap-1 md:flex">

            {navLinks.map((link) => (
              <button
                key={link.page}
                type="button"
                onClick={() =>
                  handleNavigation(link.page)
                }
                className={`relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive(link.page)
                    ? "text-[#0D9A55]"
                    : "text-[#6B7280] hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                }`}
              >
                {link.label}

                {isActive(link.page) && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#0D9A55]"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* =====================================================
              RIGHT ACTIONS
          ====================================================== */}

          <div className="flex items-center gap-1.5">

            {/* Orders */}
            {isLoggedIn && (
              <motion.button
                type="button"
                onClick={() =>
                  navigate("orders")
                }
                whileHover={{
                  y: -1,
                }}
                className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55] sm:flex"
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
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                  />
                </svg>

                My Orders
              </motion.button>
            )}

            {/* Login / Logout */}
            <motion.button
              type="button"
              onClick={() => {
                if (isLoggedIn) {
                  setIsLoggedIn(false);

                  addToast(
                    "Logged out successfully",
                    "info"
                  );
                } else {
                  navigate("login");
                }
              }}
              whileHover={{
                y: -1,
              }}
              className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55] sm:flex"
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
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>

              {isLoggedIn
                ? "Logout"
                : "Login"}
            </motion.button>

            {/* Admin */}
            <motion.button
              type="button"
              onClick={() =>
                navigate("admin")
              }
              whileHover={{
                y: -1,
              }}
              className="hidden rounded-xl border border-black/[0.07] px-3 py-2 text-xs font-semibold text-[#6B7280] transition-all hover:border-[#0D9A55]/20 hover:bg-[#E8F5EE] hover:text-[#0D9A55] sm:flex"
            >
              Admin
            </motion.button>

            {/* =================================================
                CART
            ================================================== */}

            <motion.button
              type="button"
              onClick={() =>
                setIsCartOpen(true)
              }
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.94,
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-[#E8F5EE]"
            >
              <svg
                className="h-5 w-5 text-[#1C1C1E] transition-colors group-hover:text-[#0D9A55]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>

              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                    }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0D9A55] px-1 text-[9px] font-extrabold text-white shadow-[0_3px_10px_rgba(13,154,85,0.35)]"
                  >
                    {cartCount > 99
                      ? "99+"
                      : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile menu */}
            <motion.button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (v) => !v
                )
              }
              whileTap={{
                scale: 0.9,
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-[#E8F5EE] md:hidden"
            >
              <svg
                className="h-5 w-5 text-[#1C1C1E]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    mobileMenuOpen
                      ? "M6 18 18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className="overflow-hidden md:hidden"
            >
              <div className="border-t border-black/[0.06] py-3">

                {navLinks.map(
                  (link, index) => (
                    <motion.button
                      key={link.page}
                      type="button"
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.04,
                      }}
                      onClick={() =>
                        handleNavigation(
                          link.page
                        )
                      }
                      className={`mb-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                        isActive(link.page)
                          ? "bg-[#E8F5EE] text-[#0D9A55]"
                          : "text-[#6B7280] hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                      }`}
                    >
                      {link.label}

                      {isActive(
                        link.page
                      ) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0D9A55]" />
                      )}
                    </motion.button>
                  )
                )}

                <div className="my-2 h-px bg-black/[0.06]" />

                <button
                  type="button"
                  onClick={() => {
                    navigate("tracking");
                    setMobileMenuOpen(
                      false
                    );
                  }}
                  className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                >
                  Track Order
                </button>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("orders");
                      setMobileMenuOpen(
                        false
                      );
                    }}
                    className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                  >
                    My Orders
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isLoggedIn) {
                      setIsLoggedIn(
                        false
                      );

                      addToast(
                        "Logged out",
                        "info"
                      );

                      navigate(
                        "home"
                      );
                    } else {
                      navigate(
                        "login"
                      );
                    }

                    setMobileMenuOpen(
                      false
                    );
                  }}
                  className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                >
                  {isLoggedIn
                    ? "Logout"
                    : "Login / Register"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("admin");
                    setMobileMenuOpen(
                      false
                    );
                  }}
                  className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                >
                  Admin Panel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}