/**
 * CodeDNA
 * GroupDetails.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiLock, FiGlobe, FiLogOut, FiUserPlus } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import CreatePost from '../../components/CreatePost/CreatePost';
import Post from '../../components/Post/Post';
import { useAppSelector } from '../../store/hooks';
import api from '../../services/api';
import { IGroup, IPost } from '../../types';
import './GroupDetails.css';

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [group, setGroup] = React.useState<IGroup | null>(null);
  const [posts, setPosts] = React.useState<IPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const fetchGroupData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const groupRes = await api.get(`/groups/${id}`);
      setGroup(groupRes.data);
      
      const isMember = groupRes.data.members.some((m: any) => m._id === user?._id);
      if (isMember || groupRes.data.privacy === 'public') {
        const postsRes = await api.get(`/groups/${id}/posts`);
        setPosts(postsRes.data);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        // Private group, not a member
        setError('Private group. You must join to see its content.');
        // Still fetch basic info if we can, but our API currently blocks the whole object.
        // For MVP, we'll just show the error.
      } else {
        setError('Group not found');
      }
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchGroupData();
  }, [id]);

  const handleJoinLeave = async () => {
    if (!id || !group) return;
    try {
      const isMember = group.members.some(m => m._id === user?._id);
      if (isMember) {
        if (window.confirm('Are you sure you want to leave this group?')) {
          await api.post(`/groups/${id}/leave`);
          fetchGroupData();
        }
      } else {
        await api.post(`/groups/${id}/join`);
        fetchGroupData();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const isMember = group?.members.some(m => m._id === user?._id);
  const isAdmin = group?.admin._id === user?._id;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="home-layout"><div className="feed-loading"><div className="spinner"></div></div></div>
      </>
    );
  }

  if (error && !group) {
    return (
      <>
        <Navbar />
        <div className="home-layout">
          <div className="card text-center" style={{ margin: 'var(--space-4)', padding: 'var(--space-6)' }}>
            <h2>{error}</h2>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/groups')}>Back to Groups</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="home-layout">
        <LeftSidebar />
        <main className="main-content group-details-main">
          {group && (
            <div className="group-header-card">
              <div className="group-cover-large">
                {group.coverPhoto ? (
                  <img src={group.coverPhoto} alt={group.name} />
                ) : (
                  <div className="group-cover-placeholder-large"><FiUsers size={64} /></div>
                )}
              </div>
              
              <div className="group-header-info">
                <div className="group-title-section">
                  <h1>{group.name}</h1>
                  <p className="group-meta-large">
                    {group.privacy === 'public' ? <FiGlobe /> : <FiLock />} {group.privacy} group · {group.members.length} members
                  </p>
                </div>
                
                <div className="group-actions">
                  {isMember ? (
                    <button className="btn btn-secondary" onClick={handleJoinLeave}>
                      <FiLogOut /> Joined
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={handleJoinLeave}>
                      <FiUserPlus /> Join Group
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="group-content-layout">
            <div className="group-left-col">
              <div className="card group-about-card">
                <h3>About</h3>
                <p>{group?.description}</p>
                <div className="admin-info mt-4">
                  <strong>Admin:</strong> {group?.admin.name}
                </div>
              </div>
            </div>

            <div className="group-right-col">
              {error ? (
                <div className="card text-center" style={{ padding: '40px' }}>
                  <FiLock size={48} className="text-secondary mb-4" />
                  <h3>Private Group</h3>
                  <p className="text-secondary">Join this group to view or create posts.</p>
                </div>
              ) : (
                <>
                  {isMember && <CreatePost groupId={id} onPostCreated={(newPost) => setPosts([newPost, ...posts])} />}
                  
                  <div className="group-posts">
                    {posts.length === 0 ? (
                      <div className="card text-center" style={{ padding: '40px' }}>
                        <p className="text-secondary">No posts in this group yet.</p>
                      </div>
                    ) : (
                      posts.map(post => <Post key={post._id} post={post} />)
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default GroupDetails;
