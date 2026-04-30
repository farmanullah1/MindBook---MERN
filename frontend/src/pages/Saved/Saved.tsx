/**
 * CodeDNA
 * Saved.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import Post from '../../components/Post/Post';
import SkeletonPost from '../../components/Post/SkeletonPost';
import api from '../../services/api';
import { IPost } from '../../types';
import { FiBookmark } from 'react-icons/fi';
import './Saved.css';

const Saved: React.FC = () => {
  const [savedPosts, setSavedPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get('/posts/user/saved');
        setSavedPosts(res.data);
      } catch (err) {
        console.error('Failed to fetch saved posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  return (
    <>
      <Navbar />
      <div className="app-layout" id="saved-posts-page">
        <LeftSidebar />
        <main className="main-content">
          <div className="feed-container">
            <div className="page-header card">
              <div className="page-header-icon">
                <FiBookmark size={24} />
              </div>
              <div className="page-header-text">
                <h1>Saved Posts</h1>
                <p>Only you can see the posts you've saved.</p>
              </div>
            </div>

            {loading ? (
              <div className="feed-loading">
                {[1, 2, 3].map(i => <SkeletonPost key={i} />)}
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="feed-empty card">
                <div className="feed-empty-content">
                  <div className="feed-empty-icon">🔖</div>
                  <h3>No saved posts yet</h3>
                  <p>Save posts to see them here.</p>
                </div>
              </div>
            ) : (
              savedPosts.map((post) => <Post key={post._id} post={post} />)
            )}
          </div>
        </main>
        <RightSidebar />
      </div>
    </>
  );
};

export default Saved;
