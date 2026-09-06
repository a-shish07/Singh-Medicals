import { useState } from "react";
import { useApp } from "../context";
import { loginWithEmail, registerWithEmail } from "../lib/api";

export default function Login() {
  const {
    completeCustomerLogin,
    adminLogin,
    addToast,
    navigate,
  } = useApp();

  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      /*
       * =========================================================
       * REGISTER
       * =========================================================
       */
      if (mode === "register") {
        const result = await registerWithEmail({
          name: name.trim(),
          email: cleanEmail,
          password,
          phone,
        });

        /*
         * Registration creates CUSTOMER accounts.
         */
        completeCustomerLogin(
          result.profile.phone,
          result.profile,
          result.token
        );

        addToast("Your account has been created.", "success");

        navigate("profile");
        return;
      }

      /*
       * =========================================================
       * LOGIN
       * =========================================================
       */
      const result = await loginWithEmail(
        cleanEmail,
        password
      );

      /*
       * ADMIN LOGIN
       *
       * loginWithEmail tells us the user's role.
       * If ADMIN, use adminLogin so the token is stored
       * in the separate admin session.
       */
      if (result.profile.role === "ADMIN") {
        await adminLogin(cleanEmail, password);

        addToast(
          "Administrator signed in successfully.",
          "success"
        );

        navigate("admin");
        return;
      }

      /*
       * =========================================================
       * CUSTOMER LOGIN
       * =========================================================
       */
      completeCustomerLogin(
        result.profile.phone,
        result.profile,
        result.token
      );

      addToast("You are signed in.", "success");

      navigate("profile");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F5F7F5]">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0D9A55] text-white flex items-center justify-center text-2xl font-bold">
            +
          </div>

          <h1 className="mt-3 text-xl font-extrabold text-[#1C1C1E]">
            Singh Medical Stores
          </h1>

          <p className="text-sm text-[#6B7280]">
            Retailer portal
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-[0_8px_48px_rgba(0,0,0,0.08)] p-7 space-y-4"
        >
          <div>
            <h2 className="text-lg font-bold">
              {mode === "login"
                ? "Sign in"
                : "Create an account"}
            </h2>

            <p className="text-sm text-[#6B7280]">
              Use an email address and password.
            </p>
          </div>

          {/* Name */}
          {mode === "register" && (
            <label className="block text-sm font-semibold">
              Full name

              <input
                required
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                autoComplete="name"
                className="mt-1.5 w-full px-4 py-3 bg-[#F5F7F5] border border-black/[.08] rounded-xl font-normal outline-none focus:border-[#0D9A55]"
              />
            </label>
          )}

          {/* Email */}
          <label className="block text-sm font-semibold">
            Email address

            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              className="mt-1.5 w-full px-4 py-3 bg-[#F5F7F5] border border-black/[.08] rounded-xl font-normal outline-none focus:border-[#0D9A55]"
            />
          </label>

          {/* Phone */}
          {mode === "register" && (
            <label className="block text-sm font-semibold">
              Phone number{" "}
              <span className="font-normal text-[#6B7280]">
                (for order tracking)
              </span>

              <input
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                inputMode="numeric"
                autoComplete="tel"
                className="mt-1.5 w-full px-4 py-3 bg-[#F5F7F5] border border-black/[.08] rounded-xl font-normal outline-none focus:border-[#0D9A55]"
              />
            </label>
          )}

          {/* Password */}
          <label className="block text-sm font-semibold">
            Password

            <input
              required
              type="password"
              minLength={8}
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="At least 8 characters"
              className="mt-1.5 w-full px-4 py-3 bg-[#F5F7F5] border border-black/[.08] rounded-xl font-normal outline-none focus:border-[#0D9A55]"
            />
          </label>

          {/* Confirm Password */}
          {mode === "register" && (
            <label className="block text-sm font-semibold">
              Confirm password

              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                className="mt-1.5 w-full px-4 py-3 bg-[#F5F7F5] border border-black/[.08] rounded-xl font-normal outline-none focus:border-[#0D9A55]"
              />
            </label>
          )}

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#0D9A55] text-white rounded-2xl font-bold disabled:opacity-60 hover:bg-[#0A7A43] transition-colors"
          >
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>

          {/* Toggle */}
          <button
            type="button"
            onClick={() => {
              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              );
              setError("");
            }}
            className="w-full text-sm text-[#0D9A55] font-semibold"
          >
            {mode === "login"
              ? "New retailer? Create an account"
              : "Already have an account? Sign in"}
          </button>

          {/* Admin hint */}
          {mode === "login" && (
            <p className="pt-2 text-center text-xs text-[#9CA3AF]">
              Administrator accounts are automatically
              redirected to the Admin Dashboard.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}