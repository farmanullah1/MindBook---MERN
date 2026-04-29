import React from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { markAsRead, markAllAsRead, fetchNotifications } from '../../store/slices/notificationsSlice';
import { getInitials } from '../../utils/helpers';
import './NotificationsDropdown.css';

const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const { items, unreadCount } = useAppSelector((state) => state.notifications);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    dispatch(fetchNotifications());
    // Polling every 30 seconds for MVP
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(markAsRead(id));
  };

  const handleMarkAll = () => {
    dispatch(markAllAsRead());
  };

  const getNotificationText = (type: string, post?: any, text?: string) => {
    switch (type) {
      case 'like':
        return <span>liked your post: "{post?.content?.substring(0, 20)}..."</span>;
      case 'comment':
        return <span>commented "{text}..." on your post</span>;
      case 'friend_request':
        return <span>sent you a friend request.</span>;
      case 'friend_accept':
        return <span>accepted your friend request.</span>;
      default:
        return <span>interacted with you.</span>;
    }
  };

  const getNotificationLink = (type: string, fromUserId: string) => {
    if (type === 'friend_request' || type === 'friend_accept') {
      return `/profile/${fromUserId}`;
    }
    return '/'; // For MVP, maybe redirect to home or post details if we had one
  };

  return (
    <div className="nav-item notifications-wrapper" ref={dropdownRef}>
      <button 
        className={`icon-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAll}>
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notifications-body">
            {items.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet.</p>
              </div>
            ) : (
              items.map((notif) => (
                <Link 
                  key={notif._id} 
                  to={getNotificationLink(notif.type, notif.fromUser._id)} 
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => { if (!notif.read) dispatch(markAsRead(notif._id)) }}
                >
                  <div className="notification-avatar">
                    {notif.fromUser.profilePicture ? (
                      <img src={notif.fromUser.profilePicture} alt={notif.fromUser.name} />
                    ) : (
                      <div className="avatar-initials">{getInitials(notif.fromUser.name)}</div>
                    )}
                  </div>
                  <div className="notification-content">
                    <p>
                      <strong>{notif.fromUser.name}</strong>{' '}
                      {getNotificationText(notif.type, notif.post, notif.text)}
                    </p>
                    <span className="notification-time">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!notif.read && (
                    <button 
                      className="mark-read-icon" 
                      onClick={(e) => handleMarkAsRead(notif._id, e)}
                      title="Mark as read"
                    >
                      <FiCheck />
                    </button>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
