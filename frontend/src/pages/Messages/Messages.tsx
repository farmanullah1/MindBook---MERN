import React from 'react';
import { FiSend } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import api from '../../services/api';
import { useAppSelector } from '../../store/hooks';
import { IConversation, IMessage } from '../../types';
import { getInitials } from '../../utils/helpers';
import './Messages.css';

const Messages: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [conversations, setConversations] = React.useState<IConversation[]>([]);
  const [activeChat, setActiveChat] = React.useState<IConversation['user'] | null>(null);
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
      if (res.data.some((m: IMessage) => !m.read && m.receiver === user?._id)) {
        await api.put(`/messages/${userId}/read`);
        fetchConversations();
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  React.useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll conversations every 10s
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
      const interval = setInterval(() => fetchMessages(activeChat._id), 3000); // Poll messages every 3s
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const res = await api.post(`/messages/${activeChat._id}`, { text: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
      fetchConversations(); // Update latest message in sidebar
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="messages-page" style={{ paddingTop: 'calc(var(--navbar-height))' }}>
        <div className="messages-container">
          
          {/* Sidebar */}
          <div className="conversations-sidebar">
            <div className="sidebar-header">
              <h2>Chats</h2>
            </div>
            <div className="conversations-list">
              {conversations.length === 0 ? (
                <p className="no-conversations">No conversations yet.</p>
              ) : (
                conversations.map((conv) => (
                  <div 
                    key={conv.user._id} 
                    className={`conversation-item ${activeChat?._id === conv.user._id ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                    onClick={() => setActiveChat(conv.user)}
                  >
                    <div className="conv-avatar">
                      {conv.user.profilePicture ? (
                        <img src={conv.user.profilePicture} alt={conv.user.name} />
                      ) : (
                        <div className="avatar-initials">{getInitials(conv.user.name)}</div>
                      )}
                    </div>
                    <div className="conv-info">
                      <div className="conv-header">
                        <h4>{conv.user.name}</h4>
                        {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                      </div>
                      <p className="latest-message">
                        {conv.latestMessage.sender === user?._id ? 'You: ' : ''}
                        {conv.latestMessage.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="chat-window">
            {activeChat ? (
              <>
                <div className="chat-header">
                  <div className="chat-avatar">
                    {activeChat.profilePicture ? (
                      <img src={activeChat.profilePicture} alt={activeChat.name} />
                    ) : (
                      <div className="avatar-initials">{getInitials(activeChat.name)}</div>
                    )}
                  </div>
                  <h3>{activeChat.name}</h3>
                </div>

                <div className="chat-messages">
                  {messages.map((msg) => {
                    const isOwn = msg.sender === user?._id;
                    return (
                      <div key={msg._id} className={`message-bubble-wrapper ${isOwn ? 'own' : 'other'}`}>
                        <div className="message-bubble">
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-form" onSubmit={handleSendMessage}>
                  <input 
                    type="text" 
                    placeholder="Aa" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="send-btn">
                    <FiSend size={20} />
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-placeholder">
                <FiSend size={48} className="placeholder-icon" />
                <h2>Your Messages</h2>
                <p>Select a conversation to start chatting.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Messages;
