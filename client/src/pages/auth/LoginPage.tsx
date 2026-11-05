"use client";

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, type Variants } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import logoImage from "../../images/ScanCart Dynamic QR Cart Logo.png";
import { UserCheck, ShieldCheck } from "lucide-react";

// Google SVG Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("customer@scancart.store");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login, isLoading, error, clearError } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      showToast("Welcome back to ScanCart", "success");
      navigate(from, { replace: true });
    } catch {}
  };

  const handleQuickFill = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    clearError();
    try {
      await login(demoEmail, "Password123!");
      showToast(`Logged in as ${demoEmail.split("@")[0]}`, "success");
      navigate(from, { replace: true });
    } catch {}
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-sans text-slate-900 antialiased selection:bg-[#FDBA5E]/20 selection:text-[#EFA541] lg:flex-row">
      {/* Left Image Panel */}
      <div className="relative hidden w-full flex-col p-4 lg:flex lg:min-h-screen lg:w-1/2">
        <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-neutral-100 shadow-xl">
          <img
            src="https://assets.watermelon.sh/auth-13.avif"
            alt="Abstract retail gradients"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Logo overlay with ScanCart branding */}
          <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-lg">
            <img
              src={logoImage}
              alt="ScanCart Logo"
              className="w-9 h-9 object-contain rounded-xl bg-white p-0.5"
            />
            <div>
              <span className="text-white font-serif text-xl tracking-tight font-medium block leading-tight">
                ScanCart
              </span>
              <span className="text-white/80 text-[10px] uppercase font-mono tracking-widest block">
                Express Self-Checkout
              </span>
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8 bg-black/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white">
            <p className="font-serif text-2xl font-medium leading-snug">
              "Skip the queue. Scan as you shop, pay on your phone, and walk out."
            </p>
            <p className="text-xs text-white/70 font-mono mt-2">
              ScanCart Retail Store Express #104
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[400px]"
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="mb-3 text-[48px] font-semibold leading-[1.05] tracking-tight text-[#1C222B]">
              Welcome
              <br />
              back
            </h1>
            <p className="text-[15px] text-slate-500 text-balance">
              Sign in to scan barcodes, manage your cart, and access instant exit passes.
            </p>
          </motion.div>

          {error && (
            <motion.div
              variants={itemVariants}
              className="p-3 mb-5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[14px] font-medium text-slate-800">
                Email or username
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@scancart.store"
                required
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-[#FDBA5E] focus:outline-none focus:ring-1 focus:ring-[#FDBA5E] transition-colors"
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label htmlFor="password" className="text-[14px] font-medium text-slate-800">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 pr-10 text-[14px] font-mono text-slate-900 placeholder:text-slate-400 focus:border-[#FDBA5E] focus:outline-none focus:ring-1 focus:ring-[#FDBA5E] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <HugeiconsIcon icon={showPassword ? ViewIcon : ViewOffIcon} className="size-5" />
                </button>
              </div>
            </motion.div>

            {/* Checkbox & Forgot Password */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2.5">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-[18px] rounded border-slate-300 text-[#FDBA5E] focus:ring-[#FDBA5E] transition-colors cursor-pointer"
                />
                <label htmlFor="remember" className="text-[14px] text-slate-600 cursor-pointer">
                  Keep me signed in
                </label>
              </div>
              <button
                type="button"
                onClick={() => showToast("Default password for all demo accounts is Password123!", "info")}
                className="text-[14px] font-medium text-slate-800 underline decoration-slate-800 underline-offset-4 transition-colors hover:text-black hover:decoration-black"
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Sign in Button */}
            <motion.div variants={itemVariants} className="mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-[#FDBA5E] py-3 text-[14px] font-medium text-slate-900 transition-transform active:scale-[0.98] hover:bg-[#EFA541] disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </motion.div>
          </form>

          {/* Google Button */}
          <motion.div variants={itemVariants} className="mt-4">
            <button
              type="button"
              onClick={() => handleQuickFill("customer@scancart.store")}
              className="flex w-full items-center justify-center gap-2.5 rounded-md border border-slate-200 bg-white py-3 text-[14px] font-medium text-slate-700 transition-transform active:scale-[0.98] hover:bg-slate-50"
            >
              <GoogleIcon className="size-[18px]" />
              Sign in with Google
            </button>
          </motion.div>

          {/* Quick Demo Credentials */}
          <motion.div variants={itemVariants} className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              1-Click Demo Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("customer@scancart.store")}
                className="flex items-center gap-2 p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors text-xs"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block text-slate-800">Customer</span>
                  <span className="text-[10px] text-slate-500 font-mono">customer@...</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("staff@scancart.store")}
                className="flex items-center gap-2 p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors text-xs"
              >
                <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block text-slate-800">Exit Staff</span>
                  <span className="text-[10px] text-slate-500 font-mono">staff@...</span>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center text-[14px] text-slate-500">
            Haven&apos;t joined yet?{" "}
            <Link
              to="/register"
              className="font-semibold text-slate-800 underline decoration-slate-800 underline-offset-4 transition-colors hover:text-black hover:decoration-black"
            >
              Sign up
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
