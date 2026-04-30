/**
 * CodeDNA
 * GroupDiscover.tsx — discover groups page
 * exports: none
 * used_by: internal
 * rules: 3/2/1 grid pattern, skeleton loaders for perceived performance
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Implemented grid and skeletons
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
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchDiscoverGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups/discover');
      setGroups(res.data);
    } catch (error) {
      console.error('Failed to fetch discover groups', error);
    } finally {
      setTimeout(() => setLoading(false), 800); // Slight delay for smooth shimmer effect
    }
  };

  useEffect(() => {
    fetchDiscoverGroups();
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || group.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Science & Tech', 'Music', 'Gaming', 'Business', 'Health', 'Travel', 'Art'];

  return (
    <div className="groups-page-wrapper">
      <Navbar />
      <div className="groups-page-container">
        <aside className="groups-sidebar discover-sidebar">
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
              {categories.map(cat => (
                <li 
                  key={cat} 
                  className={activeCategory === cat ? 'active' : ''}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="groups-content">
          <header className="section-header">
            <h3>Groups you might like</h3>
          </header>
          
          <div className="groups-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))
            ) : (
              <>
                {filteredGroups.map(group => (
                  <GroupCard key={group._id} group={group} onJoin={fetchDiscoverGroups} />
                ))}
                {filteredGroups.length === 0 && (
                  <div className="no-results">
                    <FiCompass size={64} />
                    <p>No groups found matching your criteria.</p>
                    <button className="btn btn-primary" onClick={() => {setSearchTerm(''); setActiveCategory('All');}}>
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GroupDiscover;
