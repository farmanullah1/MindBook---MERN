/**
 * CodeDNA
 * Navbar.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiHome, FiUsers, FiMessageSquare, FiBell, FiLogOut, FiMenu, FiCalendar, FiGrid, FiSun, FiMoon } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';
import { IUser } from '../../types';
import { getInitials } from '../../utils/helpers';
import NotificationsDropdown from '../NotificationsDropdown/NotificationsDropdown';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<{users: IUser[], groups: any[], posts: any[]}>({users: [], groups: [], posts: []});
  const [isSearching, setIsSearching] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  
  const menuRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults({users: [], groups: [], posts: []});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const res = await api.get(`/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (error) {
          console.error(error);
        }
        setIsSearching(false);
      } else {
        setSearchResults({users: [], groups: [], posts: []});
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchResults({users: [], groups: [], posts: []});
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Left Section */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#F7B928" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" />
                <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="24" fontWeight="900">M</text>
              </svg>
            </div>
            <span className="logo-text">MindBook</span>
          </Link>
          <div className="navbar-search-container" ref={searchRef}>
            <form className="navbar-search" onSubmit={handleSearch}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search MindBook"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            {(searchResults.users.length > 0 || searchResults.groups.length > 0) && (
              <div className="search-dropdown dropdown-card">
                {searchResults.users.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-title">People</div>
                    {searchResults.users.map(resUser => (
                      <Link 
                        key={resUser._id} 
                        to={`/profile/${resUser._id}`} 
                        className="dropdown-item"
                        onClick={() => { setSearchResults({users: [], groups: [], posts: []}); setSearchQuery(''); }}
                      >
                        <div className="dropdown-avatar">
                          {resUser.profilePicture ? (
                            <img src={resUser.profilePicture} alt={resUser.name} />
                          ) : (
                            <div className="avatar-initials">{getInitials(resUser.name)}</div>
                          )}
                        </div>
                        <span>{resUser.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.groups.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-title">Groups</div>
                    {searchResults.groups.map(group => (
                      <Link 
                        key={group._id} 
                        to={`/groups/${group._id}`} 
                        className="dropdown-item"
                        onClick={() => { setSearchResults({users: [], groups: [], posts: []}); setSearchQuery(''); }}
                      >
                        <div className="dropdown-icon">👥</div>
                        <span>{group.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Section */}
        <div className="navbar-center">
          <Link to="/" className={`nav-tab ${isActive('/') ? 'active' : ''}`} title="Home">
            <FiHome size={22} />
          </Link>
          <Link to="/groups" className={`nav-tab ${isActive('/groups') ? 'active' : ''}`} title="Groups">
            <FiGrid size={22} />
          </Link>
          <Link to="/friends" className={`nav-tab ${isActive('/friends') ? 'active' : ''}`} title="Friends">
            <FiUsers size={22} />
          </Link>
          <Link to="/messages" className={`nav-tab ${isActive('/messages') ? 'active' : ''}`} title="Messages">
            <FiMessageSquare size={22} />
          </Link>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          <button className="nav-icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Dark Mode">
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
          
          <NotificationsDropdown />
          
          <div className="profile-menu-container" ref={menuRef}>
            <button
              className="nav-profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
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
              <div className="profile-dropdown dropdown-card">
                <Link
                  to={`/profile/${user?._id}`}
                  className="dropdown-item profile-header-item"
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
                <Link
                  to="/settings"
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="dropdown-icon">⚙️</div>
                  <span>Settings</span>
                </Link>
                <Link
                  to="/saved"
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="dropdown-icon">🔖</div>
                  <span>Saved Posts</span>
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
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
