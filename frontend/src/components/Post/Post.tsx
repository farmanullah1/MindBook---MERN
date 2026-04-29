import React from 'react';
import { Link } from 'react-router-dom';
import { FiThumbsUp, FiMessageCircle, FiShare2, FiMoreHorizontal, FiTrash2, FiSend, FiBookmark, FiEdit2, FiMapPin } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { likePost, commentOnPost, deletePost, updatePost, deleteComment } from '../../store/slices/postsSlice';
import { toggleSavePost } from '../../store/slices/authSlice';
import { IPost } from '../../types';
import { getInitials, formatTimeAgo } from '../../utils/helpers';
import './Post.css';

interface PostProps {
  post: IPost;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');
  const [showMenu, setShowMenu] = React.useState(false);
  const [isLiking, setIsLiking] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const isLiked = user ? post.likes.includes(user._id) : false;
  const isOwner = user?._id === post.user._id;
  const isSaved = user?.savedPosts?.includes(post._id) || false;

  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(post.content);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    await dispatch(likePost(post._id));
    setIsLiking(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await dispatch(commentOnPost({ postId: post._id, text: commentText.trim() }));
    setCommentText('');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await dispatch(deletePost(post._id));
    }
    setShowMenu(false);
  };

  const handleSave = async () => {
    await dispatch(toggleSavePost(post._id));
    setShowMenu(false);
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    await dispatch(updatePost({ postId: post._id, content: editContent }));
    setIsEditing(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Delete this comment?')) {
      await dispatch(deleteComment({ postId: post._id, commentId }));
    }
  };

  const linkifyContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="post-link">{part}</a>;
      }
      return part;
    });
  };

  return (
    <article className="post card" id={`post-${post._id}`}>
      {/* Post Header */}
      <div className="post-header">
        <Link to={`/profile/${post.user._id}`} className="post-user-info">
          {post.user.profilePicture ? (
            <img src={post.user.profilePicture} alt={post.user.name} className="avatar" />
          ) : (
            <div className="avatar">{getInitials(post.user.name)}</div>
          )}
          <div className="post-user-meta">
            <span className="post-user-name">{post.user.name}</span>
            <div className="post-time-location">
              <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
              {post.location && (
                <>
                  <span className="dot">•</span>
                  <span className="post-location">
                    <FiMapPin size={12} /> {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>
          <div className="post-menu-container" ref={menuRef}>
            <button className="post-menu-btn" onClick={() => setShowMenu(!showMenu)}>
              <FiMoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="post-menu-dropdown">
                <button className="post-menu-item" onClick={handleSave}>
                  <FiBookmark size={16} className={isSaved ? 'text-brand' : ''} />
                  <span>{isSaved ? 'Unsave post' : 'Save post'}</span>
                </button>
                {isOwner && (
                  <>
                    <button className="post-menu-item" onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                      <FiEdit2 size={16} />
                      <span>Edit post</span>
                    </button>
                    <button className="post-menu-item delete-item" onClick={handleDelete}>
                      <FiTrash2 size={16} />
                      <span>Delete post</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="post-edit-container" style={{ padding: '0 16px', marginTop: '12px' }}>
          <textarea
            className="create-post-input"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{ width: '100%', marginBottom: '8px' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleEditSubmit}>Save</button>
          </div>
        </div>
      ) : (
        post.content && (
          <div className="post-content">
            <p>{linkifyContent(post.content)}</p>
          </div>
        )
      )}

      {/* Post Image */}
      {post.image && (
        <div className="post-image">
          <img src={post.image} alt="Post" loading="lazy" />
        </div>
      )}

      {/* Engagement Stats */}
      {(post.likes.length > 0 || post.comments.length > 0) && (
        <div className="post-stats">
          {post.likes.length > 0 && (
            <div className="post-likes-count">
              <span className="like-icon-small">👍</span>
              <span>{post.likes.length}</span>
            </div>
          )}
          {post.comments.length > 0 && (
            <button
              className="post-comments-count"
              onClick={() => setShowComments(!showComments)}
            >
              {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="post-actions-divider" />
      <div className="post-actions">
        <button
          className={`post-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
          id={`like-btn-${post._id}`}
        >
          <FiThumbsUp size={18} />
          <span>Like</span>
        </button>
        <button
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
          id={`comment-btn-${post._id}`}
        >
          <FiMessageCircle size={18} />
          <span>Comment</span>
        </button>
        <button className="post-action-btn">
          <FiShare2 size={18} />
          <span>Share</span>
        </button>
      </div>
      <div className="post-actions-divider" />

      {/* Comments Section */}
      {showComments && (
        <div className="post-comments-section">
          {/* Existing Comments */}
          {post.comments.map((comment) => (
            <div key={comment._id} className="comment" id={`comment-${comment._id}`}>
              <Link to={`/profile/${comment.user._id}`}>
                {comment.user.profilePicture ? (
                  <img src={comment.user.profilePicture} alt={comment.user.name} className="avatar avatar-sm" />
                ) : (
                  <div className="avatar avatar-sm">{getInitials(comment.user.name)}</div>
                )}
              </Link>
              <div className="comment-body">
                <div className="comment-bubble">
                  <div className="comment-header-row">
                    <Link to={`/profile/${comment.user._id}`} className="comment-author">
                      {comment.user.name}
                    </Link>
                    {(comment.user._id === user?._id || isOwner) && (
                      <button className="comment-delete-btn" onClick={() => handleDeleteComment(comment._id)}>
                        <FiTrash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
                <div className="comment-meta">
                  <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                  <button className="comment-like-btn">Like</button>
                  <button className="comment-reply-btn">Reply</button>
                </div>
              </div>
            </div>
          ))}

          {/* Comment Input */}
          <form className="comment-form" onSubmit={handleComment}>
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="avatar avatar-sm" />
            ) : (
              <div className="avatar avatar-sm">{user ? getInitials(user.name) : '?'}</div>
            )}
            <div className="comment-input-wrapper">
              <input
                type="text"
                className="comment-input"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                id={`comment-input-${post._id}`}
              />
              {commentText.trim() && (
                <button type="submit" className="comment-send-btn" id={`send-comment-${post._id}`}>
                  <FiSend size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </article>
  );
};

export default Post;
