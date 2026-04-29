import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchFeedPosts } from '../../store/slices/postsSlice';
import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import StoriesFeed from '../../components/StoriesFeed/StoriesFeed';
import CreatePost from '../../components/CreatePost/CreatePost';
import Post from '../../components/Post/Post';
import './Home.css';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { posts, loading, currentPage, totalPages } = useAppSelector((state) => state.posts);

  React.useEffect(() => {
    dispatch(fetchFeedPosts(1));
  }, [dispatch]);

  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchFeedPosts(1));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <div className="app-layout" id="home-page">
        <LeftSidebar />
        <main className="main-content">
          <div className="feed-container">
            <StoriesFeed />
            <CreatePost />

            {loading && posts.length === 0 ? (
              <div className="feed-loading">
                <div className="skeleton-post">
                  <div className="skeleton-header">
                    <div className="skeleton skeleton-avatar" />
                    <div className="skeleton-meta">
                      <div className="skeleton skeleton-name" />
                      <div className="skeleton skeleton-time" />
                    </div>
                  </div>
                  <div className="skeleton skeleton-content" />
                  <div className="skeleton skeleton-content short" />
                </div>
                <div className="skeleton-post">
                  <div className="skeleton-header">
                    <div className="skeleton skeleton-avatar" />
                    <div className="skeleton-meta">
                      <div className="skeleton skeleton-name" />
                      <div className="skeleton skeleton-time" />
                    </div>
                  </div>
                  <div className="skeleton skeleton-content" />
                  <div className="skeleton skeleton-image" />
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="feed-empty card">
                <div className="feed-empty-content">
                  <div className="feed-empty-icon">📝</div>
                  <h3>No posts yet</h3>
                  <p>When you or your friends create posts, they'll appear here.</p>
                </div>
              </div>
            ) : (
              <>
                {posts.map((post) => <Post key={post._id} post={post} />)}
                {posts.length > 0 && currentPage < totalPages && (
                  <div className="load-more-container">
                    <button 
                      className="btn btn-secondary btn-full" 
                      onClick={() => dispatch(fetchFeedPosts(currentPage + 1))}
                      disabled={loading}
                    >
                      {loading ? <div className="spinner small" /> : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <RightSidebar />
      </div>
    </>
  );
};

export default Home;
