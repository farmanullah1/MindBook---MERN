/**
 * CodeDNA
 * Login.tsx — login page
 * exports: none
 * used_by: internal
 * rules: Glassmorphism, centered layout, premium branding
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Redesigned with glassmorphism
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    const result = await dispatch(loginUser({ email: email.trim(), password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Branding Section */}
        <div className="auth-branding-center">
          <div className="auth-logo-large">
            <svg width="80" height="80" viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F7B928" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" />
              <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="24" fontWeight="900">M</text>
            </svg>
            <h1 className="auth-title-large">MindBook</h1>
          </div>
          <p className="auth-tagline-center">
            The world's most vibrant community. Connect, share, and grow together.
          </p>
        </div>

        {/* Login Card */}
        <div className="auth-card-glass">
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Log in to your account to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            {error && <div className="auth-error">{error}</div>}
            
            <div className="input-group">
              <input
                type="email"
                className="input-field-modern"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field-modern"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pw-eye-modern" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div className="auth-footer-links">
              <a href="#forgot" className="forgot-password">Forgotten password?</a>
            </div>

            <div className="demo-credentials" style={{ textAlign: 'center', margin: '12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <p>Demo: demo@example.com / demo1234</p>
            </div>

            <div className="auth-divider">or</div>

            <div className="auth-footer-links" style={{ marginTop: '0' }}>
              <Link to="/register" className="create-account-link">
                <button type="button" className="btn btn-success btn-lg" style={{ width: '100%', fontWeight: 700 }}>
                  Create new account
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>

      <footer className="auth-footer-brand">
        <p>MindBook © {new Date().getFullYear()}. Built for community.</p>
      </footer>
    </div>
  );
};

export default Login;
