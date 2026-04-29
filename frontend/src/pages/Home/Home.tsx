import React from 'react';
import { useInView } from 'react-intersection-observer';
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
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  });

  React.useEffect(() => {
    dispatch(fetchFeedPosts(1));
  }, [dispatch]);

  // Load more when reaching bottom
  React.useEffect(() => {
    if (inView && !loading && currentPage < totalPages) {
      dispatch(fetchFeedPosts(currentPage + 1));
    }
  }, [inView, loading, currentPage, totalPages, dispatch]);

  return (
    <>
      <Navbar />
      <div className="app-layout" id="home-page">
        <LeftSidebar />
        <main className="main-content">
          <div className="feed-container">
            <StoriesFeed />
            <CreatePost />

            {posts.length === 0 && loading ? (
              <div className="feed-loading">
                {/* Skeleton placeholders */}
                {[1, 2].map(i => (
                  <div key={i} className="skeleton-post">
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
                ))}
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
                
                {/* Infinite Scroll Trigger */}
                <div ref={ref} className="infinite-scroll-trigger">
                  {loading && currentPage < totalPages && (
                    <div className="load-more-spinner">
                      <div className="spinner small" />
                    </div>
                  )}
                </div>
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
