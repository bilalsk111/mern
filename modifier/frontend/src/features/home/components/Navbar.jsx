import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Search, User, Menu, X, LayoutGrid } from 'lucide-react';
import '../../home/style/Navbar.scss';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll effect to add background blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        
        {/* LOGO SECTION */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">
            <Music size={20} />
          </div>
          <span>EmotionTune</span>
        </Link>

        {/* CENTER LINKS (Desktop) */}
        <div className="nav-links-desktop">
          <Link to="/" className="nav-link">Discover</Link>
          <Link to="/" className="nav-link">How it Works</Link>
          <Link to="/" className="nav-link">Features</Link>
          <Link to="/" className="nav-link premium">Go Pro</Link>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="nav-actions">
          <button className="icon-btn search-btn">
            <Search size={18} />
          </button>
          
          <div className="auth-group">
            <Link to="/login" className="login-link">Login</Link>
            <Link to="/register" className="signup-btn">Get Started</Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="mobile-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
<div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
  {/* Close Button for better UX */}
  <div className="mobile-menu-links">
    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Discover</Link>
    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>How it Works</Link>
    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
  </div>
  
  <div className="mobile-menu-auth">
    <Link to="/login" className="mobile-auth" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
    <Link to="/register" className="mobile-signup" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
  </div>
</div>
    </nav>
  );
};

export default Navbar;