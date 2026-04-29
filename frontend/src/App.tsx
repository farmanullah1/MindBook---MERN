import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { fetchCurrentUser } from './store/slices/authSlice';

import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAppSelector((state) => state.auth);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAppSelector((state) => state.auth);
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, loading } = useAppSelector((state) => state.auth);
  const [initializing, setInitializing] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
      if (token) {
        await dispatch(fetchCurrentUser());
      }
      setInitializing(false);
    };
    init();
  }, [dispatch, token]);

  if (initializing && token) {
    return (
      <div className="loading-screen">
        <svg width="64" height="64" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="url(#loadGrad)" />
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="Inter, sans-serif">M</text>
          <defs>
            <linearGradient id="loadGrad" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#F7B928" />
              <stop offset="100%" stopColor="#D99A1C" />
            </linearGradient>
          </defs>
        </svg>
        <span className="brand-text">Minds Books</span>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
