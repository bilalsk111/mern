import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../hook/useAuth';
import { useSelector } from 'react-redux';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { handleRegister } = useAuth();
  const { loading } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const submitForm = async (event) => {
    event.preventDefault();
    const result = await handleRegister({ username, email, password });
    
    if (result) {
        navigate('/login');
    }
  };

  return (
    <section className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-10 text-zinc-100">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#31b8c6]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#31b8c6]/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-md transition-all hover:border-[#31b8c6]/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Create <span className="text-[#31b8c6]">Account</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Join us to start your journey today.
            </p>
          </div>

          <form onSubmit={submitForm} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-zinc-300 ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#31b8c6] transition-colors">
                  <User size={18} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 pr-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-[#31b8c6]/50 focus:ring-2 focus:ring-[#31b8c6]/20"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#31b8c6] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 pr-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-[#31b8c6]/50 focus:ring-2 focus:ring-[#31b8c6]/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-300 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#31b8c6] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 pr-12 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-[#31b8c6]/50 focus:ring-2 focus:ring-[#31b8c6]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full overflow-hidden rounded-xl bg-[#31b8c6] px-4 py-3.5 font-bold text-zinc-950 transition-all hover:bg-[#45c7d4] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Create Account"
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#31b8c6] hover:text-[#45c7d4] transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;