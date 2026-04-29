import React from 'react';
import { FiImage, FiSmile, FiMapPin } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createPost } from '../../store/slices/postsSlice';
import { getInitials } from '../../utils/helpers';
import './CreatePost.css';

const CreatePost: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [content, setContent] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [showImageInput, setShowImageInput] = React.useState(false);
  const [isPosting, setIsPosting] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl.trim()) return;
    setIsPosting(true);

    try {
      await dispatch(createPost({ content: content.trim(), image: imageUrl.trim() })).unwrap();
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
    setIsPosting(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className="create-post card" id="create-post">
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
          id="create-post-input"
        />
      </div>

      {showImageInput && (
        <div className="create-post-image-input">
          <input
            type="text"
            className="input-field"
            placeholder="Paste image URL here..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            id="create-post-image-url"
          />
          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="Preview" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
      )}

      <div className="create-post-divider" />

      <div className="create-post-bottom">
        <div className="create-post-actions">
          <button
            className="create-post-action"
            onClick={() => setShowImageInput(!showImageInput)}
            id="toggle-image-input"
          >
            <FiImage size={20} className="action-icon action-icon-green" />
            <span>Photo/Video</span>
          </button>
          <button className="create-post-action">
            <FiSmile size={20} className="action-icon action-icon-yellow" />
            <span>Feeling/Activity</span>
          </button>
          <button className="create-post-action hide-mobile">
            <FiMapPin size={20} className="action-icon action-icon-red" />
            <span>Check in</span>
          </button>
        </div>

        {(content.trim() || imageUrl.trim()) && (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isPosting}
            id="submit-post-btn"
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
