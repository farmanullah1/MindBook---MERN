/**
 * CodeDNA
 * EditGroupModal.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState } from 'react';
import { FiX, FiImage, FiGlobe, FiLock } from 'react-icons/fi';
import api, { uploadFile } from '../../services/api';
import { IGroup } from '../../types';
import './CreateGroupModal.css';

interface EditGroupModalProps {
  group: IGroup;
  onClose: () => void;
  onUpdated: () => void;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({ group, onClose, onUpdated }) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [privacy, setPrivacy] = useState(group.privacy);
  const [coverPhoto, setCoverPhoto] = useState(group.coverPhoto || '');
  const [rules, setRules] = useState<string[]>(group.rules || []);
  const [newRule, setNewRule] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const res = await uploadFile(e.target.files[0]);
        setCoverPhoto(res.url);
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await api.put(`/groups/${group._id}`, {
        name,
        description,
        privacy,
        coverPhoto,
        rules
      });
      onUpdated();
    } catch (error) {
      console.error('Update failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content create-group-modal">
        <div className="modal-header">
          <h2>Edit Group Settings</h2>
          <button className="close-btn" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="create-group-form">
          <div className="form-group">
            <label>Group Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="What's this group about?"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Privacy</label>
            <div className="privacy-options">
              <div 
                className={`privacy-option ${privacy === 'public' ? 'active' : ''}`}
                onClick={() => setPrivacy('public')}
              >
                <FiGlobe />
                <div className="option-text">
                  <strong>Public</strong>
                  <span>Anyone can see who's in the group and what they post.</span>
                </div>
                <input type="radio" checked={privacy === 'public'} readOnly />
              </div>
              <div 
                className={`privacy-option ${privacy === 'private' ? 'active' : ''}`}
                onClick={() => setPrivacy('private')}
              >
                <FiLock />
                <div className="option-text">
                  <strong>Private</strong>
                  <span>Only members can see who's in the group and what they post.</span>
                </div>
                <input type="radio" checked={privacy === 'private'} readOnly />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Group Rules</label>
            <div className="rules-editor">
              <ul className="rules-list-edit">
                {rules.map((rule, index) => (
                  <li key={index} className="rule-item-edit">
                    <span>{index + 1}. {rule}</span>
                    <button type="button" onClick={() => handleRemoveRule(index)}><FiX /></button>
                  </li>
                ))}
              </ul>
              <div className="add-rule-input">
                <input 
                  type="text" 
                  value={newRule} 
                  onChange={(e) => setNewRule(e.target.value)} 
                  placeholder="Add a rule..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRule())}
                />
                <button type="button" onClick={handleAddRule}>Add</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Cover Photo</label>
            <div className="cover-upload-preview">
              {coverPhoto ? (
                <div className="preview-container">
                  <img src={coverPhoto} alt="Cover Preview" />
                  <button type="button" className="remove-img" onClick={() => setCoverPhoto('')}><FiX /></button>
                </div>
              ) : (
                <div className="upload-placeholder" onClick={() => document.getElementById('cover-input')?.click()}>
                  <FiImage size={32} />
                  <span>{uploading ? 'Uploading...' : 'Click to upload cover photo'}</span>
                </div>
              )}
              <input 
                type="file" 
                id="cover-input" 
                hidden 
                accept="image/*" 
                onChange={handleCoverUpload} 
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || uploading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;
