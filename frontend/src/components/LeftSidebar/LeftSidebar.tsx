import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiUsers, FiBookmark, FiCalendar, FiFlag, FiShoppingBag, FiChevronDown } from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';
import { getInitials } from '../../utils/helpers';
import './LeftSidebar.css';

const LeftSidebar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [showMore, setShowMore] = React.useState(false);

  const mainLinks = [
    { icon: <FiHome size={20} />, label: 'Home', to: '/' },
    { icon: <FiUsers size={20} />, label: 'Friends', to: '/' },
    { icon: <FiUsers size={20} />, label: 'Groups', to: '/groups' },
    { icon: <FiBookmark size={20} />, label: 'Saved', to: '/' },
    { icon: <FiFlag size={20} />, label: 'Pages', to: '/' },
    { icon: <FiCalendar size={20} />, label: 'Events', to: '/events' },
  ];

  const moreLinks = [
    { icon: <FiShoppingBag size={20} />, label: 'Marketplace', to: '/' },
  ];

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
            <Link key={link.label} to={link.to} className="sidebar-link" id={`sidebar-${link.label.toLowerCase()}`}>
              <span className="sidebar-link-icon">{link.icon}</span>
              <span className="sidebar-link-label">{link.label}</span>
            </Link>
          ))}

          {showMore &&
            moreLinks.map((link) => (
              <Link key={link.label} to={link.to} className="sidebar-link">
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
          <span>Minds Books © 2024</span>
        </footer>
      </div>
    </aside>
  );
};

export default LeftSidebar;
