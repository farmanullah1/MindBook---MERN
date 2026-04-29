import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConversations, setActiveConversation } from '../../store/slices/chatSlice';
import Navbar from '../../components/Navbar/Navbar';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import './Messages.css';

const Messages: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { activeConversation, conversations, loading } = useAppSelector(state => state.chat);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="messages-page">
      <Navbar />
      <div className="messages-container">
        <div className="messages-sidebar">
          <div className="sidebar-header">
            <h1>Chats</h1>
            <div className="sidebar-search">
              <input type="text" placeholder="Search Messenger" />
            </div>
          </div>
          <ChatList 
            conversations={conversations} 
            activeId={activeConversation?._id}
            onSelect={(c) => dispatch(setActiveConversation(c))}
            loading={loading}
          />
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
