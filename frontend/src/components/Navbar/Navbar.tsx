import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHome, FiUsers, FiMessageSquare, FiBell, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { getInitials } from '../../utils/helpers';
import './Navbar.css';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Left Section */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo" id="navbar-logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
                <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="Inter, sans-serif">M</text>
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#F7B928" />
                    <stop offset="100%" stopColor="#D99A1C" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-text">Minds Books</span>
          </Link>
          <form className="navbar-search" onSubmit={handleSearch} id="navbar-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search Minds Books"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-input"
            />
          </form>
        </div>

        {/* Center Section */}
        <div className="navbar-center">
          <Link to="/" className="nav-tab active" id="nav-home" title="Home">
            <FiHome size={22} />
          </Link>
          <Link to="/" className="nav-tab" id="nav-friends" title="Friends">
            <FiUsers size={22} />
          </Link>
          <button className="nav-tab" id="nav-messages" title="Messages">
            <FiMessageSquare size={22} />
          </button>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          <button className="nav-icon-btn mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <FiMenu size={20} />
          </button>
          <button className="nav-icon-btn" id="nav-notifications" title="Notifications">
            <FiBell size={20} />
            <span className="notification-badge">3</span>
          </button>
          <div className="profile-menu-container" ref={menuRef}>
            <button
              className="nav-profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              id="nav-profile-btn"
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="nav-avatar" />
              ) : (
                <div className="nav-avatar nav-avatar-initials">
                  {user ? getInitials(user.name) : '?'}
                </div>
              )}
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown" id="profile-dropdown">
                <Link
                  to={`/profile/${user?._id}`}
                  className="dropdown-item profile-link"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="dropdown-avatar">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} />
                    ) : (
                      <div className="avatar-initials">{user ? getInitials(user.name) : '?'}</div>
                    )}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">{user?.name}</span>
                    <span className="dropdown-user-sub">See your profile</span>
                  </div>
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item logout-btn" onClick={handleLogout} id="logout-btn">
                  <div className="dropdown-icon">
                    <FiLogOut size={18} />
                  </div>
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
