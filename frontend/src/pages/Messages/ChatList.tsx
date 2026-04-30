/**
 * CodeDNA
 * ChatList.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { IConversation } from '../../types';
import { getInitials, formatTimeAgo } from '../../utils/helpers';
import './Messages.css';

interface ChatListProps {
  conversations: IConversation[];
  activeId?: string;
  currentUserId: string;
  onSelect: (conv: IConversation) => void;
  loading: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ conversations, activeId, currentUserId, onSelect, loading }) => {
  if (loading) return <div className="chat-list-loading">Loading chats...</div>;

  return (
    <div className="chat-list">
      {conversations.map((conv) => {
        const otherParticipant = conv.participants.find(p => p._id !== currentUserId);
        const displayUser = conv.isGroup ? null : otherParticipant;
        const isUnread = conv.unreadCount && conv.unreadCount > 0;
        
        return (
          <div 
            key={conv._id} 
            className={`chat-list-item ${activeId === conv._id ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
            onClick={() => onSelect(conv)}
          >
            <div className="chat-item-avatar">
              {conv.isGroup ? (
                <div className="group-avatar-stack">
                  {conv.groupIcon ? <img src={conv.groupIcon} alt={conv.groupName} /> : <span>👥</span>}
                </div>
              ) : (
                <>
                  {displayUser?.profilePicture ? (
                    <img src={displayUser.profilePicture} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">{getInitials(displayUser?.name || 'User')}</div>
                  )}
                  {displayUser?.isOnline && <div className="online-indicator" />}
                </>
              )}
            </div>
            <div className="chat-item-info">
              <div className="chat-item-top">
                <span className="chat-item-name">
                  {conv.isGroup ? conv.groupName : displayUser?.name}
                </span>
                <span className="chat-item-time">
                  {conv.lastMessage ? formatTimeAgo(conv.lastMessage.createdAt) : ''}
                </span>
              </div>
              <div className="chat-item-bottom">
                <p className="chat-item-preview">
                  {conv.lastMessage ? (
                    <>
                      {conv.lastMessage.sender?._id === currentUserId ? 'You: ' : `${conv.lastMessage.sender?.name?.split(' ')[0] || 'User'}: `}
                      {conv.lastMessage.text || (conv.lastMessage as any).mediaType ? (conv.lastMessage.text || 'Sent media') : ''}
                    </>
                  ) : 'No messages yet'}
                </p>
                {isUnread && <div className="unread-badge">{conv.unreadCount}</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
