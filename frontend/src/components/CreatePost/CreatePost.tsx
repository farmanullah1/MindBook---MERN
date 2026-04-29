import React from 'react';
import { FiImage, FiSmile, FiVideo, FiMapPin, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createPost } from '../../store/slices/postsSlice';
import api, { uploadFile } from '../../services/api';
import { getInitials } from '../../utils/helpers';
import './CreatePost.css';

const FEELINGS = [
  { name: 'Happy', emoji: '😊' },
  { name: 'Loved', emoji: '🥰' },
  { name: 'Sad', emoji: '😢' },
  { name: 'Excited', emoji: '🤩' },
  { name: 'Angry', emoji: '😠' },
  { name: 'Thinking', emoji: '🤔' },
  { name: 'Relaxed', emoji: '😌' },
];

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
  const [mediaFile, setMediaFile] = React.useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = React.useState('');
  const [mediaType, setMediaType] = React.useState<'image' | 'video' | ''>('');
  const [feeling, setFeeling] = React.useState<{name: string, emoji: string} | null>(null);
  const [showFeelingPicker, setShowFeelingPicker] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    setMediaType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile && !feeling) return;

    setLoading(true);
    try {
      let uploadedUrl = '';
      let type = '';
      if (mediaFile) {
        const res = await uploadFile(mediaFile);
        uploadedUrl = res.url;
        type = res.type;
      }

      const postData: any = { 
        content: feeling ? `${feeling.emoji} is feeling ${feeling.name}. ${content}` : content, 
        location,
        group: groupId || null
      };
      if (type === 'video') {
        postData.video = uploadedUrl;
      } else if (type === 'image') {
        postData.image = uploadedUrl;
      }

      if (groupId) {
        // For groups, we might want to just use the api directly to avoid cluttering main feed state
        // or we can update the slice to handle group posts.
        // For now, let's just use the API and the callback.
        const res = await api.post('/posts', postData);
        if (onPostCreated) onPostCreated(res.data);
      } else {
        await dispatch(createPost(postData)).unwrap();
      }
      setContent('');
      setLocation('');
      setFeeling(null);
      setShowLocationInput(false);
      setShowFeelingPicker(false);
      removeMedia();
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
          <div className="create-post-input-container">
            {feeling && (
              <div className="selected-feeling">
                {feeling.emoji} feeling {feeling.name}
                <button type="button" onClick={() => setFeeling(null)}><FiX size={12} /></button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              className="create-post-input"
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'User'}?`}
              value={content}
              onChange={handleTextareaChange}
              rows={1}
            />
          </div>
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
          {mediaPreview && (
            <div className="create-post-image-preview">
              {mediaType === 'video' ? (
                <video src={mediaPreview} controls />
              ) : (
                <img src={mediaPreview} alt="Preview" />
              )}
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={removeMedia}
              >
                <FiX />
              </button>
            </div>
          )}
          
          <input 
            type="file" 
            accept="image/*,video/*" 
            ref={fileInputRef} 
            onChange={handleMediaChange} 
            style={{ display: 'none' }} 
          />
        </div>

        {showFeelingPicker && (
          <div className="feeling-picker">
            {FEELINGS.map((f) => (
              <button 
                key={f.name} 
                type="button" 
                className="feeling-item"
                onClick={() => { setFeeling(f); setShowFeelingPicker(false); }}
              >
                <span className="feeling-emoji">{f.emoji}</span>
                <span className="feeling-name">{f.name}</span>
              </button>
            ))}
          </div>
        )}
        
        <div className="create-post-footer">
          <div className="create-post-actions">
            <button 
              type="button" 
              className="action-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiImage size={20} className="action-icon text-success" />
              <span>Photo/Video</span>
            </button>
            <button type="button" className="action-btn" onClick={() => setShowLocationInput(!showLocationInput)}>
              <FiMapPin size={20} className="action-icon text-danger" />
              <span>Location</span>
            </button>
            <button type="button" className="action-btn" onClick={() => setShowFeelingPicker(!showFeelingPicker)}>
              <FiSmile size={20} className="action-icon text-warning" />
              <span>Feeling</span>
            </button>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={(!content.trim() && !mediaFile && !feeling) || loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
