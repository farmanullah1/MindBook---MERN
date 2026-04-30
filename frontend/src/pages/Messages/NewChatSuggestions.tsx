/**
 * CodeDNA
 * NewChatSuggestions.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSuggestions, getOrCreateConversation } from '../../store/slices/chatSlice';
import { getInitials } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const NewChatSuggestions: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { suggestions } = useAppSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [dispatch]);

  const handleStartChat = async (userId: string) => {
    const resultAction = await dispatch(getOrCreateConversation(userId));
    if (getOrCreateConversation.fulfilled.match(resultAction)) {
      // Conversation is set as active by the slice
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="new-chat-suggestions">
      <h3>Start a new chat</h3>
      <div className="suggestions-row">
        {suggestions.map((user) => (
          <div 
            key={user._id} 
            className="suggestion-card"
            onClick={() => handleStartChat(user._id)}
          >
            <div className="suggestion-avatar-wrapper">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} />
              ) : (
                <div className="avatar-initials">{getInitials(user.name)}</div>
              )}
              {user.isOnline && <span className="online-indicator"></span>}
            </div>
            <span className="suggestion-name">{user.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewChatSuggestions;
