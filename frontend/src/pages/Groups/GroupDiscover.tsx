/**
 * CodeDNA
 * GroupDiscover.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useEffect, useState } from 'react';
import { FiCompass, FiSearch, FiGlobe, FiLock } from 'react-icons/fi';
import api from '../../services/api';
import { IGroup } from '../../types';
import GroupCard from '../../components/Group/GroupCard';
import Navbar from '../../components/Navbar/Navbar';
import './Groups.css';

const GroupDiscover: React.FC = () => {
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDiscoverGroups = async () => {
    try {
      const res = await api.get('/groups/discover');
      setGroups(res.data);
    } catch (error) {
      console.error('Failed to fetch discover groups', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoverGroups();
  }, []);

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="groups-page-container">
      <div className="groups-sidebar discover-sidebar">
        <div className="sidebar-header">
          <h2>Discover</h2>
        </div>
        
        <div className="search-box">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search groups..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="categories-section">
          <h3>Categories</h3>
          <ul className="category-list">
            <li className="active">All</li>
            <li>Science & Tech</li>
            <li>Music</li>
            <li>Gaming</li>
            <li>Business</li>
            <li>Health</li>
          </ul>
        </div>
      </div>

      <div className="groups-content">
        <div className="content-section">
          <div className="section-header">
            <h3>Groups you might like</h3>
          </div>
          
          {loading ? (
            <div className="loading-spinner">Loading groups...</div>
          ) : (
            <div className="groups-grid">
              {filteredGroups.map(group => (
                <GroupCard key={group._id} group={group} onJoin={fetchDiscoverGroups} />
              ))}
              {filteredGroups.length === 0 && (
                <div className="no-results">
                  <FiCompass size={64} />
                  <p>No groups found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default GroupDiscover;
