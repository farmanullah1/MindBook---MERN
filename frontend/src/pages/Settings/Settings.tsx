/**
 * CodeDNA
 * Settings.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState } from 'react';
import { FiUser, FiShield, FiBell, FiSun, FiMoon, FiSave, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchCurrentUser, logout } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/Toast/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import './Settings.css';

type Tab = 'general' | 'security' | 'notifications' | 'appearance';

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saving, setSaving] = useState(false);

  // General Info
  const nameParts = user?.name?.split(' ') || ['', ''];
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.location?.city || '');
  const [country, setCountry] = useState(user?.location?.country || '');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Privacy & Notification handlers
  const handleTogglePrivacy = async (key: string, value: string) => {
    try {
      await api.put('/users/settings/privacy', {
        privacySettings: { ...user?.privacySettings, [key]: value }
      });
      await dispatch(fetchCurrentUser());
      showToast('Privacy settings updated', 'success');
    } catch (err) {
      showToast('Failed to update privacy settings', 'error');
    }
  };

  const handleToggleNotification = async (key: string, value: boolean) => {
    try {
      await api.put('/users/settings/notifications', {
        notificationPreferences: { ...(user?.notificationPreferences as any), [key]: value }
      });
      await dispatch(fetchCurrentUser());
      showToast('Notification preferences updated', 'success');
    } catch (err) {
      showToast('Failed to update notification preferences', 'error');
    }
  };

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSaveGeneral = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast('First and last name are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put('/users/profile', {
        name: `${firstName.trim()} ${lastName.trim()}`,
        bio: bio.trim(),
        location: { city: city.trim(), country: country.trim() },
      });
      await dispatch(fetchCurrentUser());
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast('Please enter your password to confirm', 'error');
      return;
    }
    setDeleting(true);
    try {
      await api.delete('/users/account', { data: { password: deletePassword } });
      dispatch(logout());
      navigate('/login');
      showToast('Account deleted', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete account', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'general', label: 'General', icon: <FiUser size={20} /> },
    { key: 'security', label: 'Privacy & Security', icon: <FiShield size={20} /> },
    { key: 'notifications', label: 'Notifications', icon: <FiBell size={20} /> },
    { key: 'appearance', label: 'Appearance', icon: <FiSun size={20} /> },
  ];

  return (
    <div className="settings-page">
      <Navbar />
      <div className="settings-layout">
        <aside className="settings-sidebar">
          <h1>Settings</h1>
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`settings-nav-item ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <div className="settings-nav-icon">{tab.icon}</div>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="settings-main">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h2>General Information</h2>
                <p className="text-secondary">Update your personal details.</p>
              </div>
              <div className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="input-field" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                  <small className="form-hint">Email cannot be changed.</small>
                </div>
                <div className="form-group">
                  <label>Bio <span className="char-count">{bio.length}/150</span></label>
                  <textarea
                    className="input-field"
                    value={bio}
                    onChange={e => setBio(e.target.value.slice(0, 150))}
                    placeholder="Tell people about yourself..."
                    rows={3}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input className="input-field" value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input className="input-field" value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSaveGeneral} disabled={saving}>
                    {saving ? <><div className="spinner spinner-sm" /> Saving...</> : <><FiSave size={16} /> Save Changes</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <div className="settings-card">
                <div className="settings-card-header">
                  <h2>Privacy Settings</h2>
                  <p className="text-secondary">Manage your account privacy.</p>
                </div>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Who can message me?</label>
                    <select 
                      className="input-field"
                      value={user?.privacySettings?.whoCanMessageMe || 'Everyone'}
                      onChange={(e) => handleTogglePrivacy('whoCanMessageMe', e.target.value)}
                    >
                      <option value="Everyone">Everyone</option>
                      <option value="Friends">Friends</option>
                      <option value="No one">No one</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Who can send me friend requests?</label>
                    <select 
                      className="input-field"
                      value={user?.privacySettings?.whoCanSendFriendRequest || 'Everyone'}
                      onChange={(e) => handleTogglePrivacy('whoCanSendFriendRequest', e.target.value)}
                    >
                      <option value="Everyone">Everyone</option>
                      <option value="Friends of Friends">Friends of Friends</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <h2>Change Password</h2>
                  <p className="text-secondary">Keep your account secure.</p>
                </div>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        className="input-field"
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                      />
                      <button className="pw-toggle" onClick={() => setShowCurrentPw(!showCurrentPw)}>
                        {showCurrentPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        className="input-field"
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="New password (min 8 characters)"
                      />
                      <button className="pw-toggle" onClick={() => setShowNewPw(!showNewPw)}>
                        {showNewPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      className="input-field"
                      type="password"
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary" onClick={handleChangePassword} disabled={passwordSaving}>
                      {passwordSaving ? <><div className="spinner spinner-sm" /> Changing...</> : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-card settings-danger-zone">
                <div className="settings-card-header">
                  <h2 className="text-danger">Delete Account</h2>
                  <p className="text-secondary">Permanently delete your account and all data. This cannot be undone.</p>
                </div>
                {!showDeleteConfirm ? (
                  <div className="settings-form">
                    <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                      <FiTrash2 size={16} /> Delete My Account
                    </button>
                  </div>
                ) : (
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Enter your password to confirm</label>
                      <input
                        className="input-field"
                        type="password"
                        value={deletePassword}
                        onChange={e => setDeletePassword(e.target.value)}
                        placeholder="Your password"
                      />
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-secondary" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}>
                        Cancel
                      </button>
                      <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={deleting}>
                        {deleting ? <><div className="spinner spinner-sm" /> Deleting...</> : 'Permanently Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h2>Notification Preferences</h2>
                <p className="text-secondary">Choose what notifications you receive.</p>
              </div>
              <div className="settings-form">
                {[
                  { key: 'friendRequests', label: 'Friend Requests', desc: 'When someone sends you a friend request' },
                  { key: 'newMessages', label: 'Messages', desc: 'New message notifications' },
                  { key: 'storyReplies', label: 'Story Replies', desc: 'When someone replies to your story' },
                  { key: 'groupInvites', label: 'Group Invites', desc: 'When you are invited to a group' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="toggle-row">
                    <div className="toggle-info">
                      <span className="toggle-label">{label}</span>
                      <span className="toggle-desc">{desc}</span>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={(user?.notificationPreferences as any)?.[key] !== false} 
                        onChange={(e) => handleToggleNotification(key, e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h2>Appearance</h2>
                <p className="text-secondary">Customize how MindBook looks.</p>
              </div>
              <div className="settings-form">
                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Dark Mode</span>
                    <span className="toggle-desc">
                      {theme === 'dark' ? 'Dark mode is enabled' : 'Switch to dark theme'}
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
