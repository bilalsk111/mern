import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  MailCheck,
} from "lucide-react";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resending, setResending] = useState(false);
  const [uiError, setUiError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { handleRegister, handleResend } = useAuth();
  const loading = useSelector((state) => state.auth.loading);
  const navigate = useNavigate();

  const submitForm = async (event) => {
    event.preventDefault();
    setUiError("");

    if (!username || !email || !password) {
      setUiError("Please fill in all fields.");
      return;
    }

    const result = await handleRegister({ username, email, password });

    if (result && result.success) {
      setIsSuccess(true);
    } else {
      setUiError(result?.errorMsg || "Registration failed. Please try again.");
    }
  };
  // const handleResendClick = async () => {
  //   try {
  //     setResending(true);
  //     await handleResend(email);
  //     alert("Verification email sent!");
  //   } catch (err) {
  //     alert(err.response?.data?.message || "Failed");
  //   } finally {
  //     setResending(false);
  //   }
  // };
  if (isSuccess) {
    return (
      <main className="min-h-screen w-full flex flex-col justify-center items-center bg-[#000000] selection:bg-white/20 relative overflow-hidden font-sans">
        <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none bg-[radial-gradient(ellipse_at_top_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px] px-5 sm:px-0 z-10 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <MailCheck size={32} className="text-white" />
          </div>

          <h2 className="text-[28px] font-semibold text-white mb-3 tracking-tight">
            Check your inbox
          </h2>
          <p className="text-[#a1a1aa] text-[15px] mb-8 leading-relaxed">
            We've sent a verification link to <br />
            <span className="text-white font-medium">{email}</span>
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.open("https://mail.google.com", "_blank")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black px-4 py-3.5 text-[15px] font-semibold transition-all hover:bg-zinc-200 active:scale-[0.98] shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              Open Gmail <ArrowRight size={18} />
            </button>
            {/* <button
              onClick={handleResendClick}
              disabled={resending}
              className="text-sm text-violet-400 hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </button> */}
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-transparent px-4 py-3.5 text-[15px] font-medium text-zinc-400 transition-all hover:text-white hover:bg-white/5"
            >
              I've already verified
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-[#000000] selection:bg-white/20 relative overflow-hidden font-sans">
      {/* Ultra-subtle top spotlight */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none bg-[radial-gradient(ellipse_at_top_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] px-5 sm:px-0 z-10"
      >
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Sparkles size={24} className="text-black" />
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-white mb-2">
            Create an account
          </h1>
          <p className="text-[#a1a1aa] text-[15px]">
            Join Cognivex to get started
          </p>
        </div>

        <div className="w-full">
          <form onSubmit={submitForm} className="space-y-4">
            {/* Error Banner */}
            <AnimatePresence>
              {uiError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 mb-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[14px] text-red-400 text-center font-medium">
                    {uiError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[15px] text-white placeholder:text-zinc-600 outline-none focus:bg-white/[0.04] focus:border-white/20 focus:ring-4 focus:ring-white/[0.02] transition-all"
                required
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[15px] text-white placeholder:text-zinc-600 outline-none focus:bg-white/[0.04] focus:border-white/20 focus:ring-4 focus:ring-white/[0.02] transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-4 pr-11 py-3 text-[15px] text-white placeholder:text-zinc-600 outline-none focus:bg-white/[0.04] focus:border-white/20 focus:ring-4 focus:ring-white/[0.02] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1 outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white text-black px-4 py-3 mt-4 text-[15px] font-semibold hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-zinc-500" size={18} />
                  <span className="text-zinc-500">Creating account...</span>
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-[14px] text-zinc-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-zinc-300 hover:text-white transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Register;
