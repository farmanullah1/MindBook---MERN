/**
 * CodeDNA
 * Login.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';
import './Auth.css';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    const result = await dispatch(loginUser({ email: email.trim(), password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-container">
        {/* Left Section - Branding */}
        <div className="auth-branding">
          <div className="auth-logo">
            <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="var(--brand-primary)" />
              <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="24" fontWeight="900" fontFamily="Arial, sans-serif">M</text>
            </svg>
            <h1 className="auth-title">MindBook</h1>
          </div>
          <p className="auth-tagline">
            Connect with friends and the world around you on MindBook.
          </p>
        </div>

        {/* Right Section - Login Form */}
        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            {error && (
              <div className="auth-error" id="login-error">
                {error}
              </div>
            )}

            <div className="input-group">
              <input
                type="email"
                className="input-field"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="login-email"
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="login-password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading || !email.trim() || !password.trim()}
              id="login-submit"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Logging in...
                </span>
              ) : (
                'Log In'
              )}
            </button>

            <div className="auth-link-wrapper">
              <Link to="/register" className="auth-forgot-link">Forgotten password?</Link>
            </div>

            <div className="auth-divider">
              <span />
            </div>

            <div className="auth-link-wrapper">
              <Link to="/register" className="btn btn-secondary btn-lg auth-create-btn" id="create-account-link">
                Create new account
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="auth-footer">
        <p>MindBook © 2024. A social media experience.</p>
      </footer>
    </div>
  );
};

export default Login;
