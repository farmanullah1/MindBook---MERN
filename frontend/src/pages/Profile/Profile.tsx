import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiBriefcase, FiCalendar, FiEdit3, FiUserPlus, FiUserCheck, FiClock, FiMessageSquare } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUserPosts, clearUserPosts } from '../../store/slices/postsSlice';
import { updateUserInState } from '../../store/slices/authSlice';
import api from '../../services/api';
import { IUser } from '../../types';
import { getInitials, formatDate } from '../../utils/helpers';
import { uploadImage } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import CreatePost from '../../components/CreatePost/CreatePost';
import Post from '../../components/Post/Post';
import EditProfileModal from '../../components/EditProfileModal/EditProfileModal';
import './Profile.css';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { userPosts, loading } = useAppSelector((state) => state.posts);

  const [profileUser, setProfileUser] = React.useState<IUser | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [editingBio, setEditingBio] = React.useState(false);
  const [bioText, setBioText] = React.useState('');
  const [friendStatus, setFriendStatus] = React.useState<'none' | 'friends' | 'pending' | 'requested'>('none');
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [mutualFriends, setMutualFriends] = React.useState<IUser[]>([]);
  
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser?._id === id;

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setProfileLoading(true);
      try {
        const res = await api.get(`/users/${id}`);
        setProfileUser(res.data);
        setBioText(res.data.bio || '');

        if (currentUser) {
          if (res.data.friends?.some((f: IUser) => f._id === currentUser._id)) {
            setFriendStatus('friends');
          } else if (currentUser.sentFriendRequests?.some((f: any) => (f._id || f) === id)) {
            setFriendStatus('pending');
          } else if (currentUser.friendRequests?.some((f: any) => (f._id || f) === id)) {
            setFriendStatus('requested');
          } else {
            setFriendStatus('none');
          }

          if (id !== currentUser._id) {
            try {
              const mutualRes = await api.get(`/users/${id}/mutual-friends`);
              setMutualFriends(mutualRes.data);
            } catch (err) {
              console.error('Failed to fetch mutual friends', err);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
      setProfileLoading(false);
    };

    fetchProfile();
    dispatch(fetchUserPosts(id!));

    return () => {
      dispatch(clearUserPosts());
    };
  }, [id, dispatch, currentUser]);

  const handleSaveBio = async () => {
    try {
      await api.put(`/users/${currentUser?._id}`, { bio: bioText });
      setProfileUser((prev) => prev ? { ...prev, bio: bioText } : prev);
      dispatch(updateUserInState({ bio: bioText }));
      setEditingBio(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
    }
  };

  const handleFriendAction = async () => {
    if (!id) return;
    try {
      if (friendStatus === 'none') {
        await api.post('/users/friend-request', { friendId: id });
        setFriendStatus('pending');
      } else if (friendStatus === 'requested') {
        await api.post('/users/friend-request/accept', { friendId: id });
        setFriendStatus('friends');
      } else if (friendStatus === 'friends') {
        await api.post('/users/unfriend', { friendId: id });
        setFriendStatus('none');
      }
    } catch (error) {
      console.error('Friend action failed:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'coverPicture' | 'profilePicture') => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImage(e.target.files[0]);
        await api.put(`/users/profile`, { [type]: url });
        setProfileUser((prev) => prev ? { ...prev, [type]: url } : prev);
        dispatch(updateUserInState({ [type]: url }));
      } catch (error) {
        console.error('Failed to update image:', error);
      }
    }
  };

  const handleRemoveImage = async (type: 'coverPicture' | 'profilePicture') => {
    if (window.confirm(`Are you sure you want to remove your ${type === 'coverPicture' ? 'cover' : 'profile'} photo?`)) {
      try {
        await api.put(`/users/profile`, { [type]: '' });
        setProfileUser((prev) => prev ? { ...prev, [type]: '' } : prev);
        dispatch(updateUserInState({ [type]: '' }));
      } catch (error) {
        console.error('Failed to remove image:', error);
      }
    }
  };

  if (profileLoading) {
    return (
      <>
        <Navbar />
        <div className="profile-page" style={{ paddingTop: 'calc(var(--navbar-height) + 16px)' }}>
          <div className="profile-loading">
            <div className="spinner" />
          </div>
        </div>
      </>
    );
  }

  if (!profileUser) {
    return (
      <>
        <Navbar />
        <div className="profile-page" style={{ paddingTop: 'calc(var(--navbar-height) + 16px)' }}>
          <div className="profile-not-found">
            <h2>User not found</h2>
            <Link to="/" className="btn btn-primary">Go Home</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page" id="profile-page">
        {/* Cover & Header */}
        <div className="profile-header-wrapper">
          <div className="profile-cover">
            {profileUser.coverPicture ? (
              <img src={profileUser.coverPicture} alt="Cover" className="cover-image" />
            ) : (
              <div className="cover-placeholder" />
            )}
            {isOwnProfile && (
              <div className="cover-edit-actions" style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                {profileUser.coverPicture && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleRemoveImage('coverPicture')}>
                    Remove Cover
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => coverInputRef.current?.click()}>
                  <FiEdit3 size={16} /> Edit Cover
                </button>
                <input type="file" hidden ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'coverPicture')} accept="image/*" />
              </div>
            )}
          </div>

          <div className="profile-header-inner">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                {profileUser.profilePicture ? (
                  <img src={profileUser.profilePicture} alt={profileUser.name} className="avatar avatar-xl" />
                ) : (
                  <div className="avatar avatar-xl">{getInitials(profileUser.name)}</div>
                )}
                {isOwnProfile && (
                  <div className="avatar-edit-actions" style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', opacity: 0, transition: 'opacity 0.2s', width: 'max-content' }}>
                    <button className="edit-avatar-btn" style={{ position: 'static' }} onClick={() => avatarInputRef.current?.click()}>
                      <FiEdit3 size={14} />
                    </button>
                    {profileUser.profilePicture && (
                      <button className="edit-avatar-btn" style={{ position: 'static' }} onClick={() => handleRemoveImage('profilePicture')}>
                        <span style={{ fontSize: '10px' }}>Remove</span>
                      </button>
                    )}
                    <input type="file" hidden ref={avatarInputRef} onChange={(e) => handleImageUpload(e, 'profilePicture')} accept="image/*" />
                  </div>
                )}
              </div>
            </div>

            <div className="profile-info-section">
              <h1 className="profile-name">{profileUser.name}</h1>
              <p className="profile-friends-count">
                {profileUser.friends?.length || 0} {profileUser.friends?.length === 1 ? 'friend' : 'friends'}
              </p>
              {profileUser.friends && profileUser.friends.length > 0 && (
                <div className="profile-friends-avatars">
                  {profileUser.friends.slice(0, 8).map((friend: any) => (
                    <Link key={friend._id} to={`/profile/${friend._id}`} className="friend-mini-avatar" title={friend.name}>
                      {friend.profilePicture ? (
                        <img src={friend.profilePicture} alt={friend.name} />
                      ) : (
                        <div className="mini-avatar-initials">{getInitials(friend.name)}</div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="profile-action-section">
              {isOwnProfile ? (
                <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
                  <FiEdit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <Link to="/messages" className="btn btn-secondary" style={{ marginRight: '8px' }}>
                    <FiMessageSquare size={16} /> Message
                  </Link>
                  <button
                    className={`btn ${friendStatus === 'friends' ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleFriendAction}
                    id="friend-action-btn"
                  >
                    {friendStatus === 'none' && <><FiUserPlus size={16} /> Add Friend</>}
                    {friendStatus === 'pending' && <><FiClock size={16} /> Request Sent</>}
                    {friendStatus === 'requested' && <><FiUserPlus size={16} /> Accept Request</>}
                    {friendStatus === 'friends' && <><FiUserCheck size={16} /> Friends</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Body */}
        <div className="profile-body">
          {/* Left Column */}
          <div className="profile-left-col">
            {/* Intro Card */}
            <div className="card profile-intro-card">
              <h3 className="card-title">Intro</h3>

              {editingBio ? (
                <div className="bio-edit">
                  <textarea
                    className="bio-textarea"
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Describe who you are..."
                    maxLength={200}
                    id="bio-textarea"
                  />
                  <div className="bio-edit-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingBio(false)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveBio}>Save</button>
                  </div>
                </div>
              ) : (
                profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>
              )}

              {!editingBio && isOwnProfile && !profileUser.bio && (
                <button className="btn btn-secondary btn-full" onClick={() => setEditingBio(true)}>
                  Add bio
                </button>
              )}

              <div className="profile-details">
                {profileUser.work && profileUser.work.length > 0 && (
                  <div className="profile-detail-item">
                    <FiBriefcase size={18} className="detail-icon" />
                    <span>Works at <strong>{profileUser.work[0].company}</strong> as {profileUser.work[0].title}</span>
                  </div>
                )}
                {profileUser.education && profileUser.education.length > 0 && (
                  <div className="profile-detail-item">
                    <FiBriefcase size={18} className="detail-icon" />
                    <span>Studied at <strong>{profileUser.education[0].school}</strong></span>
                  </div>
                )}
                {profileUser.location && profileUser.location.city && (
                  <div className="profile-detail-item">
                    <FiMapPin size={18} className="detail-icon" />
                    <span>Lives in <strong>{profileUser.location.city}{profileUser.location.country ? `, ${profileUser.location.country}` : ''}</strong></span>
                  </div>
                )}
                <div className="profile-detail-item">
                  <FiCalendar size={18} className="detail-icon" />
                  <span>Joined {formatDate(profileUser.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Friends Card */}
            <div className="card profile-friends-card">
              <h3 className="card-title">
                Friends
                <span className="friends-count-badge">{profileUser.friends?.length || 0}</span>
              </h3>
              {!isOwnProfile && mutualFriends.length > 0 && (
                <p className="text-secondary" style={{ marginBottom: '12px', fontSize: '14px' }}>
                  {mutualFriends.length} Mutual Friends
                </p>
              )}
              {profileUser.friends && profileUser.friends.length > 0 ? (
                <div className="friends-grid">
                  {profileUser.friends.slice(0, 9).map((friend: any) => (
                    <Link key={friend._id} to={`/profile/${friend._id}`} className="friend-grid-item">
                      {friend.profilePicture ? (
                        <img src={friend.profilePicture} alt={friend.name} className="friend-grid-avatar" />
                      ) : (
                        <div className="friend-grid-avatar friend-grid-initials">
                          {getInitials(friend.name)}
                        </div>
                      )}
                      <span className="friend-grid-name">{friend.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-secondary">No friends yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Posts */}
          <div className="profile-right-col">
            {isOwnProfile && <CreatePost />}

            {loading && userPosts.length === 0 ? (
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
                </div>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <p className="text-secondary">No posts yet</p>
              </div>
            ) : (
              userPosts.map((post) => <Post key={post._id} post={post} />)
            )}
          </div>
        </div>
      </div>

      {showEditModal && profileUser && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedUser) => setProfileUser(updatedUser)}
        />
      )}
    </>
  );
};

export default Profile;
