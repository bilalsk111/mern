import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../style/login.scss';
import InputField from '../components/InputField';
import { Mail, Lock, Eye, EyeOff, Music, ArrowLeft } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate();
    const { handleLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await handleLogin({ email, password });
            if (response) navigate("/home");
        } catch (error) {
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="auth-page">
            {/* Back Button */}
            <div className="back-button" onClick={() => navigate('/')}>
                <ArrowLeft size={20} />
                <span>Back</span>
            </div>

            <section className="auth-hero">
                <div className="hero-content">
                    <h1>Welcome back to the sound of you</h1>
                    <p>Login to access your personalized emotion-driven playlists and saved tracks.</p>
                    <ul className="features-list">
                        <li><span>🎧</span> Resume your musical journey</li>
                        <li><span>⚡</span> Instant mood-based syncing</li>
                        <li><span>🔐</span> Secure access to your profile</li>
                    </ul>
                </div>
            </section>

            <section className="auth-form-container">
                <div className="form-box">
                    <header className="brand">
                        <div className="logo-icon">
                            <Music size={22} color="white" strokeWidth={2.5} />
                        </div>
                        <span className="brand-name">EmotionTune</span>
                    </header>

                    <div className="form-header">
                        <h2>Welcome Back</h2>
                        <p>Enter your credentials to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <InputField 
                                type='email'
                                placeholder='you@example.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                Icon={Mail}
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <InputField 
                                type={showPassword ? "text" : "password"}
                                placeholder='••••••••'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                Icon={Lock}
                                rightElement={
                                    <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </div>
                                }
                            />
                        </div>

                        <button type='submit' className="btn-primary">Sign In →</button>
                    </form>

                    <div className="divider"><span>Or continue with</span></div>

                    <button type="button" className="btn-google">
                       <img src="https://imgs.search.brave.com/XkgiaTCt92iT6Xxd3FDAHnEzUssLR_jeCamxvnuv5Rw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wbmdp/bWcuY29tL3VwbG9h/ZHMvZ29vZ2xlL3Nt/YWxsL2dvb2dsZV9Q/TkcxOTYzNS5wbmc" alt="Google" width="20" />
                        Continue with Google
                    </button>

                    <p className="auth-footer">
                        Don't have an account? <span className='link' onClick={() => navigate('/register')}>Register now</span>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Login;