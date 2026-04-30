/**
 * CodeDNA
 * App.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { fetchCurrentUser } from './store/slices/authSlice';

import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import Messages from './pages/Messages/Messages';
import GroupsHome from './pages/Groups/GroupsHome';
import GroupDiscover from './pages/Groups/GroupDiscover';
import GroupPage from './pages/Groups/GroupPage';
import Events from './pages/Events/Events';
import Search from './pages/Search/Search';
import Friends from './pages/Friends/Friends';
import Saved from './pages/Saved/Saved';
import Settings from './pages/Settings/Settings';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import MobileBottomNav from './components/Navbar/MobileBottomNav';
import { FiArrowUp } from 'react-icons/fi';
import { socketService } from './services/socketService';

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
  const { token, user, loading } = useAppSelector((state) => state.auth);
  const [initializing, setInitializing] = React.useState(true);
  const [showScroll, setShowScroll] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      if (token) {
        await dispatch(fetchCurrentUser());
      }
      setInitializing(false);
    };
    init();
  }, [dispatch, token]);

  React.useEffect(() => {
    if (user?._id) {
      socketService.connect(user._id);
    }
    return () => {
      socketService.disconnect();
    };
  }, [user?._id]);

  React.useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (initializing && token) {
    return (
      <div className="loading-screen">
        <svg width="80" height="80" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="loadGrad" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#F7B928" />
              <stop offset="100%" stopColor="#D99A1C" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="10" fill="url(#loadGrad)" />
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="Inter, sans-serif">M</text>
        </svg>
        <span className="brand-text">MindBook</span>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
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
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupsHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/discover"
          element={
            <ProtectedRoute>
              <GroupDiscover />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id/:tab"
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <Saved />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {token && <MobileBottomNav />}
      {showScroll && (
        <button 
          className="back-to-top" 
          onClick={scrollTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <FiArrowUp size={24} />
        </button>
      )}
    </Router>
  );
};

export default App;
