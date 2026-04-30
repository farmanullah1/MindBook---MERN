/**
 * CodeDNA
 * LeftSidebar.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiBookmark, FiCalendar, FiFlag, FiShoppingBag, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { getInitials } from '../../utils/helpers';
import './LeftSidebar.css';

const LeftSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [showMore, setShowMore] = React.useState(false);

  const mainLinks = [
    { icon: <FiHome size={20} />, label: 'Home', to: '/' },
    { icon: <FiUsers size={20} />, label: 'Friends', to: '/friends' },
    { icon: <FiUsers size={20} />, label: 'Groups', to: '/groups' },
    { icon: <FiBookmark size={20} />, label: 'Saved', to: '/saved' },
    { icon: <FiFlag size={20} />, label: 'Pages', to: '/' },
    { icon: <FiCalendar size={20} />, label: 'Events', to: '/events' },
  ];

  const moreLinks = [
    { icon: <FiShoppingBag size={20} />, label: 'Marketplace', to: '/marketplace' },
    { icon: <FiFlag size={20} />, label: 'Memories', to: '/memories' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="left-sidebar" id="left-sidebar">
      <div className="sidebar-scroll">
        {/* Profile Link */}
        <Link to={`/profile/${user?._id}`} className="sidebar-profile-link" id="sidebar-profile">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar sidebar-avatar-initials">
              {user ? getInitials(user.name) : '?'}
            </div>
          )}
          <span className="sidebar-username">{user?.name || 'User'}</span>
        </Link>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {mainLinks.map((link) => (
            <Link 
              key={link.label} 
              to={link.to} 
              className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`} 
              id={`sidebar-${link.label.toLowerCase()}`}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              <span className="sidebar-link-label">{link.label}</span>
            </Link>
          ))}

          {showMore &&
            moreLinks.map((link) => (
              <Link 
                key={link.label} 
                to={link.to} 
                className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`} 
                id={`sidebar-${link.label.toLowerCase()}`}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span className="sidebar-link-label">{link.label}</span>
              </Link>
            ))}

          <button
            className="sidebar-link see-more-btn"
            onClick={() => setShowMore(!showMore)}
            id="sidebar-see-more"
          >
            <span className="sidebar-link-icon see-more-icon" style={{ transform: showMore ? 'rotate(180deg)' : 'none' }}>
              <FiChevronDown size={20} />
            </span>
            <span className="sidebar-link-label">{showMore ? 'See less' : 'See more'}</span>
          </button>
        </nav>

        {/* Logout */}
        <button className="sidebar-link logout-link" onClick={handleLogout} style={{ marginTop: 'auto', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
          <span className="sidebar-link-icon"><FiLogOut size={20} /></span>
          <span className="sidebar-link-label">Log Out</span>
        </button>

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* Shortcuts Section */}
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Your shortcuts</h3>
          <div className="sidebar-shortcuts-empty">
            <span className="text-secondary">No shortcuts yet</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="sidebar-footer">
          <span>MindBook © 2024</span>
        </footer>
      </div>
    </aside>
  );
};

export default LeftSidebar;
