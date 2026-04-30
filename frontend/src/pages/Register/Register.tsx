/**
 * CodeDNA
 * Register.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [birthdate, setBirthdate] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [localError, setLocalError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
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

    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }

    if (!password || !confirmPassword) {
      setLocalError('Password fields are required');
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

    if (!agreeTerms) {
      setLocalError('You must agree to the Terms and Data Policy');
      return;
    }

    const result = await dispatch(registerUser({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      password,
      birthdate: birthdate || undefined,
      gender: gender || undefined,
    }));

    if (registerUser.fulfilled.match(result)) {
      setSuccess(true);
      // Redirect to login after brief delay
      setTimeout(() => navigate('/login'), 1500);
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() &&
    password.length >= 8 && confirmPassword && password === confirmPassword && agreeTerms;

  return (
    <div className="auth-page" id="register-page">
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

        {/* Right Section - Register Form */}
        <div className="auth-card">
          {success ? (
            <div className="auth-success">
              <div className="auth-success-icon">✅</div>
              <h2>Account Created!</h2>
              <p>Redirecting to login page...</p>
            </div>
          ) : (
            <>
              <h2 className="auth-card-title">Create a new account</h2>
              <p className="auth-card-subtitle">It's quick and easy.</p>
              <div className="auth-card-divider" />

              <form className="auth-form" onSubmit={handleSubmit} id="register-form">
                {(error || localError) && (
                  <div className="auth-error" id="register-error">
                    {error || localError}
                  </div>
                )}

                {/* Name Fields */}
                <div className="input-row">
                  <div className="input-group">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      id="register-first-name"
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Surname"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      id="register-last-name"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="input-group">
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    id="register-email"
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div className="input-group">
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="New password (min 8 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      id="register-password"
                      autoComplete="new-password"
                    />
                    <button type="button" className="pw-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="input-group">
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    id="register-confirm-password"
                    autoComplete="new-password"
                  />
                </div>

                {/* Date of Birth (Optional) */}
                <div className="input-group">
                  <label className="input-label">Date of birth <span className="optional-tag">(optional)</span></label>
                  <input
                    type="date"
                    className="input-field"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    id="register-birthdate"
                  />
                </div>

                {/* Gender (Optional) */}
                <div className="input-group">
                  <label className="input-label">Gender <span className="optional-tag">(optional)</span></label>
                  <div className="gender-options">
                    {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(opt => (
                      <label key={opt} className={`gender-option ${gender === opt ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value={opt}
                          checked={gender === opt}
                          onChange={() => setGender(opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Legal Text */}
                <div className="auth-legal">
                  <p>You may receive notifications from us.</p>
                  <p>People who use our service may have uploaded your contact information to MindBook.</p>
                  <p>
                    By tapping Submit, you agree to create an account and to MindBook's{' '}
                    <a href="#terms">Terms</a>, <a href="#data-policy">Data Policy</a>, and{' '}
                    <a href="#cookies">Cookies Policy</a>.
                  </p>
                  <p className="auth-legal-small">
                    The Data Policy describes the ways we can use the information we collect when you
                    create an account. For example, we use this information to provide, personalise and
                    improve our products, including ads.
                  </p>
                </div>

                {/* Agreement Checkbox */}
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    id="register-agree"
                  />
                  <span className="checkmark" />
                  <span>I agree to the Terms and Data Policy</span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading || !isFormValid}
                  id="register-submit"
                >
                  {loading ? (
                    <span className="btn-loading">
                      <span className="spinner spinner-sm" />
                      Creating account...
                    </span>
                  ) : (
                    'Submit'
                  )}
                </button>

                <div className="auth-link-wrapper mt-4">
                  <Link to="/login" className="auth-login-link" id="go-to-login">
                    Already have an account?
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <footer className="auth-footer">
        <p>MindBook © {new Date().getFullYear()}. A social media experience.</p>
      </footer>
    </div>
  );
};

export default Register;
