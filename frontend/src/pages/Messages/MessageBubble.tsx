import React from 'react';
import { IMessage } from '../../types';
import { getInitials } from '../../utils/helpers';
import './Messages.css';

interface MessageBubbleProps {
  message: IMessage;
  isMe: boolean;
  showAvatar: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, showAvatar }) => {
  return (
    <div className={`message-row ${isMe ? 'me' : 'them'}`}>
      {!isMe && (
        <div className="message-avatar">
          {showAvatar ? (
            message.sender.profilePicture ? (
              <img src={message.sender.profilePicture} alt={message.sender.name} />
            ) : (
              <div className="avatar-placeholder">{getInitials(message.sender.name)}</div>
            )
          ) : (
            <div className="avatar-spacer" />
          )}
        </div>
      )}
      <div className="message-content-wrapper">
        <div className="message-bubble" title={new Date(message.createdAt).toLocaleString()}>
          {message.isDeleted ? (
            <span className="deleted-text">This message was deleted</span>
          ) : (
            message.text
          )}
        </div>
        {/* Read receipt indicator could go here */}
      </div>
    </div>
  );
};

export default MessageBubble;
