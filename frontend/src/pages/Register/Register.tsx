/**
 * CodeDNA
 * Register.tsx — register page
 * exports: none
 * used_by: internal
 * rules: Glassmorphism, centered layout, premium branding, legal checkboxes
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Redesigned with glassmorphism
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import './Auth.css';

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!firstName.trim() || !lastName.trim()) {
      setLocalError('First name and last name are required');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      setLocalError('You must agree to both the Terms and Privacy Policy');
      return;
    }

    const result = await dispatch(registerUser({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      password,
    }));

    if (registerUser.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() &&
    password.length >= 8 && confirmPassword && password === confirmPassword && agreeTerms && agreePrivacy;

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Branding Section */}
        <div className="auth-branding-center">
          <div className="auth-logo-large">
            <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
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
            Join the most vibrant community on the web.
          </p>
        </div>

        {/* Register Card */}
        <div className="auth-card-glass">
          {success ? (
            <div className="auth-success" style={{ textAlign: 'center', padding: '40px 0' }}>
              <FiCheckCircle size={64} color="var(--success-color)" style={{ marginBottom: '20px' }} />
              <h2>Welcome Aboard!</h2>
              <p>Your account has been created successfully.</p>
              <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>Redirecting to login...</p>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <h2>Create Account</h2>
                <p>It's quick, easy, and always will be.</p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {(error || localError) && (
                  <div className="auth-error">{error || localError}</div>
                )}

                <div className="input-row">
                  <div className="input-group">
                    <input
                      type="text"
                      className="input-field-modern"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      className="input-field-modern"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                      placeholder="New password (8+ characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" className="pw-eye-modern" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <input
                    type="password"
                    className="input-field-modern"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-legal-modern">
                  <p>By clicking Sign Up, you agree to our policies.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label className="auth-checkbox-modern">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>I agree to the <a href="#terms">Terms of Service</a></span>
                  </label>

                  <label className="auth-checkbox-modern">
                    <input
                      type="checkbox"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                    />
                    <span>I agree to the <a href="#privacy">Privacy & Data Policy</a></span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading || !isFormValid}
                  style={{ marginTop: '12px' }}
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </button>

                <div className="auth-footer-links">
                  <Link to="/login">Already have an account?</Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <footer className="auth-footer-brand">
        <p>MindBook © {new Date().getFullYear()}. Built for community.</p>
      </footer>
    </div>
  );
};

export default Register;
