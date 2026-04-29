import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUsers, FiCompass, FiShield } from 'react-icons/fi';
import api from '../../services/api';
import { IGroup } from '../../types';
import GroupCard from '../../components/Group/GroupCard';
import CreateGroupModal from '../../components/Group/CreateGroupModal';
import './Groups.css';

const GroupsHome: React.FC = () => {
  const [memberGroups, setMemberGroups] = useState<IGroup[]>([]);
  const [suggestedGroups, setSuggestedGroups] = useState<IGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setMemberGroups(res.data.memberGroups);
      setSuggestedGroups(res.data.suggestedGroups);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="groups-page-container">
      <div className="groups-sidebar">
        <div className="sidebar-header">
          <h2>Groups</h2>
        </div>
        
        <nav className="groups-nav">
          <Link to="/groups" className="nav-item active">
            <div className="nav-icon active">
              <FiUsers />
            </div>
            <span>Your Feed</span>
          </Link>
          <Link to="/groups/discover" className="nav-item">
            <div className="nav-icon">
              <FiCompass />
            </div>
            <span>Discover</span>
          </Link>
        </nav>

        <button className="create-group-btn" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Create New Group
        </button>

        <hr className="sidebar-divider" />

        <div className="sidebar-section">
          <h3>Groups you've joined</h3>
          <div className="mini-group-list">
            {memberGroups.map(group => (
              <Link key={group._id} to={`/groups/${group._id}`} className="mini-group-item">
                <img src={group.coverPhoto || 'https://via.placeholder.com/40'} alt={group.name} />
                <div className="mini-group-info">
                  <span className="name">{group.name}</span>
                  <span className="last-active">Last active 2h ago</span>
                </div>
              </Link>
            ))}
            {memberGroups.length === 0 && !loading && (
              <p className="empty-text">You haven't joined any groups yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="groups-content">
        <div className="content-section">
          <div className="section-header">
            <h3>Suggested for you</h3>
            <Link to="/groups/discover" className="see-all">See all</Link>
          </div>
          <div className="groups-grid">
            {suggestedGroups.map(group => (
              <GroupCard key={group._id} group={group} onJoin={fetchGroups} />
            ))}
            {suggestedGroups.length === 0 && !loading && (
              <p className="empty-text">No suggestions available right now.</p>
            )}
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h3>Your Groups</h3>
          </div>
          <div className="groups-grid">
            {memberGroups.map(group => (
              <GroupCard key={group._id} group={group} />
            ))}
            {memberGroups.length === 0 && !loading && (
              <div className="no-groups-placeholder">
                <FiUsers size={64} />
                <p>Groups you join will appear here.</p>
                <button onClick={() => setIsModalOpen(true)}>Create a Group</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CreateGroupModal 
          onClose={() => setIsModalOpen(false)} 
          onCreated={() => {
            setIsModalOpen(false);
            fetchGroups();
          }} 
        />
      )}
    </div>
  );
};

export default GroupsHome;
