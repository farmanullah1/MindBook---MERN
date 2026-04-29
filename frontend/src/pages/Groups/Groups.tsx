import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiPlus, FiLock, FiGlobe } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import CreateGroupModal from '../../components/CreateGroupModal/CreateGroupModal';
import api from '../../services/api';
import { IGroup } from '../../types';
import './Groups.css';

const Groups: React.FC = () => {
  const [groups, setGroups] = React.useState<IGroup[]>([]);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <>
      <Navbar />
      <div className="home-layout">
        <LeftSidebar />
        <main className="main-content" style={{ padding: 'var(--space-4)' }}>
          <div className="groups-header">
            <h2>Groups</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus /> Create New Group
            </button>
          </div>

          {loading ? (
            <div className="feed-loading"><div className="spinner"></div></div>
          ) : groups.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px' }}>
              <FiUsers size={48} className="text-secondary mb-4" />
              <h3>No Groups Found</h3>
              <p className="text-secondary">Join or create a group to connect with others.</p>
            </div>
          ) : (
            <div className="groups-grid">
              {groups.map(group => (
                <Link to={`/groups/${group._id}`} key={group._id} className="group-card">
                  <div className="group-cover">
                    {group.coverPhoto ? (
                      <img src={group.coverPhoto} alt={group.name} />
                    ) : (
                      <div className="group-cover-placeholder">
                        <FiUsers size={40} />
                      </div>
                    )}
                  </div>
                  <div className="group-info">
                    <h3>{group.name}</h3>
                    <p className="group-meta">
                      {group.privacy === 'public' ? <FiGlobe /> : <FiLock />} {group.privacy} group · {group.members.length} members
                    </p>
                    <p className="group-desc">{group.description.substring(0, 80)}{group.description.length > 80 ? '...' : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreateGroupModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchGroups();
          }} 
        />
      )}
    </>
  );
};

export default Groups;
