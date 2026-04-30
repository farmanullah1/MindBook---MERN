/**
 * CodeDNA
 * ForwardModal.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import api from '../../services/api';
import { IConversation, IMessage } from '../../types';
import './Messages.css';

interface ForwardModalProps {
  message: IMessage;
  onClose: () => void;
}

const ForwardModal: React.FC<ForwardModalProps> = ({ message, onClose }) => {
  const { conversations } = useAppSelector(state => state.chat);
  const { user } = useAppSelector(state => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const handleForward = async (convId: string) => {
    setLoading(convId);
    try {
      await api.post(`/conversations/messages/${message._id}/forward`, { conversationId: convId });
      onClose();
    } catch (err) {
      console.error('Forward error:', err);
    } finally {
      setLoading(null);
    }
  };

  const filtered = conversations.filter(c => {
    const other = c.participants.find(p => p._id !== user?._id);
    const name = c.isGroup ? c.groupName : other?.name;
    return name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="modal-overlay">
      <div className="modal-container forward-modal">
        <div className="modal-header">
          <h3>Forward Message</h3>
          <button className="icon-btn" onClick={onClose}><FiX size={24} /></button>
        </div>
        <div className="modal-body">
          <input 
            type="text" 
            placeholder="Search conversations" 
            className="modal-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="forward-list">
            {filtered.map(c => {
              const other = c.participants.find(p => p._id !== user?._id);
              return (
                <div key={c._id} className="forward-item">
                  <div className="forward-item-info">
                    <div className="forward-avatar">
                      {c.isGroup ? '👥' : (
                        <img src={other?.profilePicture || '/default-avatar.png'} alt="Avatar" />
                      )}
                    </div>
                    <span>{c.isGroup ? c.groupName : other?.name}</span>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleForward(c._id)}
                    disabled={!!loading}
                  >
                    {loading === c._id ? 'Sending...' : 'Send'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
