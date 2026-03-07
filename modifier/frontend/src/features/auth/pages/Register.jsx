import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Music,ArrowLeft } from 'lucide-react';
import '../style/register.scss';
import InputField from '../components/InputField';

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { handleRegister } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return alert("Passwords do not match");
        try {
            await handleRegister({ username, email, password });
            navigate("/home");
        } catch (error) {
            alert(error.response?.data?.message || "Register failed");
        }
    };

    return (
        <div className="auth-page">
            <div className="back-button" onClick={() => navigate('/')}>
                <ArrowLeft size={20} />
                <span>Back</span>
            </div>
            <section className="auth-hero">
                <div className="hero-content">
                    <h1>Join the future of music discovery</h1>
                    <p>Experience personalized music recommendations powered by cutting-edge emotion detection AI.</p>
                    <ul className="features-list">
                        <li><span>🎵</span> Unlimited mood-based recommendations</li>
                        <li><span>❤️</span> Save and organize your favorite tracks</li>
                        <li><span>📊</span> Track your emotional journey over time</li>
                        <li><span>🎨</span> Personalized playlists just for you</li>
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
                        <h2>Create account</h2>
                        <p>Start your personalized music journey today</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Username</label>
                            <InputField 
                                type='text'
                                placeholder='johndoe'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                Icon={User}
                            />
                        </div>

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
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                }
                            />
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <InputField
                                type="password"
                                placeholder='••••••••'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                Icon={Lock}
                            />
                        </div>

                        <div className="terms-checkbox">
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms">
                                I agree to the <span className="link">Terms of Service</span> and <span className="link">Privacy Policy</span>
                            </label>
                        </div>

                        <button type='submit' className="btn-primary">Create Account →</button>
                    </form>

                    <div className="divider"><span>Or continue with</span></div>

                    <button type="button" className="btn-google">
                        <img src="https://imgs.search.brave.com/XkgiaTCt92iT6Xxd3FDAHnEzUssLR_jeCamxvnuv5Rw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wbmdp/bWcuY29tL3VwbG9h/ZHMvZ29vZ2xlL3Nt/YWxsL2dvb2dsZV9Q/TkcxOTYzNS5wbmc" alt="Google" width="20" />
                        Continue with Google
                    </button>

                    <p className="auth-footer">
                        Already have an account? <span className='link' onClick={() => navigate('/login')}>Sign in</span>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Register;