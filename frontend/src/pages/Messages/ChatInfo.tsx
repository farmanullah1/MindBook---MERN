/**
 * CodeDNA
 * ChatInfo.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState, useEffect } from 'react';
import { FiX, FiUsers, FiImage, FiBellOff, FiTrash2, FiLogOut } from 'react-icons/fi';
import api from '../../services/api';
import { IConversation, IUser } from '../../types';
import { getInitials } from '../../utils/helpers';
import './Messages.css';

import { useAppSelector } from '../../store/hooks';

interface ChatInfoProps {
  conversation: IConversation;
  onClose: () => void;
}

const ChatInfo: React.FC<ChatInfoProps> = ({ conversation, onClose }) => {
  const { user: currentUser } = useAppSelector(state => state.auth);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [searchResults, setSearchResults] = useState<IUser[]>([]);

  const isAdmin = conversation.isGroup && conversation.groupAdmin === currentUser?._id;

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/conversations/${conversation._id}/messages`);
        const mediaMsgs = res.data.filter((m: any) => m.mediaUrl);
        setMedia(mediaMsgs);
      } catch (err) {
        console.error('Fetch media error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [conversation._id]);

  const handleAddMember = async (userId: string) => {
    try {
      await api.post(`/conversations/${conversation._id}/members`, { userId });
      onClose(); // Refresh or close
    } catch (err) {
      console.error('Add member error:', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.delete(`/conversations/${conversation._id}/members/${userId}`);
      onClose();
    } catch (err) {
      console.error('Remove member error:', err);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await api.put(`/conversations/${conversation._id}/leave`);
      onClose();
    } catch (err) {
      console.error('Leave group error:', err);
    }
  };

  useEffect(() => {
    if (searchMember.trim().length > 1) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const res = await api.get(`/users/search?q=${searchMember}`);
          setSearchResults(res.data);
        } catch (err) {
          console.error('Search error:', err);
        }
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchMember]);

  return (
    <div className="chat-info-sidebar">
      <div className="chat-info-header">
        <h3>Details</h3>
        <button className="icon-btn" onClick={onClose}><FiX size={20} /></button>
      </div>

      <div className="chat-info-body">
        <div className="chat-info-profile">
          <div className="info-avatar">
            {conversation.isGroup ? (
              <div className="avatar-placeholder group-icon"><FiUsers size={32} /></div>
            ) : (
              <img 
                src={conversation.participants.find(p => p._id !== conversation.participants[0]._id)?.profilePicture || '/default-avatar.png'} 
                alt="Profile" 
              />
            )}
          </div>
          <h4>{conversation.isGroup ? conversation.groupName : conversation.participants.find(p => p._id !== conversation.participants[0]._id)?.name}</h4>
        </div>

        <div className="info-section">
          <div className="section-header">
            <span>Actions</span>
          </div>
          <div className="section-buttons">
            <button className="info-action-row">
              <FiBellOff />
              <span>Mute Notifications</span>
            </button>
            <button className="info-action-row">
              <FiTrash2 />
              <span>Delete Chat</span>
            </button>
            {conversation.isGroup && (
              <button className="info-action-row danger">
                <FiLogOut />
                <span>Leave Group</span>
              </button>
            )}
          </div>
        </div>

        {conversation.isGroup && (
          <div className="info-section">
            <div className="section-header">
              <span>Members</span>
              {isAdmin && (
                <button className="text-link" onClick={() => setShowAddMember(!showAddMember)}>
                  {showAddMember ? 'Cancel' : 'Add'}
                </button>
              )}
            </div>

            {showAddMember && (
              <div className="add-member-search">
                <input 
                  type="text" 
                  placeholder="Find friends..." 
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  autoFocus
                />
                <div className="search-results-mini">
                  {searchResults.map(u => (
                    <div key={u._id} className="search-item-mini" onClick={() => handleAddMember(u._id)}>
                      <span>{u.name}</span>
                      <button className="btn-add-mini">Add</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="member-list">
              {conversation.participants.map(member => (
                <div key={member._id} className="member-item">
                  <div className="member-avatar">
                    {member.profilePicture ? (
                      <img src={member.profilePicture} alt={member.name} />
                    ) : (
                      <div className="avatar-placeholder-sm">{getInitials(member.name)}</div>
                    )}
                  </div>
                  <div className="member-info">
                    <span>{member.name}</span>
                    {conversation.groupAdmin === member._id && <span className="admin-badge">Admin</span>}
                  </div>
                  {isAdmin && member._id !== currentUser?._id && (
                    <button className="remove-member-btn" onClick={() => handleRemoveMember(member._id)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="info-section">
          <div className="section-header">
            <span>Shared Media</span>
            <FiImage />
          </div>
          <div className="media-grid-sm">
            {media.slice(0, 6).map(m => (
              <div key={m._id} className="media-item-sm">
                {m.mediaType === 'image' ? (
                  <img src={m.mediaUrl} alt="Shared" />
                ) : (
                  <div className="video-placeholder-sm">▶</div>
                )}
              </div>
            ))}
            {media.length === 0 && <p className="no-media-text">No shared media yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInfo;
