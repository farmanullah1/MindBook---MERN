/**
 * CodeDNA
 * EditProfileModal.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { IUser } from '../../types';
import api from '../../services/api';
import { useAppDispatch } from '../../store/hooks';
import { updateUserInState, logout } from '../../store/slices/authSlice';
import './EditProfileModal.css';

interface EditProfileModalProps {
  user: IUser;
  onClose: () => void;
  onUpdate: (updatedUser: IUser) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = React.useState<'basic' | 'work' | 'security'>('basic');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  // Basic Info State
  const [name, setName] = React.useState(user.name);
  const [bio, setBio] = React.useState(user.bio || '');
  const [city, setCity] = React.useState(user.location?.city || '');
  const [country, setCountry] = React.useState(user.location?.country || '');
  const [hometown, setHometown] = React.useState(user.hometown || '');
  const [relationshipStatus, setRelationshipStatus] = React.useState(user.relationshipStatus || '');
  const [website, setWebsite] = React.useState(user.website || '');
  const [birthdate, setBirthdate] = React.useState(user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '');

  // Work & Education State
  const [work, setWork] = React.useState(user.work || []);
  const [education, setEducation] = React.useState(user.education || []);

  // Security State
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleSaveBasic = async () => {
    setLoading(true);
    try {
      const res = await api.put('/users/profile', {
        name,
        bio,
        location: { city, country },
        hometown,
        relationshipStatus,
        website,
        birthdate
      });
      onUpdate(res.data);
      dispatch(updateUserInState({ name, bio, location: { city, country }, hometown, relationshipStatus, website, birthdate }));
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error updating profile');
    }
    setLoading(false);
  };

  const handleSaveWorkEducation = async () => {
    setLoading(true);
    try {
      const res = await api.put('/users/profile', {
        work,
        education
      });
      onUpdate(res.data);
      dispatch(updateUserInState({ work, education }));
      setMessage('Work & Education updated successfully');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error updating work & education');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error changing password');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/users/account');
        dispatch(logout());
      } catch (err: any) {
        setMessage(err.response?.data?.message || 'Error deleting account');
      }
    }
  };

  const addWork = () => setWork([...work, { title: '', company: '', startYear: new Date().getFullYear() }]);
  const removeWork = (index: number) => setWork(work.filter((_, i) => i !== index));
  const updateWork = (index: number, field: string, value: any) => {
    const newWork = [...work];
    newWork[index] = { ...newWork[index], [field]: value };
    setWork(newWork);
  };

  const addEducation = () => setEducation([...education, { school: '', degree: '', year: new Date().getFullYear() }]);
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));
  const updateEducation = (index: number, field: string, value: any) => {
    const newEd = [...education];
    newEd[index] = { ...newEd[index], [field]: value };
    setEducation(newEd);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}><FiX size={24} /></button>
        </div>
        
        <div className="modal-tabs">
          <button className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>Basic Info</button>
          <button className={`tab-btn ${activeTab === 'work' ? 'active' : ''}`} onClick={() => setActiveTab('work')}>Work & Education</button>
          <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security</button>
        </div>

        <div className="modal-body">
          {message && <div className="modal-message">{message}</div>}

          {activeTab === 'basic' && (
            <div className="tab-content">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Bio (max 150 chars)</label>
                <textarea className="input-field" maxLength={150} value={bio} onChange={e => setBio(e.target.value)} rows={3} />
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" className="input-field" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" className="input-field" value={country} onChange={e => setCountry(e.target.value)} />
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label>Hometown</label>
                  <input type="text" className="input-field" value={hometown} onChange={e => setHometown(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Relationship Status</label>
                  <select className="input-field" value={relationshipStatus} onChange={e => setRelationshipStatus(e.target.value)}>
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="In a relationship">In a relationship</option>
                    <option value="Engaged">Engaged</option>
                    <option value="Married">Married</option>
                    <option value="It's complicated">It's complicated</option>
                    <option value="In an open relationship">In an open relationship</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label>Website</label>
                  <input type="url" className="input-field" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" />
                </div>
                <div className="form-group">
                  <label>Birthdate</label>
                  <input type="date" className="input-field" value={birthdate} onChange={e => setBirthdate(e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleSaveBasic} disabled={loading}>Save Basic Info</button>
            </div>
          )}

          {activeTab === 'work' && (
            <div className="tab-content">
              <h3>Work Experience</h3>
              {work.map((w, index) => (
                <div key={index} className="array-item-card">
                  <button className="remove-item-btn" onClick={() => removeWork(index)}><FiTrash2 /></button>
                  <input type="text" placeholder="Job Title" className="input-field mb-2" value={w.title} onChange={e => updateWork(index, 'title', e.target.value)} />
                  <input type="text" placeholder="Company" className="input-field mb-2" value={w.company} onChange={e => updateWork(index, 'company', e.target.value)} />
                  <div className="form-group-row">
                    <input type="number" placeholder="Start Year" className="input-field" value={w.startYear || ''} onChange={e => updateWork(index, 'startYear', e.target.value)} />
                    <input type="number" placeholder="End Year" className="input-field" value={w.endYear || ''} onChange={e => updateWork(index, 'endYear', e.target.value)} />
                  </div>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm mb-4" onClick={addWork}><FiPlus /> Add Work</button>

              <h3>Education</h3>
              {education.map((e, index) => (
                <div key={index} className="array-item-card">
                  <button className="remove-item-btn" onClick={() => removeEducation(index)}><FiTrash2 /></button>
                  <input type="text" placeholder="School/University" className="input-field mb-2" value={e.school} onChange={evt => updateEducation(index, 'school', evt.target.value)} />
                  <input type="text" placeholder="Degree" className="input-field mb-2" value={e.degree} onChange={evt => updateEducation(index, 'degree', evt.target.value)} />
                  <input type="number" placeholder="Year Graduated" className="input-field mb-2" value={e.year || ''} onChange={evt => updateEducation(index, 'year', evt.target.value)} />
                </div>
              ))}
              <button className="btn btn-secondary btn-sm mb-4" onClick={addEducation}><FiPlus /> Add Education</button>
              
              <button className="btn btn-primary mt-2" onClick={handleSaveWorkEducation} disabled={loading}>Save Work & Education</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content">
              <h3>Change Password</h3>
              <div className="form-group">
                <input type="password" placeholder="Current Password" className="input-field" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <input type="password" placeholder="New Password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <input type="password" placeholder="Confirm New Password" className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={handleChangePassword} disabled={loading || !currentPassword || !newPassword}>Change Password</button>

              <div className="danger-zone mt-4">
                <h3 className="text-danger">Danger Zone</h3>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <button className="btn btn-danger mt-2" onClick={handleDeleteAccount} disabled={loading}>Delete Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
