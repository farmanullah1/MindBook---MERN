import React from 'react';
import { FiImage, FiSmile, FiVideo, FiMapPin, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createPost } from '../../store/slices/postsSlice';
import { uploadImage } from '../../services/api';
import api from '../../services/api';
import { getInitials } from '../../utils/helpers';
import './CreatePost.css';

interface CreatePostProps {
  groupId?: string;
  onPostCreated?: (post: any) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ groupId, onPostCreated }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [content, setContent] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [showLocationInput, setShowLocationInput] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setLoading(true);
    try {
      let uploadedImageUrl = '';
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
      }

      const postData = { content, image: uploadedImageUrl, location };

      if (groupId) {
        const res = await api.post(`/groups/${groupId}/posts`, postData);
        if (onPostCreated) onPostCreated(res.data);
      } else {
        await dispatch(createPost(postData)).unwrap();
      }
      setContent('');
      setLocation('');
      setShowLocationInput(false);
      removeImage();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className="create-post card">
      <form onSubmit={handleSubmit}>
        <div className="create-post-top">
          <div className="create-post-avatar">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="avatar" />
            ) : (
              <div className="avatar">{user ? getInitials(user.name) : '?'}</div>
            )}
          </div>
          <textarea
            ref={textareaRef}
            className="create-post-input"
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'User'}?`}
            value={content}
            onChange={handleTextareaChange}
            rows={1}
          />
        </div>

        {showLocationInput && (
          <div className="location-input-wrapper">
            <FiMapPin size={16} className="text-danger" />
            <input 
              type="text" 
              className="location-input" 
              placeholder="Add location..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button type="button" className="close-btn" onClick={() => { setLocation(''); setShowLocationInput(false); }}>
              <FiX size={16} />
            </button>
          </div>
        )}

        <div className="create-post-media">
          {imagePreview && (
            <div className="create-post-image-preview">
              <img src={imagePreview} alt="Preview" />
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={removeImage}
              >
                <FiX />
              </button>
            </div>
          )}
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
          />
        </div>
        
        <div className="create-post-footer">
          <div className="create-post-actions">
            <button 
              type="button" 
              className="action-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiImage size={20} className="action-icon text-success" />
              <span>Photo</span>
            </button>
            <button type="button" className="action-btn" onClick={() => setShowLocationInput(!showLocationInput)}>
              <FiMapPin size={20} className="action-icon text-danger" />
              <span>Location</span>
            </button>
            <button type="button" className="action-btn">
              <FiSmile size={20} className="action-icon text-warning" />
              <span>Feeling</span>
            </button>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={(!content.trim() && !imageFile) || loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
