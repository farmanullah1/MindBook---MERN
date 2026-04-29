import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHome, FiUsers, FiMessageSquare, FiBell, FiLogOut, FiMenu, FiCalendar, FiGrid } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';
import { IUser } from '../../types';
import { getInitials } from '../../utils/helpers';
import NotificationsDropdown from '../NotificationsDropdown/NotificationsDropdown';
import './Navbar.css';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<{users: IUser[], groups: any[], posts: any[]}>({users: [], groups: [], posts: []});
  const [isSearching, setIsSearching] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
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

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Left Section */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo" id="navbar-logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="var(--brand-primary)" />
                <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="24" fontWeight="900" fontFamily="Arial, sans-serif">M</text>
              </svg>
            </div>
            <span className="logo-text">Minds Books</span>
          </Link>
          <div className="navbar-search-container" ref={searchRef}>
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
            {(searchResults.users.length > 0 || searchResults.groups.length > 0 || searchResults.posts.length > 0) && (
              <div className="search-dropdown dropdown-menu">
                {searchResults.users.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-title">People</div>
                    {searchResults.users.map(resultUser => (
                      <Link 
                        key={resultUser._id} 
                        to={`/profile/${resultUser._id}`} 
                        className="dropdown-item"
                        onClick={() => { setSearchResults({users: [], groups: [], posts: []}); setSearchQuery(''); }}
                      >
                        <div className="dropdown-avatar">
                          {resultUser.profilePicture ? (
                            <img src={resultUser.profilePicture} alt={resultUser.name} />
                          ) : (
                            <div className="avatar-initials">{getInitials(resultUser.name)}</div>
                          )}
                        </div>
                        <span>{resultUser.name}</span>
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
          <Link to="/" className="nav-tab active" id="nav-home" title="Home">
            <FiHome size={22} />
          </Link>
          <Link to="/groups" className="nav-tab" id="nav-groups" title="Groups">
            <FiGrid size={22} />
          </Link>
          <Link to="/events" className="nav-tab" id="nav-events" title="Events">
            <FiCalendar size={22} />
          </Link>
          <Link to="/messages" className="nav-tab" id="nav-messages" title="Messages">
            <FiMessageSquare size={22} />
          </Link>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          <button className="nav-icon-btn mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <FiMenu size={20} />
          </button>
          
          <NotificationsDropdown />
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
