/**
 * CodeDNA
 * Post.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiThumbsUp, 
  FiMessageCircle, 
  FiShare2, 
  FiMoreHorizontal, 
  FiBookmark, 
  FiEdit2, 
  FiTrash2, 
  FiMapPin,
  FiSend,
  FiPlay
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  reactToPost, 
  commentOnPost, 
  deletePost, 
  updatePost, 
  deleteComment,
  toggleSavePost,
  likeComment,
  replyToComment,
  createPost
} from '../../store/slices/postsSlice';
import { IPost } from '../../types';
import { formatTimeAgo, getInitials } from '../../utils/helpers';
import MediaViewer from '../MediaViewer/MediaViewer';
import './Post.css';

interface PostProps {
  post: IPost;
  onPin?: (postId: string) => void;
  onUnpin?: (postId: string) => void;
  canManage?: boolean;
}

const REACTION_TYPES = [
  { type: 'like', label: 'Like', icon: '👍', color: '#1877f2' },
  { type: 'love', label: 'Love', icon: '❤️', color: '#e0245e' },
  { type: 'haha', label: 'Haha', icon: '😆', color: '#f7b928' },
  { type: 'wow', label: 'Wow', icon: '😮', color: '#f7b928' },
  { type: 'sad', label: 'Sad', icon: '😢', color: '#1877f2' },
  { type: 'angry', label: 'Angry', icon: '😠', color: '#f02849' },
] as const;

const Post: React.FC<PostProps> = ({ post, onPin, onUnpin, canManage }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');
  const [showMenu, setShowMenu] = React.useState(false);
  const [showReactions, setShowReactions] = React.useState(false);
  const [viewerData, setViewerData] = React.useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const [isLiking, setIsLiking] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const reactionTimerRef = React.useRef<any>(null);

  const userReaction = user ? post.reactions.find(r => r.user === user._id) : null;
  const isReacted = !!userReaction;
  const currentReaction = REACTION_TYPES.find(r => r.type === userReaction?.type) || REACTION_TYPES[0];

  const isOwner = user?._id === post.user._id;
  const isSaved = user?.savedPosts?.includes(post._id) || false;

  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(post.content);

  const [replyToCommentId, setReplyToCommentId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');

  const [showShareModal, setShowShareModal] = React.useState(false);
  const [shareText, setShareText] = React.useState('');
  const [isSharing, setIsSharing] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReact = async (type: string) => {
    setIsLiking(true);
    setShowReactions(false);
    try {
      await dispatch(reactToPost({ postId: post._id, type })).unwrap();
    } catch (error) {
      console.error('Failed to react:', error);
    }
    setIsLiking(false);
  };

  const handleLikeClick = () => {
    handleReact('like');
  };

  const handleMouseEnterReactions = () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = setTimeout(() => {
      setShowReactions(true);
    }, 500);
  };

  const handleMouseLeaveReactions = () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 500);
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

  const handleCommentLike = async (commentId: string) => {
    await dispatch(likeComment({ postId: post._id, commentId }));
  };

  const handleReplySubmit = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await dispatch(replyToComment({ postId: post._id, commentId, text: replyText.trim() }));
    setReplyText('');
    setReplyToCommentId(null);
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    
    await dispatch(createPost({ 
      content: shareText.trim(), 
      sharedPostId: post.sharedPost ? post.sharedPost._id : post._id 
    }));
    
    setShowShareModal(false);
    setShareText('');
    setIsSharing(false);
    alert('Post shared successfully!');
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
    <motion.article 
      className="post card" 
      id={`post-${post._id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      layout
    >
      {/* Post Header */}
      <div className="post-header">
        <Link to={`/profile/${post.user._id}`} className="post-user-info">
          {post.user.profilePicture ? (
            <img src={post.user.profilePicture} alt={post.user.name} className="avatar" />
          ) : (
            <div className="avatar">{getInitials(post.user.name)}</div>
          )}
          <div className="post-user-meta">
            <span className="post-user-name">
              {post.user.name}
              {post.feeling && (
                <span className="post-user-feeling">
                  {' '}is feeling <strong>{post.feeling}</strong>
                </span>
              )}
            </span>
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
              {post.isPinned && (
                <>
                  <span className="dot">•</span>
                  <span className="post-pinned-label">
                    <FiMapPin size={12} /> Pinned
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
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  className="post-menu-dropdown dropdown-card"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
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
                  {canManage && (
                    <button className="post-menu-item" onClick={() => {
                      if (post.isPinned) onUnpin?.(post._id);
                      else onPin?.(post._id);
                      setShowMenu(false);
                    }}>
                      <FiMapPin size={16} />
                      <span>{post.isPinned ? 'Unpin post' : 'Pin post'}</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="post-edit-container" style={{ padding: '0 16px', marginTop: '12px' }}>
          <textarea
            className="input-field"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEditSubmit}>Save</button>
          </div>
        </div>
      ) : (
        post.content && (
          <div className="post-content">
            <p>{linkifyContent(post.content)}</p>
          </div>
        )
      )}

      {/* Post Media */}
      {post.image && (
        <div className="post-image" onClick={() => setViewerData({ url: post.image!, type: 'image' })}>
          <img src={post.image} alt="Post" loading="lazy" />
        </div>
      )}
      {post.video && (
        <div className="post-video" onClick={() => setViewerData({ url: post.video!, type: 'video' })}>
          <video src={post.video} />
          <div className="video-play-overlay">
            <FiPlay size={48} color="white" />
          </div>
        </div>
      )}

      {/* Shared Post Preview */}
      {post.sharedPost && typeof post.sharedPost === 'object' && post.sharedPost.user && (
        <div className="shared-post-container">
          <div className="shared-post-header">
            <Link to={`/profile/${post.sharedPost.user._id}`} className="shared-post-user">
              {post.sharedPost.user.profilePicture ? (
                <img src={post.sharedPost.user.profilePicture} alt={post.sharedPost.user.name} className="avatar avatar-xs" />
              ) : (
                <div className="avatar avatar-xs">{getInitials(post.sharedPost.user.name)}</div>
              )}
              <div className="shared-post-meta">
                <span className="shared-post-author">{post.sharedPost.user.name}</span>
                <span className="shared-post-time">{formatTimeAgo(post.sharedPost.createdAt)}</span>
              </div>
            </Link>
          </div>
          <div className="shared-post-content">
            <p>{post.sharedPost.content}</p>
            {post.sharedPost.image && <img src={post.sharedPost.image} alt="Shared" className="shared-media" />}
            {post.sharedPost.video && <video src={post.sharedPost.video} controls className="shared-media" />}
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      {(post.reactions.length > 0 || post.comments.length > 0) && (
        <div className="post-stats">
          {post.reactions.length > 0 && (
            <div className="post-likes-count">
              <div className="reaction-icons-stacked">
                {Array.from(new Set(post.reactions.map(r => r.type))).slice(0, 3).map(type => (
                  <span key={type} className="reaction-icon-mini">
                    {REACTION_TYPES.find(r => r.type === type)?.icon}
                  </span>
                ))}
              </div>
              <span>{post.reactions.length}</span>
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
        <div 
          className="reaction-wrapper"
          onMouseEnter={handleMouseEnterReactions}
          onMouseLeave={handleMouseLeaveReactions}
        >
          <AnimatePresence>
            {showReactions && (
              <motion.div 
                className="reactions-popover card"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -50, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
              >
                {REACTION_TYPES.map((r, i) => (
                  <motion.button
                    key={r.type}
                    className="reaction-btn"
                    whileHover={{ scale: 1.3, y: -5 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleReact(r.type)}
                    title={r.label}
                  >
                    <span className="reaction-emoji">{r.icon}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            className={`post-action-btn ${isReacted ? 'reacted' : ''}`}
            onClick={handleLikeClick}
            disabled={isLiking}
            id={`like-btn-${post._id}`}
            style={{ color: isReacted ? currentReaction.color : 'inherit' }}
          >
            <motion.div
              animate={isReacted ? { scale: [1, 1.4, 1] } : {}}
            >
              {isReacted ? (
                <span className="current-reaction-icon">{currentReaction.icon}</span>
              ) : (
                <FiThumbsUp size={18} />
              )}
            </motion.div>
            <span>{isReacted ? currentReaction.label : 'Like'}</span>
          </motion.button>
        </div>
        <button
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
          id={`comment-btn-${post._id}`}
        >
          <FiMessageCircle size={18} />
          <span>Comment</span>
        </button>
        <button className="post-action-btn" onClick={() => setShowShareModal(true)}>
          <FiShare2 size={18} />
          <span>Share</span>
        </button>
      </div>
      <div className="post-actions-divider" />

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            className="post-comments-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
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
                <div className="comment-body" style={{ flex: 1 }}>
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
                    {(comment.likes?.length ?? 0) > 0 && (
                      <div className="comment-likes-badge">
                        <span className="like-icon-micro">👍</span>
                        {comment.likes?.length}
                      </div>
                    )}
                  </div>
                  <div className="comment-meta">
                    <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                    <button 
                      className={`comment-like-btn ${user && comment.likes?.includes(user._id) ? 'liked-text' : ''}`}
                      onClick={() => handleCommentLike(comment._id)}
                    >
                      Like
                    </button>
                    <button 
                      className="comment-reply-btn"
                      onClick={() => setReplyToCommentId(replyToCommentId === comment._id ? null : comment._id)}
                    >
                      Reply
                    </button>
                  </div>
                  
                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="replies-container" style={{ marginTop: '8px' }}>
                      {comment.replies.map(reply => (
                        <div key={reply._id} className="comment reply" style={{ marginTop: '8px' }}>
                          <Link to={`/profile/${reply.user._id}`}>
                            {reply.user.profilePicture ? (
                              <img src={reply.user.profilePicture} alt={reply.user.name} className="avatar avatar-xs" style={{ width: '24px', height: '24px' }} />
                            ) : (
                              <div className="avatar avatar-xs" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{getInitials(reply.user.name)}</div>
                            )}
                          </Link>
                          <div className="comment-body">
                            <div className="comment-bubble" style={{ padding: '6px 10px' }}>
                              <Link to={`/profile/${reply.user._id}`} className="comment-author" style={{ fontSize: '0.8rem' }}>
                                {reply.user.name}
                              </Link>
                              <p className="comment-text" style={{ fontSize: '0.85rem' }}>{reply.text}</p>
                            </div>
                            <div className="comment-meta" style={{ fontSize: '0.75rem' }}>
                              <span className="comment-time">{formatTimeAgo(reply.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyToCommentId === comment._id && (
                    <form className="comment-form reply-form" onSubmit={(e) => handleReplySubmit(e, comment._id)} style={{ marginTop: '8px' }}>
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="avatar avatar-xs" style={{ width: '24px', height: '24px' }} />
                      ) : (
                        <div className="avatar avatar-xs" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{user ? getInitials(user.name) : '?'}</div>
                      )}
                      <div className="comment-input-wrapper">
                        <input
                          type="text"
                          className="comment-input"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          autoFocus
                        />
                        {replyText.trim() && (
                          <button type="submit" className="comment-send-btn">
                            <FiSend size={14} />
                          </button>
                        )}
                      </div>
                    </form>
                  )}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
            <motion.div 
              className="modal-content card"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="modal-header">
                <h2>Share Post</h2>
                <button className="modal-close" onClick={() => setShowShareModal(false)}>&times;</button>
              </div>
              <div className="modal-body" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="avatar avatar-sm" />
                  ) : (
                    <div className="avatar avatar-sm">{user ? getInitials(user.name) : '?'}</div>
                  )}
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</span>
                </div>
                
                <textarea
                  className="input-field"
                  placeholder="Say something about this..."
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  style={{ 
                    minHeight: '80px', 
                    marginBottom: '16px', 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '1rem',
                    padding: 0
                  }}
                />
                
                <div className="shared-post-preview" style={{ 
                  padding: '12px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'var(--bg-input)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {post.user?.profilePicture ? (
                      <img src={post.user.profilePicture} alt={post.user.name} className="avatar" style={{ width: '24px', height: '24px' }} />
                    ) : (
                      <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{post.user ? getInitials(post.user.name) : '?'}</div>
                    )}
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{post.user?.name || 'User'}</strong>
                  </div>
                  
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {post.content ? (post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')) : (post.image ? 'Image Post' : (post.video ? 'Video Post' : 'Post'))}
                  </p>
                  
                  {post.image && (
                    <div style={{ marginTop: '8px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxHeight: '150px' }}>
                      <img src={post.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleShare} disabled={isSharing}>
                  {isSharing ? 'Sharing...' : 'Share Now'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {viewerData && (
        <MediaViewer 
          url={viewerData.url} 
          type={viewerData.type} 
          onClose={() => setViewerData(null)} 
        />
      )}
    </motion.article>
  );
};

export default Post;
