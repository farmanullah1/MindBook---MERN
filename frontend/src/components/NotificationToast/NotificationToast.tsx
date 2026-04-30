/**
 * CodeDNA
 * NotificationToast.tsx — core functionality
 * exports: NotificationToast
 * used_by: App.tsx
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiBell } from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';
import { getInitials } from '../../utils/helpers';
import './NotificationToast.css';

const NotificationToast: React.FC = () => {
  const { items, unreadCount } = useAppSelector((state) => state.notifications);
  const [visible, setVisible] = React.useState(false);
  const [currentNotif, setCurrentNotif] = React.useState<any>(null);
  const prevUnreadCount = React.useRef(unreadCount);

  React.useEffect(() => {
    // If unreadCount increased, show the newest notification
    if (unreadCount > prevUnreadCount.current && items.length > 0) {
      const latest = items[0];
      setCurrentNotif(latest);
      setVisible(true);
      
      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, items]);

  const getNotifText = (notif: any) => {
    switch (notif.type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'friend_request': return 'sent you a friend request';
      case 'friend_accept': return 'accepted your friend request';
      default: return 'interacted with you';
    }
  };

  return (
    <AnimatePresence>
      {visible && currentNotif && (
        <motion.div 
          className="notification-toast"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="toast-content">
            <div className="toast-avatar">
              {currentNotif.fromUser.profilePicture ? (
                <img src={currentNotif.fromUser.profilePicture} alt="" />
              ) : (
                <div className="avatar-initials">{getInitials(currentNotif.fromUser.name)}</div>
              )}
            </div>
            <div className="toast-body">
              <span className="toast-user">{currentNotif.fromUser.name}</span>
              <p className="toast-text">{getNotifText(currentNotif)}</p>
            </div>
          </div>
          <button className="toast-close" onClick={() => setVisible(false)}>
            <FiX size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;
