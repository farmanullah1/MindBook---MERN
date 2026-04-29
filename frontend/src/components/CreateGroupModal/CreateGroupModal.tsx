import React from 'react';
import { FiX, FiImage } from 'react-icons/fi';
import api, { uploadFile } from '../../services/api';
import './CreateGroupModal.css';

interface CreateGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [privacy, setPrivacy] = React.useState<'public' | 'private'>('public');
  const [coverPhoto, setCoverPhoto] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      setError('Name and description are required');
      return;
    }

    setLoading(true);
    try {
      let coverPhotoUrl = '';
      if (coverPhoto) {
        const res = await uploadFile(coverPhoto);
        coverPhotoUrl = res.url;
      }

      await api.post('/groups', {
        name,
        description,
        privacy,
        coverPhoto: coverPhotoUrl
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container create-group-modal">
        <div className="modal-header">
          <h2>Create Group</h2>
          <button className="close-btn" onClick={onClose}><FiX size={24} /></button>
        </div>
        
        <form className="modal-body" onSubmit={handleSubmit}>
          {error && <div className="modal-message error">{error}</div>}
          
          <div className="form-group">
            <label>Group Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Name your group"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="input-field" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="What is this group about?"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Privacy</label>
            <select className="input-field" value={privacy} onChange={(e) => setPrivacy(e.target.value as 'public'|'private')}>
              <option value="public">Public - Anyone can see who's in the group and what they post</option>
              <option value="private">Private - Only members can see who's in the group and what they post</option>
            </select>
          </div>

          <div className="form-group">
            <label>Cover Photo (Optional)</label>
            <div className="group-cover-upload">
              <input 
                type="file" 
                id="groupCover" 
                hidden 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setCoverPhoto(e.target.files[0]);
                }}
              />
              <label htmlFor="groupCover" className="upload-label">
                <FiImage size={24} />
                <span>{coverPhoto ? coverPhoto.name : 'Select an image'}</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading || !name || !description}>
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
