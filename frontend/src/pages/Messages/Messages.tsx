/**
 * CodeDNA
 * Messages.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiPlus, FiEdit } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConversations, setActiveConversation, getOrCreateConversation } from '../../store/slices/chatSlice';
import Navbar from '../../components/Navbar/Navbar';
import { getInitials } from '../../utils/helpers';
import api from '../../services/api';
import { IUser } from '../../types';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import NewChatSuggestions from './NewChatSuggestions';
import './Messages.css';

const Messages: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user } = useAppSelector(state => state.auth);
  const { activeConversation, conversations, loading } = useAppSelector(state => state.chat);
  const [view, setView] = useState<'chats' | 'requests'>('chats');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await api.get(`/users/search?q=${searchTerm}`);
          setSearchResults(res.data);
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const state = location.state as { conversationId?: string };
    if (state?.conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === state.conversationId);
      if (conv) {
        dispatch(setActiveConversation(conv));
      }
    }
  }, [location.state, conversations, dispatch]);

  const filteredConversations = conversations.filter(c => {
    if (view === 'chats') return c.status === 'accepted';
    return c.status === 'pending';
  });

  const requestCount = conversations.filter(c => c.status === 'pending' && c.participants[1]._id === user?._id).length;

  return (
    <div className="messages-page">
      <Navbar />
      <div className="messages-container">
        <div className="messages-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title-row">
              <h1>Chats</h1>
              <div className="sidebar-actions">
                {requestCount > 0 && <span className="request-badge-count">{requestCount}</span>}
                <button className="icon-btn" title="New Message"><FiEdit size={20} /></button>
                <button className="icon-btn" title="New Group"><FiPlus size={20} /></button>
              </div>
            </div>
            <div className="sidebar-tabs">
              <button 
                className={`sidebar-tab ${view === 'chats' ? 'active' : ''}`}
                onClick={() => setView('chats')}
              >
                Chats
              </button>
              <button 
                className={`sidebar-tab ${view === 'requests' ? 'active' : ''}`}
                onClick={() => setView('requests')}
              >
                Requests {requestCount > 0 && `(${requestCount})`}
              </button>
            </div>
            <div className="sidebar-search">
              <input 
                type="text" 
                placeholder="Search Messenger" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {searchTerm.trim().length > 1 ? (
            <div className="search-results-list">
              <h3>People & Groups</h3>
              {isSearching ? (
                <div className="search-loading">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(u => (
                  <div key={u._id} className="search-result-item" onClick={() => {
                    dispatch(getOrCreateConversation(u._id));
                    setSearchTerm('');
                  }}>
                    {u.profilePicture ? (
                      <img src={u.profilePicture} alt={u.name} className="avatar-sm" />
                    ) : (
                      <div className="avatar-sm initials">{getInitials(u.name)}</div>
                    )}
                    <span>{u.name}</span>
                  </div>
                ))
              ) : (
                <div className="no-results">No people or groups found.</div>
              )}
            </div>
          ) : (
            <>
              <NewChatSuggestions />
              <ChatList 
                conversations={filteredConversations} 
                activeId={activeConversation?._id}
                currentUserId={user?._id || ''}
                onSelect={(c) => dispatch(setActiveConversation(c))}
                loading={loading}
              />
            </>
          )}
        </div>
        <div className="messages-main">
          {activeConversation ? (
            <ChatWindow conversation={activeConversation} currentUser={user!} />
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h2>Select a chat to start messaging</h2>
              <p>Choose from your existing conversations or start a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
