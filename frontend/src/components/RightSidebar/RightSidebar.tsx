import React from 'react';
import { FiSearch, FiUserPlus, FiCheck, FiX } from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';
import { getInitials } from '../../utils/helpers';
import api from '../../services/api';
import { IUser } from '../../types';
import './RightSidebar.css';

const RightSidebar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [suggestions, setSuggestions] = React.useState<IUser[]>([]);
  const [friendRequests, setFriendRequests] = React.useState<IUser[]>([]);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [suggestionsRes, meRes] = await Promise.all([
          api.get('/users/suggestions'),
          api.get('/auth/me'),
        ]);
        setSuggestions(suggestionsRes.data);
        setFriendRequests(meRes.data.friendRequests || []);
      } catch (error) {
        console.error('Failed to fetch sidebar data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSendRequest = async (friendId: string) => {
    setActionLoading(friendId);
    try {
      await api.post('/users/friend-request', { friendId });
      setSuggestions((prev) => prev.filter((u) => u._id !== friendId));
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
    setActionLoading(null);
  };

  const handleAcceptRequest = async (friendId: string) => {
    setActionLoading(friendId);
    try {
      await api.post('/users/friend-request/accept', { friendId });
      setFriendRequests((prev) => prev.filter((u) => u._id !== friendId));
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
    setActionLoading(null);
  };

  const handleDeclineRequest = async (friendId: string) => {
    setActionLoading(friendId);
    try {
      await api.post('/users/friend-request/decline', { friendId });
      setFriendRequests((prev) => prev.filter((u) => u._id !== friendId));
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    }
    setActionLoading(null);
  };

  return (
    <aside className="right-sidebar" id="right-sidebar">
      <div className="sidebar-scroll">
        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="rs-section">
            <h3 className="rs-section-title">Friend Requests</h3>
            {friendRequests.map((req) => (
              <div key={req._id} className="rs-request-item">
                <div className="rs-user-info">
                  {req.profilePicture ? (
                    <img src={req.profilePicture} alt={req.name} className="rs-avatar" />
                  ) : (
                    <div className="rs-avatar rs-avatar-initials">{getInitials(req.name)}</div>
                  )}
                  <span className="rs-user-name">{req.name}</span>
                </div>
                <div className="rs-request-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAcceptRequest(req._id)}
                    disabled={actionLoading === req._id}
                    id={`accept-request-${req._id}`}
                  >
                    <FiCheck size={14} /> Accept
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeclineRequest(req._id)}
                    disabled={actionLoading === req._id}
                  >
                    <FiX size={14} /> Decline
                  </button>
                </div>
              </div>
            ))}
            <div className="rs-divider" />
          </div>
        )}

        {/* Birthdays */}
        <div className="rs-section">
          <h3 className="rs-section-title">Birthdays</h3>
          <div className="rs-birthday-item">
            <span className="rs-birthday-icon">🎁</span>
            <span className="rs-birthday-text">
              <strong>John Doe</strong> and <strong>2 others</strong> have birthdays today.
            </span>
          </div>
          <div className="rs-divider" />
        </div>

        {/* Contacts */}
        <div className="rs-section">
          <div className="rs-section-header">
            <h3 className="rs-section-title">Contacts</h3>
            <button className="rs-search-btn" title="Search contacts">
              <FiSearch size={16} />
            </button>
          </div>
          {user?.friends && user.friends.length > 0 ? (
            <div className="rs-contacts-list">
              {user.friends.map((friend: any) => (
                <div key={friend._id} className="rs-contact-item" id={`contact-${friend._id}`}>
                  {friend.profilePicture ? (
                    <img src={friend.profilePicture} alt={friend.name} className="rs-avatar" />
                  ) : (
                    <div className="rs-avatar rs-avatar-initials">{getInitials(friend.name)}</div>
                  )}
                  <span className="rs-contact-name">{friend.name}</span>
                  <span className="rs-online-dot" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rs-empty">
              <span className="text-secondary">No contacts yet</span>
            </div>
          )}
        </div>

        {/* Suggested Friends */}
        {suggestions.length > 0 && (
          <div className="rs-section">
            <div className="rs-divider" />
            <h3 className="rs-section-title">People you may know</h3>
            <div className="rs-suggestions-list">
              {suggestions.slice(0, 5).map((sugUser) => (
                <div key={sugUser._id} className="rs-suggestion-item" id={`suggestion-${sugUser._id}`}>
                  <div className="rs-user-info">
                    {sugUser.profilePicture ? (
                      <img src={sugUser.profilePicture} alt={sugUser.name} className="rs-avatar" />
                    ) : (
                      <div className="rs-avatar rs-avatar-initials">{getInitials(sugUser.name)}</div>
                    )}
                    <span className="rs-user-name">{sugUser.name}</span>
                  </div>
                  <button
                    className="rs-add-friend-btn"
                    onClick={() => handleSendRequest(sugUser._id)}
                    disabled={actionLoading === sugUser._id}
                    title="Add friend"
                  >
                    <FiUserPlus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Section */}
        <div className="rs-section">
          <div className="rs-divider" />
          <h3 className="rs-section-title">Trending</h3>
          <div className="rs-trending-list">
            {['Technology', 'Design', 'Development', 'AI & ML'].map((topic, i) => (
              <div key={topic} className="rs-trending-item">
                <span className="rs-trending-rank">#{i + 1}</span>
                <div className="rs-trending-info">
                  <span className="rs-trending-topic">{topic}</span>
                  <span className="rs-trending-count">{Math.floor(Math.random() * 50 + 10)}k discussions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
