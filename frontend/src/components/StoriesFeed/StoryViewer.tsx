/**
 * CodeDNA
 * StoryViewer.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { IUserStoryGroup } from '../../types';
import { getInitials, formatTimeAgo } from '../../utils/helpers';
import api from '../../services/api';
import './StoryViewer.css';

interface StoryViewerProps {
  groups: IUserStoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
  onStoryDeleted: () => void;
  currentUserId?: string;
}

const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewer: React.FC<StoryViewerProps> = ({ 
  groups, 
  initialGroupIndex, 
  onClose,
  onStoryDeleted,
  currentUserId 
}) => {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  const nextStory = () => {
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(prev => prev + 1);
      setProgress(0);
      startTimeRef.current = undefined;
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(prev => prev + 1);
      setStoryIndex(0);
      setProgress(0);
      startTimeRef.current = undefined;
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
      setProgress(0);
      startTimeRef.current = undefined;
    } else if (groupIndex > 0) {
      setGroupIndex(prev => prev - 1);
      setStoryIndex(groups[groupIndex - 1].stories.length - 1);
      setProgress(0);
      startTimeRef.current = undefined;
    }
  };

  const animate = (time: number) => {
    if (isPaused) {
      if (startTimeRef.current) {
        startTimeRef.current = time - (progress * STORY_DURATION / 100);
      }
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    
    // If it's a video, we rely on onEnded mostly, but we can still show progress
    // However, if we want it to be like Instagram, the progress bar should match video duration
    const duration = currentStory?.video ? (videoRef.current?.duration ? videoRef.current.duration * 1000 : STORY_DURATION) : STORY_DURATION;
    
    const newProgress = Math.min((elapsed / duration) * 100, 100);
    setProgress(newProgress);

    if (newProgress >= 100) {
      if (!currentStory?.video) { // Videos handle their own nextStory via onEnded
        nextStory();
      }
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    startTimeRef.current = undefined;
    setProgress(0);
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [groupIndex, storyIndex]);

  useEffect(() => {
    // Separate effect for pause logic to avoid resetting startTimeRef unnecessarily
    if (isPaused) {
      if (videoRef.current) videoRef.current.pause();
    } else {
      if (videoRef.current) videoRef.current.play().catch(() => {});
    }
  }, [isPaused]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextStory();
      if (e.key === 'ArrowLeft') prevStory();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [groupIndex, storyIndex]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this story?')) {
      try {
        await api.delete(`/stories/${currentStory._id}`);
        onStoryDeleted();
        if (currentGroup.stories.length === 1) {
          // It was the last story in the group, move to next group or close
          if (groupIndex < groups.length - 1) {
             setGroupIndex(prev => prev + 1);
             setStoryIndex(0);
             setProgress(0);
          } else if (groupIndex > 0) {
             setGroupIndex(prev => prev - 1);
             setStoryIndex(groups[groupIndex - 1].stories.length - 1);
             setProgress(0);
          } else {
             onClose();
          }
        } else {
          // Move to next story, or previous if it was the last one
          if (storyIndex < currentGroup.stories.length - 1) {
             setStoryIndex(prev => prev + 1);
             setProgress(0);
          } else {
             setStoryIndex(prev => prev - 1);
             setProgress(0);
          }
        }
      } catch (error) {
        console.error('Failed to delete story:', error);
      }
    }
  };

  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleReact = async (emoji: string) => {
    try {
      await api.post(`/stories/${currentStory._id}/react`, { emoji });
      // Visual feedback could be added here
    } catch (error) {
      console.error('Failed to react to story:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSending) return;

    setIsSending(true);
    setIsPaused(true);
    try {
      await api.post(`/stories/${currentStory._id}/reply`, { message: replyText });
      setReplyText('');
      setIsSending(false);
      setIsPaused(false);
      // Maybe show a success toast or auto-move to next story?
    } catch (error) {
      console.error('Failed to reply to story:', error);
      setIsSending(false);
      setIsPaused(false);
    }
  };

  if (!currentGroup || !currentStory) return null;

  const emojis = ['❤️', '😂', '😮', '😢', '😡', '👍'];

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer-container">
        
        {/* Progress Bars */}
        <div className="story-progress-container">
          {currentGroup.stories.map((s, idx) => (
            <div key={s._id} className="story-progress-bar">
              <div 
                className="story-progress-fill" 
                style={{ 
                  width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%',
                  transition: isPaused ? 'none' : 'width 0.1s linear'
                }} 
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-viewer-header">
          <div className="story-user-info">
            {currentGroup.user.profilePicture ? (
              <img src={currentGroup.user.profilePicture} alt={currentGroup.user.name} className="story-viewer-avatar" />
            ) : (
              <div className="story-viewer-avatar-placeholder">
                {getInitials(currentGroup.user.name)}
              </div>
            )}
            <div className="story-viewer-meta">
              <span className="story-viewer-name">{currentGroup.user.name}</span>
              <span className="story-viewer-time">{formatTimeAgo(currentStory.createdAt)}</span>
            </div>
          </div>
          <div className="story-viewer-actions">
            {currentUserId === currentGroup.user._id && (
              <button className="story-action-btn" onClick={handleDelete} title="Delete Story">
                <FiTrash2 size={20} />
              </button>
            )}
            <button className="story-close-btn" onClick={onClose}>
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="story-image-container">
          {currentStory.video ? (
            <video 
              ref={videoRef}
              src={currentStory.video} 
              className="story-viewer-img" 
              autoPlay 
              muted 
              playsInline 
              onEnded={nextStory}
              onWaiting={() => setIsPaused(true)}
              onPlaying={() => setIsPaused(false)}
            />
          ) : (
            <img src={currentStory.image} alt="Story" className="story-viewer-img" />
          )}
          
          {/* Navigation Overlay */}
          <div 
            className="story-nav-overlay"
            onPointerDown={() => setIsPaused(true)}
            onPointerUp={() => setIsPaused(false)}
            onPointerLeave={() => setIsPaused(false)}
          >
            <div className="story-nav-left" onClick={(e) => { e.stopPropagation(); prevStory(); }} />
            <div className="story-nav-right" onClick={(e) => { e.stopPropagation(); nextStory(); }} />
          </div>
        </div>

        {/* Footer - Only show if not the user's own story */}
        {currentUserId !== currentGroup.user._id && (
          <div className="story-viewer-footer" onClick={(e) => e.stopPropagation()}>
            <form className="story-reply-form" onSubmit={handleReply}>
              <input 
                type="text" 
                placeholder="Send message" 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              />
              <div className="story-reactions-quick">
                {emojis.map(emoji => (
                  <button 
                    key={emoji} 
                    type="button" 
                    className="story-emoji-btn"
                    onClick={() => handleReact(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default StoryViewer;
