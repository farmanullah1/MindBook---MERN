/**
 * CodeDNA
 * Friends.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiUserPlus, FiUserCheck, FiSearch, FiMessageCircle, FiX, FiUserX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { IUser } from '../../types';
import { getInitials, formatTimeAgo } from '../../utils/helpers';
import { useToast } from '../../components/Toast/ToastContext';
import Navbar from '../../components/Navbar/Navbar';
import './Friends.css';

const Friends: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'my-friends' | 'requests' | 'suggestions'>('my-friends');
  const [friends, setFriends] = useState<IUser[]>([]);
  const [requests, setRequests] = useState<{ incoming: IUser[], outgoing: IUser[] }>({ incoming: [], outgoing: [] });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-friends') {
        const res = await api.get('/users/friends');
        setFriends(res.data);
      } else if (activeTab === 'requests') {
        const res = await api.get('/users/friend-requests');
        setRequests(res.data);
      } else if (activeTab === 'suggestions') {
        const res = await api.get('/users/suggestions');
        setSuggestions(res.data);
      }
    } catch (err) {
      console.error('Error fetching friends data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAccept = async (id: string, name: string) => {
    try {
      await api.post('/users/friend-request/accept', { friendId: id });
      showToast(`You are now friends with ${name}`, 'success');
      fetchData();
    } catch (err) { console.error(err); showToast('Failed to accept request', 'error'); }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.post('/users/friend-request/decline', { friendId: id });
      showToast('Request declined', 'info');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.post('/users/friend-request/cancel', { friendId: id });
      showToast('Request cancelled', 'info');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleAddFriend = async (id: string, name: string) => {
    try {
      await api.post('/users/friend-request', { friendId: id });
      showToast(`Friend request sent to ${name}`, 'success');
      fetchData();
    } catch (err) { console.error(err); showToast('Failed to send request', 'error'); }
  };

  const handleRemoveFriend = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to unfriend ${name}?`)) {
      try {
        await api.post('/users/unfriend', { friendId: id });
        showToast(`${name} removed from friends`, 'info');
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  const handleMessage = (id: string) => {
    navigate('/messages', { state: { userId: id } });
  };

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSkeletonCards = () => (
    <div className="friends-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="friend-card friend-card-skeleton">
          <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: '8px 8px 0 0' }} />
          <div className="friend-info">
            <div className="skeleton" style={{ width: '70%', height: '14px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '50%', height: '12px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '100%', height: '36px', borderRadius: '6px' }} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="friends-page">
      <Navbar />
      <div className="friends-layout">
        {/* Sidebar */}
        <aside className="friends-sidebar">
          <h1>Friends</h1>
          <nav className="friends-nav">
            <button
              className={`friends-nav-item ${activeTab === 'my-friends' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-friends')}
            >
              <div className="friends-nav-icon"><FiUsers size={20} /></div>
              <span>All Friends</span>
              {friends.length > 0 && <span className="friends-count">{friends.length}</span>}
            </button>
            <button
              className={`friends-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <div className="friends-nav-icon"><FiUserPlus size={20} /></div>
              <span>Friend Requests</span>
              {requests.incoming.length > 0 && (
                <span className="friends-badge">{requests.incoming.length}</span>
              )}
            </button>
            <button
              className={`friends-nav-item ${activeTab === 'suggestions' ? 'active' : ''}`}
              onClick={() => setActiveTab('suggestions')}
            >
              <div className="friends-nav-icon"><FiUserCheck size={20} /></div>
              <span>Find Friends</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="friends-main">
          <div className="friends-main-header">
            <h2>
              {activeTab === 'my-friends' ? 'All Friends' :
               activeTab === 'requests' ? 'Friend Requests' :
               'People You May Know'}
            </h2>
            {activeTab === 'my-friends' && (
              <div className="friends-search-bar">
                <FiSearch size={16} />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="search-clear">
                    <FiX size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {loading ? renderSkeletonCards() : (
            <>
              {/* My Friends Tab */}
              {activeTab === 'my-friends' && (
                <div className="friends-grid">
                  {filteredFriends.length > 0 ? filteredFriends.map(friend => (
                    <div key={friend._id} className="friend-card">
                      <Link to={`/profile/${friend._id}`} className="friend-card-img">
                        {friend.profilePicture ? (
                          <img src={friend.profilePicture} alt={friend.name} />
                        ) : (
                          <div className="friend-card-initials">{getInitials(friend.name)}</div>
                        )}
                      </Link>
                      <div className="friend-info">
                        <Link to={`/profile/${friend._id}`} className="friend-name">{friend.name}</Link>
                        <div className="friend-card-actions">
                          <button className="btn btn-primary btn-sm" onClick={() => handleMessage(friend._id)}>
                            <FiMessageCircle size={14} /> Message
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleRemoveFriend(friend._id, friend.name)}>
                            <FiUserX size={14} /> Unfriend
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="friends-empty">
                      <div className="friends-empty-icon">👥</div>
                      <h3>{searchQuery ? 'No friends match your search' : 'No friends yet'}</h3>
                      <p>{searchQuery ? 'Try a different search term.' : 'Start connecting with people!'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Friend Requests Tab */}
              {activeTab === 'requests' && (
                <>
                  {requests.incoming.length > 0 && (
                    <div className="friends-section">
                      <h3 className="friends-section-title">
                        Incoming Requests
                        <span className="section-count">{requests.incoming.length}</span>
                      </h3>
                      <div className="friends-grid">
                        {requests.incoming.map(user => (
                          <div key={user._id} className="friend-card">
                            <Link to={`/profile/${user._id}`} className="friend-card-img">
                              {user.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} />
                              ) : (
                                <div className="friend-card-initials">{getInitials(user.name)}</div>
                              )}
                            </Link>
                            <div className="friend-info">
                              <Link to={`/profile/${user._id}`} className="friend-name">{user.name}</Link>
                              <div className="friend-card-actions">
                                <button className="btn btn-primary btn-sm btn-full" onClick={() => handleAccept(user._id, user.name)}>
                                  Confirm
                                </button>
                                <button className="btn btn-secondary btn-sm btn-full" onClick={() => handleDecline(user._id)}>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {requests.outgoing.length > 0 && (
                    <div className="friends-section">
                      <h3 className="friends-section-title">Sent Requests</h3>
                      <div className="friends-grid">
                        {requests.outgoing.map(user => (
                          <div key={user._id} className="friend-card">
                            <Link to={`/profile/${user._id}`} className="friend-card-img">
                              {user.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} />
                              ) : (
                                <div className="friend-card-initials">{getInitials(user.name)}</div>
                              )}
                            </Link>
                            <div className="friend-info">
                              <Link to={`/profile/${user._id}`} className="friend-name">{user.name}</Link>
                              <div className="friend-card-actions">
                                <button className="btn btn-secondary btn-sm btn-full" onClick={() => handleCancel(user._id)}>
                                  Cancel Request
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {requests.incoming.length === 0 && requests.outgoing.length === 0 && (
                    <div className="friends-empty">
                      <div className="friends-empty-icon">📬</div>
                      <h3>No friend requests</h3>
                      <p>When someone sends you a friend request, it will appear here.</p>
                    </div>
                  )}
                </>
              )}

              {/* Suggestions Tab */}
              {activeTab === 'suggestions' && (
                <div className="friends-grid">
                  {suggestions.length > 0 ? suggestions.map(user => (
                    <div key={user._id} className="friend-card">
                      <Link to={`/profile/${user._id}`} className="friend-card-img">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} />
                        ) : (
                          <div className="friend-card-initials">{getInitials(user.name)}</div>
                        )}
                      </Link>
                      <div className="friend-info">
                        <Link to={`/profile/${user._id}`} className="friend-name">{user.name}</Link>
                        {user.mutualFriendsCount > 0 && (
                          <span className="mutual-friends-text">
                            {user.mutualFriendsCount} mutual friend{user.mutualFriendsCount > 1 ? 's' : ''}
                          </span>
                        )}
                        <div className="friend-card-actions">
                          <button className="btn btn-primary btn-sm btn-full" onClick={() => handleAddFriend(user._id, user.name)}>
                            <FiUserPlus size={14} /> Add Friend
                          </button>
                          <button className="btn btn-secondary btn-sm btn-full">Remove</button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="friends-empty">
                      <div className="friends-empty-icon">🔍</div>
                      <h3>No suggestions right now</h3>
                      <p>We'll suggest people you may know as you use MindBook.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Friends;
