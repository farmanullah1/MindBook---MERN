/**
 * CodeDNA
 * CreateGroupModal.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState } from 'react';
import { FiX, FiImage } from 'react-icons/fi';
import api, { uploadFile } from '../../services/api';
import './Group.css';

interface CreateGroupModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const res = await uploadFile(e.target.files[0]);
        setCoverPhoto(res.url);
      } catch (error) {
        console.error('File upload failed', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await api.post('/groups', {
        name,
        description,
        privacy,
        coverPhoto,
      });
      onCreated();
    } catch (error) {
      console.error('Failed to create group', error);
      alert('Failed to create group. Name might be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Group</h3>
          <button className="close-btn" onClick={onClose}><FiX /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Group Name</label>
              <input 
                type="text" 
                placeholder="Name your group" 
                value={name} 
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Privacy</label>
              <select value={privacy} onChange={e => setPrivacy(e.target.value as 'public' | 'private')}>
                <option value="public">Public - Anyone can see who's in the group and what they post.</option>
                <option value="private">Private - Only members can see who's in the group and what they post.</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea 
                placeholder="What's your group about?" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Cover Photo</label>
              <div className="cover-upload-preview">
                {coverPhoto ? (
                  <img src={coverPhoto} alt="Cover Preview" className="preview-img" />
                ) : (
                  <div className="preview-placeholder">
                    <FiImage size={40} />
                    <span>Upload a cover photo</span>
                  </div>
                )}
                <input type="file" onChange={handleFileChange} accept="image/*" id="cover-upload" hidden />
                <label htmlFor="cover-upload" className="upload-label">
                  {coverPhoto ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
