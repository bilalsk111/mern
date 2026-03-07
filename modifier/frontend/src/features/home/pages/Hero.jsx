import React from "react";
import { Link } from "react-router-dom";
import {
  Play,
  ScanFace,
  Activity,
  Music2,
  Zap,
  Twitter,
  Github,
  Linkedin,
  Instagram,
} from "lucide-react";
import "../style/Hero.scss";
import Navbar from "../components/Navbar";

const Hero = () => {
  return (
    <div className="hero-page-wrapper">
      {/* --- SECTION 1: HERO --- */}
      <Navbar />
      <section className="hero-main-section">
        <div className="hero-container">
          <div className="hero-text-content">
            <div className="ai-badge">
              <Zap size={14} fill="currentColor" />
              <span>AI-Powered Music Discovery</span>
            </div>
            <h1 className="hero-title">
              Your Face <br />
              <span className="gradient-text">Chooses the Music</span>
            </h1>
            <p className="hero-description">
              Experience the future of music discovery. Our AI analyzes your
              facial expressions in real-time to curate the perfect soundtrack
              for your soul.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary-action">
                <ScanFace size={20} />
                <span>Start Detection</span>
              </Link>
              <button className="btn-demo-action">
                <Play size={18} fill="currentColor" />
                <span>Watch Demo</span>
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <strong>95%</strong>
                <span>Accuracy</span>
              </div>
              <div className="stat-item">
                <strong>10K+</strong>
                <span>Users</span>
              </div>
              <div className="stat-item">
                <strong>50K+</strong>
                <span>Songs</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="image-container">
              {/* Ensure hero-preview.jpg is inside your 'public' folder */}
              <img
                src="https://images.unsplash.com/photo-1758876019427-e2e5bf9a92c5?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="EmotionTune Dashboard"
                className="main-img"
              />
              <div className="glass-card mood-tag">
                <span className="emoji">😊</span>
                <div className="tag-text">
                  <span className="label">Detected Mood</span>
                  <span className="value">Happy — 94%</span>
                </div>
              </div>
              <div className="glass-card playing-tag">
                <div className="icon-pulse">
                  <Music2 size={18} />
                </div>
                <div className="tag-text">
                  <span className="label">Playing Now</span>
                  <span className="value">Summer Chill Vibe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: HOW IT WORKS --- */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to your perfect vibe</p>
        </div>
        <div className="steps-grid">
          {[
            {
              id: "01",
              title: "Open Camera",
              desc: "Allow camera access for our AI to see your vibe.",
            },
            {
              id: "02",
              title: "Detect Emotion",
              desc: "Our neural engine identifies your current mood.",
            },
            {
              id: "03",
              title: "Get Songs",
              desc: "Enjoy a curated playlist tailored just for you.",
            },
          ].map((step) => (
            <div key={step.id} className="step-card">
              <span className="step-number">{step.id}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECTION 3: CTA --- */}
      <section className="cta-banner-wrapper">
        <div className="cta-banner">
          <h2>Ready to discover your soundtrack?</h2>
          <p>Join thousands of users experiencing music through AI.</p>
          <Link to="/register" className="btn-white">
            <ScanFace size={18} /> Try Mood Detection Now
          </Link>
        </div>
      </section>

      {/* --- SECTION 4: PREMIUM FOOTER --- */}
      <footer className="main-footer">
        <div className="footer-top">
          <div className="brand-col">
            <div className="footer-logo">EmotionTune</div>
            <p className="brand-desc">
              Merging artificial intelligence with human emotion to redefine
              your auditory experience.
            </p>
          </div>
          <div className="links-col">
            <div className="link-group">
              <h6>Product</h6>
              <span>Features</span>
              <span>Solutions</span>
              <span>Releases</span>
            </div>
            <div className="link-group">
              <h6>Company</h6>
              <span>About Us</span>
              <span>Contact</span>
              <span>Careers</span>
            </div>
            <div className="link-group">
              <h6>Legal</h6>
              <span>Privacy</span>
              <span>Terms</span>
              <span>Security</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 EmotionTune. All rights reserved.</p>
          <div className="footer-socials">
            <Twitter size={18} />
            <Github size={18} />
            <Linkedin size={18} />
            <Instagram size={18} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
