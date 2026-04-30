/**
 * CodeDNA
 * MessageBubble.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import { FiFile, FiCornerUpLeft, FiShare2, FiCheck, FiMoreHorizontal, FiTrash2, FiDownload } from 'react-icons/fi';
import { useState } from 'react';
import { IMessage } from '../../types';
import { getInitials } from '../../utils/helpers';
import './Messages.css';

interface MessageBubbleProps {
  message: IMessage;
  isMe: boolean;
  showAvatar: boolean;
  onReply: () => void;
  onForward: () => void;
  onDelete: () => void;
  onDeleteEveryone?: () => void;
  onMediaClick?: (url: string, type: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isMe, 
  showAvatar, 
  onReply, 
  onForward,
  onDelete,
  onDeleteEveryone,
  onMediaClick
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    switch (message.mediaType) {
      case 'image':
        return <img src={message.mediaUrl} alt="Sent media" className="message-media image" onClick={() => onMediaClick?.(message.mediaUrl!, 'image')} />;
      case 'video':
        return (
          <div className="message-media video-container" onClick={() => onMediaClick?.(message.mediaUrl!, 'video')}>
            <video 
              src={message.mediaUrl} 
              className="message-media video" 
              poster={message.thumbnailUrl}
            />
            <div className="video-overlay-play" />
          </div>
        );
      case 'voice':
      case 'audio':
        return (
          <div className="message-audio">
            <audio src={message.mediaUrl} controls />
            {(message.mediaMetadata?.duration || message.mediaMetadata?.length) && (
              <span className="audio-duration">
                {message.mediaType === 'voice' ? 'Voice message • ' : ''}
                {Math.round(message.mediaMetadata.duration || message.mediaMetadata.length)}s
              </span>
            )}
          </div>
        );
      case 'file':
      case 'document':
        return (
          <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="message-file" download>
            <FiFile size={20} />
            <div className="file-info">
              <span className="file-name">{message.mediaMetadata?.fileName || message.mediaMetadata?.originalName || 'Attachment'}</span>
              <span className="file-size">
                {(() => {
                  const size = message.mediaMetadata?.size || message.mediaMetadata?.fileSize;
                  if (!size) return '';
                  if (size > 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
                  return `${(size / 1024).toFixed(1)} KB`;
                })()}
              </span>
            </div>
          </a>
        );
      case 'story_reply':
        return (
          <div className="story-reply-bubble">
            <div className="story-reply-tag">Replied to story</div>
            {message.text && <p className="message-text">{message.text}</p>}
          </div>
        );
      default:
        return null;
    }
  };

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
        {message.repliedTo && (
          <div className="replied-message-preview">
            <FiCornerUpLeft size={12} />
            <span>{message.repliedTo.text || 'Media'}</span>
          </div>
        )}
        <div className="message-bubble" title={new Date(message.createdAt).toLocaleString()}>
          {message.isDeleted ? (
            <span className="deleted-text">This message was deleted</span>
          ) : (
            <>
              {renderMedia()}
              {message.text && message.mediaType !== 'story_reply' && <p className="message-text">{message.text}</p>}
            </>
          )}
        </div>
        <div className="message-actions-overlay">
          <button className="message-action-btn reply" onClick={onReply} title="Reply">
            <FiCornerUpLeft size={16} />
          </button>
          <button className="message-action-btn forward" onClick={onForward} title="Forward">
            <FiShare2 size={16} />
          </button>
          <div className="message-more-container">
            <button className="message-action-btn more" onClick={() => setShowMenu(!showMenu)} title="More">
              <FiMoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className="message-context-menu">
                <button onClick={() => { onDelete(); setShowMenu(false); }}>
                  <FiTrash2 size={14} /> Remove for you
                </button>
                {message.mediaUrl && (
                  <a 
                    href={message.mediaUrl} 
                    download={message.mediaMetadata?.fileName || 'download'} 
                    className="menu-item-link"
                    onClick={() => setShowMenu(false)}
                  >
                    <FiDownload size={14} /> Download
                  </a>
                )}
                {isMe && onDeleteEveryone && !message.isDeleted && (
                  <button className="danger" onClick={() => { onDeleteEveryone(); setShowMenu(false); }}>
                    <FiTrash2 size={14} /> Unsend for everyone
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {isMe && (
          <div className="message-status">
            {message.readBy && message.readBy.length > 1 ? (
              <div className="status-read" title="Seen">
                <FiCheck size={14} className="double-check read" />
                <FiCheck size={14} className="double-check read second" />
              </div>
            ) : (
              <div className="status-delivered" title="Delivered">
                <FiCheck size={14} className="double-check" />
                <FiCheck size={14} className="double-check second" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
