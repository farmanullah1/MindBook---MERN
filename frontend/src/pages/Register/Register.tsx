import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/slices/authSlice';
import './Auth.css';

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [localError, setLocalError] = React.useState('');

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
    setLocalError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setLocalError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const result = await dispatch(registerUser({ name: name.trim(), email: email.trim(), password }));
    if (registerUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-container">
        {/* Left Section - Branding */}
        <div className="auth-branding">
          <div className="auth-logo">
            <svg width="52" height="52" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="url(#regLogoGrad)" />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="Inter, sans-serif">M</text>
              <defs>
                <linearGradient id="regLogoGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#F7B928" />
                  <stop offset="100%" stopColor="#D99A1C" />
                </linearGradient>
              </defs>
            </svg>
            <h1 className="auth-title">Minds Books</h1>
          </div>
          <p className="auth-tagline">
            Connect with friends and the world around you on Minds Books.
          </p>
        </div>

        {/* Right Section - Register Form */}
        <div className="auth-card">
          <h2 className="auth-card-title">Create a new account</h2>
          <p className="auth-card-subtitle">It's quick and easy.</p>
          <div className="auth-card-divider" />

          <form className="auth-form" onSubmit={handleSubmit} id="register-form">
            {(error || localError) && (
              <div className="auth-error" id="register-error">
                {error || localError}
              </div>
            )}

            <div className="input-group">
              <input
                type="text"
                className="input-field"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                id="register-name"
                autoComplete="name"
              />
            </div>

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

            <div className="input-group">
              <input
                type="password"
                className="input-field"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="register-password"
                autoComplete="new-password"
              />
            </div>

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

            <p className="auth-terms">
              By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy.
            </p>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              id="register-submit"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>

            <div className="auth-link-wrapper mt-4">
              <Link to="/login" className="auth-login-link" id="go-to-login">
                Already have an account?
              </Link>
            </div>
          </form>
        </div>
      </div>

      <footer className="auth-footer">
        <p>Minds Books © 2024. A social media experience.</p>
      </footer>
    </div>
  );
};

export default Register;
