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
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(prev => prev + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      setGroupIndex(prev => prev - 1);
      setStoryIndex(groups[groupIndex - 1].stories.length - 1);
      setProgress(0);
    }
  };

  const animate = (time: number) => {
    if (isPaused) {
      startTimeRef.current = time - (progress * STORY_DURATION / 100);
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    
    const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
    setProgress(newProgress);

    if (newProgress >= 100) {
      nextStory();
      startTimeRef.current = undefined; // Reset for next story
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    startTimeRef.current = undefined;
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [groupIndex, storyIndex, isPaused]);

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
             nextStory();
          } else {
             prevStory();
          }
        }
      } catch (error) {
        console.error('Failed to delete story:', error);
      }
    }
  };

  if (!currentGroup || !currentStory) return null;

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
          <button className="story-close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Image */}
        <div className="story-image-container">
          <img src={currentStory.image} alt="Story" className="story-viewer-img" />
          
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

          {currentUserId === currentGroup.user._id && (
            <button className="story-delete-btn" onClick={handleDelete} title="Delete Story">
              <FiTrash2 size={20} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default StoryViewer;
