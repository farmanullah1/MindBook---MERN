import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  FiGlobe, FiLock, FiSettings, FiPlus, FiMoreHorizontal, 
  FiInfo, FiUsers, FiImage, FiGrid, FiUserPlus 
} from 'react-icons/fi';
import api from '../../services/api';
import { IGroup, IPost } from '../../types';
import Post from '../../components/Post/Post';
import CreatePost from '../../components/CreatePost/CreatePost';
import EditGroupModal from './EditGroupModal';
import './GroupPage.css';

const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [group, setGroup] = useState<IGroup | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<IPost[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchGroupData = async () => {
    try {
      const groupRes = await api.get(`/groups/${id}`);
      setGroup(groupRes.data);
      setIsEditModalOpen(false);
      
      const feedRes = await api.get(`/groups/${id}/feed`);
      setPosts(feedRes.data.posts);
      setPinnedPosts(feedRes.data.pinnedPosts);

      const mediaRes = await api.get(`/groups/${id}/media`);
      setMedia(mediaRes.data);
    } catch (error) {
      console.error('Failed to fetch group data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  useEffect(() => {
    // Determine tab from path if we had sub-routes, otherwise use simple state
    const path = location.pathname.split('/').pop();
    if (path === 'about') setActiveTab('about');
    else if (path === 'members') setActiveTab('members');
    else if (path === 'media') setActiveTab('media');
    else if (path === 'manage') setActiveTab('manage');
    else setActiveTab('home');
  }, [location]);

  const handleRequestAction = async (userId: string, action: 'approve' | 'decline') => {
    try {
      await api.post(`/groups/${group?._id}/${action}`, { userId });
      fetchGroupData();
    } catch (error) {
      console.error(`${action} failed`, error);
    }
  };

  const handleMemberAction = async (userId: string, action: string) => {
    try {
      await api.post(`/groups/${group?._id}/manage-member`, { userId, action });
      fetchGroupData();
    } catch (error) {
      console.error(`${action} failed`, error);
    }
  };

  const handlePin = async (postId: string) => {
    try {
      await api.post(`/groups/${group?._id}/pin`, { postId });
      fetchGroupData();
    } catch (error) {
      console.error('Pin failed', error);
    }
  };

  const handleUnpin = async (postId: string) => {
    try {
      await api.post(`/groups/${group?._id}/unpin`, { postId });
      fetchGroupData();
    } catch (error) {
      console.error('Unpin failed', error);
    }
  };

  const handleJoinLeave = async () => {
    if (!group) return;
    try {
      if (group.isMember) {
        if (window.confirm('Are you sure you want to leave this group?')) {
          await api.post(`/groups/${group._id}/leave`);
          fetchGroupData();
        }
      } else if (group.isPending) {
        // Cancel request? (Optional for MVP)
      } else {
        await api.post(`/groups/${group._id}/join`);
        fetchGroupData();
      }
    } catch (error) {
      console.error('Action failed', error);
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!group) return <div className="error-message">Group not found</div>;

  return (
    <div className="group-page-wrapper">
      {/* Header Section */}
      <div className="group-header">
        <div className="group-cover-container">
          <img src={group.coverPhoto || 'https://via.placeholder.com/1200x400'} alt={group.name} className="group-cover-full" />
          {group.isAdmin && (
            <button className="edit-cover-btn" onClick={() => setIsEditModalOpen(true)}>
              <FiImage /> Edit Cover Photo
            </button>
          )}
        </div>
        
        <div className="group-header-info">
          <div className="header-main">
            <div className="info-text">
              <h1>{group.name}</h1>
              <div className="meta">
                <span className="privacy">
                  {group.privacy === 'public' ? <FiGlobe /> : <FiLock />}
                  {group.privacy === 'public' ? 'Public' : 'Private'} Group
                </span>
                <span className="dot">•</span>
                <span className="count"><b>{group.members.length}</b> members</span>
              </div>
            </div>
            
            <div className="header-actions">
              <button className={`action-btn ${group.isMember ? 'joined' : 'join'}`} onClick={handleJoinLeave}>
                {group.isMember ? (
                  <>Joined <FiSettings size={14} /></>
                ) : group.isPending ? (
                  'Request Pending'
                ) : (
                  <><FiUserPlus /> Join Group</>
                )}
              </button>
              <button className="action-btn invite">
                <FiPlus /> Invite
              </button>
              <button className="action-btn more">
                <FiMoreHorizontal />
              </button>
            </div>
          </div>
          
          <nav className="group-tabs">
            <Link to={`/groups/${group._id}`} className={`tab ${activeTab === 'home' ? 'active' : ''}`}>Home</Link>
            <Link to={`/groups/${group._id}/about`} className={`tab ${activeTab === 'about' ? 'active' : ''}`}>About</Link>
            <Link to={`/groups/${group._id}/members`} className={`tab ${activeTab === 'members' ? 'active' : ''}`}>Members</Link>
            <Link to={`/groups/${group._id}/media`} className={`tab ${activeTab === 'media' ? 'active' : ''}`}>Media</Link>
            {(group.isAdmin || group.isModerator) && (
              <Link to={`/groups/${group._id}/manage`} className={`tab ${activeTab === 'manage' ? 'active' : ''}`}>Manage</Link>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="group-body">
        <div className="group-main-content">
          {activeTab === 'home' && (
            <>
              {group.isMember ? (
                <CreatePost 
                  groupId={group._id} 
                  onPostCreated={fetchGroupData} 
                  placeholder={`Write something to ${group.name}...`}
                />
              ) : group.privacy === 'public' ? (
                <div className="join-prompt">
                  <FiUsers size={24} />
                  <span>You are viewing this public group. Join to participate.</span>
                  <button onClick={handleJoinLeave}>Join Group</button>
                </div>
              ) : (
                <div className="private-prompt">
                  <FiLock size={48} />
                  <h2>This Group is Private</h2>
                  <p>Join this group to see its posts and participate in the community.</p>
                  <button onClick={handleJoinLeave}>
                    {group.isPending ? 'Request Pending' : 'Join Group'}
                  </button>
                </div>
              )}

              {/* Pinned Posts */}
              {pinnedPosts.length > 0 && (
                <div className="pinned-section">
                  <h3 className="section-title">Pinned Posts</h3>
                  {pinnedPosts.map(post => (
                    <Post 
                      key={post._id} 
                      post={post} 
                      onUnpin={handleUnpin} 
                      canManage={group.isAdmin || group.isModerator} 
                    />
                  ))}
                </div>
              )}

              {/* Feed */}
              {(group.isMember || group.privacy === 'public') && (
                <div className="group-feed">
                  {posts.map(post => (
                    <Post 
                      key={post._id} 
                      post={post} 
                      onPin={handlePin} 
                      canManage={group.isAdmin || group.isModerator} 
                    />
                  ))}
                  {posts.length === 0 && (
                    <div className="empty-feed">
                      <FiGrid size={48} />
                      <p>No posts yet. Be the first to share something!</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'about' && (
            <div className="group-about-section card">
              <h3>About this group</h3>
              <p className="description">{group.description || 'No description provided.'}</p>
              
              <hr />
              
              <div className="info-list">
                <div className="info-item">
                  <FiLock />
                  <div>
                    <strong>Private</strong>
                    <span>Only members can see who's in the group and what they post.</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiGlobe />
                  <div>
                    <strong>Visible</strong>
                    <span>Anyone can find this group.</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiUsers />
                  <div>
                    <strong>{group.members.length} members</strong>
                    <span>Created on {new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="group-members-section card">
              <h3>Members • {group.members.length}</h3>
              <div className="members-list">
                {group.members.map(member => (
                  <div key={member._id} className="member-item">
                    <img src={member.profilePicture || 'https://via.placeholder.com/40'} alt={member.name} />
                    <div className="member-info">
                      <span className="name">{member.name}</span>
                      <div className="roles">
                        {group.admins.some(a => a._id === member._id) && <span className="role admin">Admin</span>}
                        {group.moderators.some(m => m._id === member._id) && <span className="role mod">Moderator</span>}
                      </div>
                    </div>
                    {group.isAdmin && member._id !== group.creator._id && member._id !== group.members.find(m => m._id === group.creator._id)?._id && (
                      <div className="member-actions">
                        {!group.admins.some(a => a._id === member._id) && (
                          <button onClick={() => handleMemberAction(member._id, 'promote-admin')} title="Make Admin">Admin</button>
                        )}
                        {!group.moderators.some(m => m._id === member._id) && !group.admins.some(a => a._id === member._id) && (
                          <button onClick={() => handleMemberAction(member._id, 'promote-mod')} title="Make Moderator">Mod</button>
                        )}
                        {(group.admins.some(a => a._id === member._id) || group.moderators.some(m => m._id === member._id)) && (
                          <button onClick={() => handleMemberAction(member._id, 'demote')} title="Demote to Member">Demote</button>
                        )}
                        <button className="remove" onClick={() => handleMemberAction(member._id, 'remove')} title="Remove from Group">Remove</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="group-media-section card">
              <h3>Media</h3>
              <div className="group-media-grid">
                {media.map((item) => (
                  <div key={item._id} className="media-item-box">
                    {item.mediaType === 'image' ? (
                      <img src={item.mediaUrl} alt="Group content" />
                    ) : (
                      <video src={item.mediaUrl} controls />
                    )}
                  </div>
                ))}
                {media.length === 0 && <p className="empty-text">No media shared in this group yet.</p>}
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="group-manage-section card">
              <h3>Join Requests</h3>
              <div className="requests-list">
                {group.joinRequests.map(request => (
                  <div key={request.user._id} className="request-item">
                    <img src={request.user.profilePicture || 'https://via.placeholder.com/40'} alt={request.user.name} />
                    <div className="request-info">
                      <span className="name">{request.user.name}</span>
                      <span className="time">Requested {new Date(request.requestedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="request-actions">
                      <button className="approve-btn" onClick={() => handleRequestAction(request.user._id, 'approve')}>Approve</button>
                      <button className="decline-btn" onClick={() => handleRequestAction(request.user._id, 'decline')}>Decline</button>
                    </div>
                  </div>
                ))}
                {group.joinRequests.length === 0 && (
                  <p className="empty-text">No pending join requests.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="group-sidebar-content">
          <div className="about-mini card">
            <h3>About</h3>
            <p>{group.description?.substring(0, 150)}{group.description && group.description.length > 150 ? '...' : ''}</p>
            <div className="mini-meta">
              <FiLock /> Private
              <br />
              <FiGlobe /> Visible
            </div>
            <Link to={`/groups/${group._id}/about`} className="learn-more">Learn More</Link>
          </div>
          
          <div className="group-rules card">
            <h3>Group Rules</h3>
            <ol className="rules-list">
              {group.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
              {group.rules.length === 0 && (
                <>
                  <li>Be kind and courteous.</li>
                  <li>No hate speech or bullying.</li>
                  <li>No promotions or spam.</li>
                </>
              )}
            </ol>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditGroupModal 
          group={group} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdated={fetchGroupData} 
        />
      )}
    </div>
  );
};

export default GroupPage;
