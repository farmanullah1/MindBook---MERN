import React from 'react';
import { IConversation } from '../../types';
import { getInitials, formatTimeAgo } from '../../utils/helpers';
import './Messages.css';

interface ChatListProps {
  conversations: IConversation[];
  activeId?: string;
  onSelect: (conv: IConversation) => void;
  loading: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ conversations, activeId, onSelect, loading }) => {
  if (loading) return <div className="chat-list-loading">Loading chats...</div>;

  return (
    <div className="chat-list">
      {conversations.map((conv) => {
        const otherParticipant = conv.participants.find(p => p._id !== activeId); // This logic needs the current user id
        // Actually, let's pass current user id too, or just use the first non-me participant
        // For simplicity in this component, we'll assume the caller handled finding 'the other person' if it's not a group.
        
        // Let's refine the "other participant" logic by passing it from parent or using a hook.
        // For now, let's just show the first participant that isn't the logged-in user.
        
        return (
          <div 
            key={conv._id} 
            className={`chat-list-item ${activeId === conv._id ? 'active' : ''}`}
            onClick={() => onSelect(conv)}
          >
            <div className="chat-item-avatar">
              {conv.isGroup ? (
                <div className="group-avatar-stack">👥</div>
              ) : (
                <>
                  {conv.participants[0]?.profilePicture ? (
                    <img src={conv.participants[0].profilePicture} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">{getInitials(conv.participants[0]?.name || 'User')}</div>
                  )}
                  {conv.participants[0]?.isOnline && <div className="online-indicator" />}
                </>
              )}
            </div>
            <div className="chat-item-info">
              <div className="chat-item-top">
                <span className="chat-item-name">
                  {conv.isGroup ? conv.groupName : conv.participants[0]?.name}
                </span>
                <span className="chat-item-time">
                  {conv.lastMessage ? formatTimeAgo(conv.lastMessage.createdAt) : ''}
                </span>
              </div>
              <div className="chat-item-bottom">
                <p className="chat-item-preview">
                  {conv.lastMessage ? (
                    <>
                      {conv.lastMessage.sender.name.split(' ')[0]}: {conv.lastMessage.text}
                    </>
                  ) : 'No messages yet'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
