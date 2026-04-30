/**
 * CodeDNA
 * ChatWindow.tsx — main chat window
 * exports: none
 * used_by: internal
 * rules: Support mobile back navigation
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Added onBack and improved typing UI
 */

import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiImage, FiSmile, FiInfo, FiMoreVertical, FiPaperclip, FiX, FiMic, FiVideo, FiPhone, FiArrowLeft } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMessages, sendMessage as sendMsgAction, acceptRequest, fetchConversations, setActiveConversation, deleteMessage, deleteForEveryone } from '../../store/slices/chatSlice';
import { IConversation, IUser, IMessage } from '../../types';
import { getInitials, formatTimeAgo } from '../../utils/helpers';
import { socketService } from '../../services/socketService';
import MessageBubble from './MessageBubble';
import ChatInfo from './ChatInfo';
import ForwardModal from './ForwardModal';
import MediaViewer from '../../components/MediaViewer/MediaViewer';
import VoiceRecorder from './VoiceRecorder';
import AttachmentMenu from './AttachmentMenu';
import MediaPreviewModal from './MediaPreviewModal';
import api from '../../services/api';
import './Messages.css';
import { AnimatePresence } from 'framer-motion';
import Picker, { EmojiClickData } from 'emoji-picker-react';

interface ChatWindowProps {
  conversation: IConversation;
  currentUser: IUser;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, currentUser, onBack }) => {
  const dispatch = useAppDispatch();
  const { messages, typingUsers } = useAppSelector(state => state.chat);
  const currentTyping = typingUsers[conversation._id] || [];
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<IMessage | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [viewerMedia, setViewerMedia] = useState<{ url: string; type: string } | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const attachmentBtnRef = useRef<HTMLButtonElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const otherUser = conversation.participants.find(p => p._id !== currentUser._id);
  const recipients = conversation.participants.map(p => p._id).filter(id => id !== currentUser._id);

  useEffect(() => {
    dispatch(fetchMessages(conversation._id));
  }, [conversation._id, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const msgData = {
      conversationId: conversation._id,
      text: inputText,
      mediaUrl: '',
      mediaType: '',
      repliedTo: replyingTo?._id
    };

    try {
      const res = await dispatch(sendMsgAction(msgData)).unwrap();
      setReplyingTo(null);
      
      // Emit socket event
      socketService.emitMessage({
        conversationId: conversation._id,
        sender: currentUser._id,
        recipients,
        message: res
      });

      setInputText('');
      socketService.emitTyping({
        conversationId: conversation._id,
        userId: currentUser._id,
        userName: currentUser.name,
        recipients,
        isTyping: false
      });
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socketService.emitTyping({
        conversationId: conversation._id,
        userId: currentUser._id,
        userName: currentUser.name,
        recipients,
        isTyping: true
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.emitTyping({
        conversationId: conversation._id,
        userId: currentUser._id,
        userName: currentUser.name,
        recipients,
        isTyping: false
      });
    }, 3000);
  };

  const handleFileSelect = (files: FileList) => {
    setSelectedFiles(Array.from(files));
    setShowAttachmentMenu(false);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInputText(prev => prev + emojiData.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiBtnRef.current && !emojiBtnRef.current.contains(event.target as Node)) {
        const picker = document.querySelector('.emoji-picker-container');
        if (picker && !picker.contains(event.target as Node)) {
          setShowEmojiPicker(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMedia = async (files: File[], caption: string) => {
    setSelectedFiles([]); // Close modal
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('conversationId', conversation._id);

      try {
        const res = await api.post('/conversations/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const msgData = {
          conversationId: conversation._id,
          text: caption, // Apply caption to the first file or all? Usually first or as a separate message.
          mediaUrl: res.data.mediaUrl,
          mediaType: res.data.mediaType,
          mediaMetadata: res.data.mediaMetadata
        };

        const newMsg = await dispatch(sendMsgAction(msgData)).unwrap();
        
        socketService.emitMessage({
          conversationId: conversation._id,
          sender: currentUser._id,
          recipients,
          message: newMsg
        });

        // Only use caption for the first message in the batch
        caption = ''; 
      } catch (error) {
        console.error('Media upload failed', error);
      }
    }
  };

  const handleVoiceStop = async (blob: Blob, duration: number) => {
    const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('media', file);
    formData.append('conversationId', conversation._id);

    try {
      const res = await api.post('/conversations/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const msgData = {
        conversationId: conversation._id,
        text: '',
        mediaUrl: res.data.mediaUrl,
        mediaType: 'voice',
        mediaMetadata: { ...res.data.mediaMetadata, duration }
      };

      const newMsg = await dispatch(sendMsgAction(msgData)).unwrap();
      socketService.emitMessage({
        conversationId: conversation._id,
        sender: currentUser._id,
        recipients,
        message: newMsg
      });
      setIsRecording(false);
    } catch (error) {
      console.error('Voice upload failed', error);
      setIsRecording(false);
    }
  };

  const isRequest = conversation.status === 'pending' && conversation.participants[1]._id === currentUser._id;
  const iSentRequest = conversation.status === 'pending' && conversation.participants[0]._id === currentUser._id;

  const handleAccept = () => {
    dispatch(acceptRequest(conversation._id));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await api.delete(`/conversations/${conversation._id}`);
        dispatch(fetchConversations());
        dispatch(setActiveConversation(null));
      } catch (err) {
        console.error('Delete conversation error:', err);
      }
    }
  };

  const handleBlock = async () => {
    // Implement block logic
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="back-btn" onClick={onBack} title="Back to chats">
            <FiArrowLeft size={20} />
          </button>
          <div className="chat-header-avatar">
            {conversation.isGroup ? (
              <div className="group-avatar-stack">
                {conversation.groupIcon ? <img src={conversation.groupIcon} alt={conversation.groupName} /> : <span>👥</span>}
              </div>
            ) : (
              <>
                {otherUser?.profilePicture ? (
                  <img src={otherUser.profilePicture} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">{getInitials(otherUser?.name || 'User')}</div>
                )}
                {otherUser?.isOnline && <div className="online-indicator" />}
              </>
            )}
          </div>
          <div className="chat-header-info">
            <h3>{conversation.isGroup ? conversation.groupName : otherUser?.name}</h3>
            <p className={otherUser?.isOnline ? 'online-status' : 'offline-status'}>
              {otherUser?.isOnline ? 'Active now' : `Active ${formatTimeAgo(otherUser?.lastActive || '')}`}
            </p>
          </div>
        </div>
        <div className="chat-header-right">
          <button className="icon-btn-modern" title="Start a voice call"><FiPhone size={20} /></button>
          <button className="icon-btn-modern" title="Start a video call"><FiVideo size={20} /></button>
          <button className="icon-btn-modern" onClick={() => setShowInfo(!showInfo)} title="Conversation information">
            <FiInfo size={20} color={showInfo ? 'var(--brand-primary)' : 'inherit'} />
          </button>
        </div>
      </div>

      <div className="chat-window-main">
        <div className="chat-window-content">
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <MessageBubble 
                key={msg._id} 
                message={msg} 
                isMe={msg.sender._id === currentUser._id}
                showAvatar={idx === 0 || messages[idx-1].sender._id !== msg.sender._id}
                onReply={() => setReplyingTo(msg)}
                onForward={() => setForwardingMsg(msg)}
                onDelete={() => dispatch(deleteMessage(msg._id))}
                onDeleteEveryone={msg.sender._id === currentUser._id ? () => dispatch(deleteForEveryone(msg._id)) : undefined}
                onMediaClick={(url, type) => setViewerMedia({ url, type })}
              />
            ))}
            {currentTyping.length > 0 && (
              <div className="typing-indicator">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
                <span>{currentTyping.join(', ')} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {replyingTo && (
            <div className="replying-to-bar">
              <div className="reply-preview-info">
                <span>Replying to <strong>{replyingTo.sender.name}</strong></span>
                <p>{replyingTo.text || 'Media'}</p>
              </div>
              <button className="close-reply-btn" onClick={() => setReplyingTo(null)}><FiX size={16} /></button>
            </div>
          )}

          {isRequest ? (
            <div className="message-request-actions">
              <div className="request-info-box">
                <p>Do you want to let {otherUser?.name} message you?</p>
                <span>They won't know you've seen their message until you accept.</span>
              </div>
              <div className="request-buttons">
                <button className="accept-btn" onClick={handleAccept}>Accept</button>
                <button className="delete-btn">Delete</button>
                <button className="block-btn">Block</button>
              </div>
            </div>
          ) : iSentRequest ? (
            <div className="sent-request-notice">
              <p>Message Request Sent</p>
              <span>Waiting for {otherUser?.name} to accept your request.</span>
            </div>
          ) : (
            <form className="chat-input-area" onSubmit={handleSend}>
              <div className="input-actions">
                <div className="attachment-btn-wrapper">
                  <button 
                    type="button" 
                    className={`icon-btn ${showAttachmentMenu ? 'active' : ''}`} 
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)} 
                    title="Attach file"
                    ref={attachmentBtnRef}
                  >
                    <FiPaperclip size={20} />
                  </button>
                  <AnimatePresence>
                    {showAttachmentMenu && (
                      <AttachmentMenu 
                        onSelectFiles={handleFileSelect}
                        onVoiceRecord={() => { setIsRecording(true); setShowAttachmentMenu(false); }}
                        onClose={() => setShowAttachmentMenu(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
                
                <button type="button" className="icon-btn" onClick={() => setIsRecording(true)} title="Voice message">
                  <FiMic size={20} />
                </button>
                <div className="emoji-picker-wrapper">
                  <button 
                    type="button" 
                    className={`icon-btn ${showEmojiPicker ? 'active' : ''}`} 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    title="Emoji picker"
                    ref={emojiBtnRef}
                  >
                    <FiSmile size={20} />
                  </button>
                  {showEmojiPicker && (
                    <div className="emoji-picker-container">
                      <Picker 
                        onEmojiClick={onEmojiClick}
                        autoFocusSearch={false}
                        theme={document.body.classList.contains('dark-mode') ? 'dark' : 'light'}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="chat-input-wrapper">
                <textarea 
                  placeholder="Type a message..." 
                  value={inputText}
                  onChange={handleTyping}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as any);
                    }
                  }}
                />
              </div>
              <button type="submit" className="send-btn" disabled={!inputText.trim()}>
                <FiSend size={20} />
              </button>

              {isRecording && (
                <VoiceRecorder 
                  onStop={handleVoiceStop} 
                  onCancel={() => setIsRecording(false)} 
                />
              )}
            </form>
          )}
        </div>
        {showInfo && <ChatInfo conversation={conversation} onClose={() => setShowInfo(false)} />}
      </div>
      {forwardingMsg && (
        <ForwardModal 
          message={forwardingMsg} 
          onClose={() => setForwardingMsg(null)} 
        />
      )}
      {viewerMedia && (
        <MediaViewer 
          url={viewerMedia.url} 
          type={viewerMedia.type} 
          onClose={() => setViewerMedia(null)} 
        />
      )}
      {selectedFiles.length > 0 && (
        <MediaPreviewModal 
          files={selectedFiles}
          onSend={handleSendMedia}
          onCancel={() => setSelectedFiles([])}
        />
      )}
    </div>
  );
};

export default ChatWindow;
