import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSiteConfig } from '../utils/data';
import LoginButton from './LoginButton';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const config = getSiteConfig();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    const newTheme = !darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: '首页', icon: 'home' },
    { path: '/category/tech', label: '技术', icon: 'code' },
    { path: '/category/life', label: '生活', icon: 'favorite' },
    { path: '/admin', label: '管理', icon: 'settings' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container-fluid px-4">
        <Link to="/" className="navbar-brand">
          {config.title.replace('的博客', '')}
        </Link>
        <button className="navbar-toggler" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className="material-icons">menu</span>
        </button>
        <div className={`navbar-nav ${mobileMenuOpen ? 'show' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span className="material-icons">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          <button className="nav-link theme-toggle" onClick={toggleDarkMode} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;