import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../hook/useAuth';
import { useSelector } from 'react-redux';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    const { handleLogin } = useAuth()

    const navigate = useNavigate()

    const submitForm = async (event) => {
        event.preventDefault()

        const payload = {
            email,
            password,
        }

        await handleLogin(payload)
        navigate("/")

    }

    if(!loading && user){
        return <Navigate to="/" replace />
    }
    return (
        <section className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-10 text-zinc-100">
            {/* Background Glows (Same as your code) */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#31b8c6]/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Welcome <span className="text-[#31b8c6]">Back</span>
                        </h1>
                    </div>

                    <form onSubmit={submitForm} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 pr-4 py-3 text-sm outline-none focus:border-[#31b8c6]/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 pr-12 py-3 text-sm outline-none focus:border-[#31b8c6]/50"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-[#31b8c6] px-4 py-3.5 font-bold text-zinc-950 hover:bg-[#45c7d4] disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Login;