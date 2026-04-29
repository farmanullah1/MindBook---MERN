import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiImage, FiSmile, FiInfo, FiMoreVertical, FiPaperclip } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMessages, sendMessage as sendMsgAction } from '../../store/slices/chatSlice';
import { IConversation, IUser, IMessage } from '../../types';
import { getInitials, formatTimeAgo } from '../../utils/helpers';
import { socketService } from '../../services/socketService';
import MessageBubble from './MessageBubble';
import './Messages.css';

interface ChatWindowProps {
  conversation: IConversation;
  currentUser: IUser;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, currentUser }) => {
  const dispatch = useAppDispatch();
  const { messages } = useAppSelector(state => state.chat);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const otherUser = conversation.participants.find(p => p._id !== currentUser._id);
  const recipients = conversation.participants.map(p => p._id).filter(id => id !== currentUser._id);

  useEffect(() => {
    dispatch(fetchMessages(conversation._id));
  }, [conversation._id, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const msgData = {
      conversationId: conversation._id,
      text: inputText,
      mediaUrl: '',
      mediaType: ''
    };

    try {
      const res = await dispatch(sendMsgAction(msgData)).unwrap();
      
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
        recipients,
        isTyping: false
      });
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socketService.emitTyping({
        conversationId: conversation._id,
        userId: currentUser._id,
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
        recipients,
        isTyping: false
      });
    }, 3000);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-avatar">
            {conversation.isGroup ? (
              <div className="group-avatar-stack">👥</div>
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
            <p>{otherUser?.isOnline ? 'Active now' : `Active ${formatTimeAgo(otherUser?.lastActive || '')}`}</p>
          </div>
        </div>
        <div className="chat-header-right">
          <button className="icon-btn"><FiInfo size={20} /></button>
          <button className="icon-btn"><FiMoreVertical size={20} /></button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <MessageBubble 
            key={msg._id} 
            message={msg} 
            isMe={msg.sender._id === currentUser._id}
            showAvatar={idx === 0 || messages[idx-1].sender._id !== msg.sender._id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <div className="input-actions">
          <button type="button" className="icon-btn"><FiSmile size={20} /></button>
          <button type="button" className="icon-btn"><FiImage size={20} /></button>
          <button type="button" className="icon-btn"><FiPaperclip size={20} /></button>
        </div>
        <input 
          type="text" 
          placeholder="Aa" 
          value={inputText}
          onChange={handleTyping}
        />
        <button type="submit" className="send-btn" disabled={!inputText.trim()}>
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
