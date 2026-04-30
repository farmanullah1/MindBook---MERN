/**
 * CodeDNA
 * StoriesFeed.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';
import api, { uploadFile } from '../../services/api';
import { IUserStoryGroup } from '../../types';
import { getInitials } from '../../utils/helpers';
import StoryViewer from './StoryViewer';
import './StoriesFeed.css';

const StoriesFeed: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [groupedStories, setGroupedStories] = React.useState<IUserStoryGroup[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = React.useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories');
      setGroupedStories(res.data);
    } catch (error) {
      console.error('Failed to fetch stories', error);
    }
  };

  React.useEffect(() => {
    fetchStories();
  }, []);

  const handleCreateStoryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const res = await uploadFile(e.target.files[0]);
        const storyData: any = {};
        if (res.type === 'video') {
          storyData.video = res.url;
        } else {
          storyData.image = res.url;
        }
        await api.post('/stories', storyData);
        fetchStories(); // Refresh stories
      } catch (error) {
        console.error('Failed to create story', error);
        alert('Failed to upload story');
      } finally {
        setLoading(false);
      }
    }
  };

  // Find if current user has an active story
  const currentUserGroup = groupedStories.find(g => g.user._id === user?._id);
  const otherUsersGroups = groupedStories.filter(g => g.user._id !== user?._id);

  return (
    <div className="stories-feed-container">
      <div className="stories-scroll-wrapper">
        
        {/* Create Story / Current User Story Card */}
        {currentUserGroup ? (
          <div className="story-card friend-story-card" onClick={() => setViewerGroupIndex(groupedStories.findIndex(g => g.user._id === user?._id))}>
              {currentUserGroup.stories[currentUserGroup.stories.length - 1].video ? (
                <video src={currentUserGroup.stories[currentUserGroup.stories.length - 1].video} className="story-bg-img" muted />
              ) : (
                <img src={currentUserGroup.stories[currentUserGroup.stories.length - 1].image} alt="Your Story" className="story-bg-img" />
              )}
              <div className="story-overlay">
                <div className="story-avatar">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="You" />
                  ) : (
                    <div className="avatar-initials">{user ? getInitials(user.name) : ''}</div>
                  )}
                </div>
                <div className="create-story-btn" onClick={(e) => { e.stopPropagation(); handleCreateStoryClick(); }}>
                  <FiPlus size={20} />
                </div>
                <span className="story-author">Your Story</span>
              </div>
          </div>
        ) : (
          <div className="story-card create-story-card" onClick={handleCreateStoryClick}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="You" className="story-bg-img blur-bg" />
              ) : (
                <div className="story-bg-placeholder" />
              )}
              <div className="story-overlay create-overlay">
                <div className="create-story-btn main-btn">
                  {loading ? <div className="spinner small"></div> : <FiPlus size={24} />}
                </div>
                <span className="story-author text-dark">Create Story</span>
              </div>
          </div>
        )}
        
        <input 
          type="file" 
          hidden 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*,video/*" 
          disabled={loading}
        />

        {/* Friends' Stories */}
        {otherUsersGroups.map((group) => {
          const groupIdx = groupedStories.findIndex(g => g.user._id === group.user._id);
          const latestStory = group.stories[group.stories.length - 1];
          return (
            <div key={group.user._id} className="story-card friend-story-card" onClick={() => setViewerGroupIndex(groupIdx)}>
              {latestStory.video ? (
                <video src={latestStory.video} className="story-bg-img" muted />
              ) : (
                <img src={latestStory.image} alt={`${group.user.name}'s story`} className="story-bg-img" />
              )}
              <div className="story-overlay">
                <div className="story-avatar has-story">
                  {group.user.profilePicture ? (
                    <img src={group.user.profilePicture} alt={group.user.name} />
                  ) : (
                    <div className="avatar-initials">{getInitials(group.user.name)}</div>
                  )}
                </div>
                <span className="story-author">{group.user.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {viewerGroupIndex !== null && (
        <StoryViewer
          groups={groupedStories}
          initialGroupIndex={viewerGroupIndex}
          onClose={() => setViewerGroupIndex(null)}
          onStoryDeleted={fetchStories}
          currentUserId={user?._id}
        />
      )}
    </div>
  );
};

export default StoriesFeed;
