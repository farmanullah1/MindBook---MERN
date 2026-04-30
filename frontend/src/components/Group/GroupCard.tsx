/**
 * CodeDNA
 * GroupCard.tsx — group card component
 * exports: none
 * used_by: internal
 * rules: Support modern grid layout, include descriptions and privacy tags
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Redesigned card UI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiGlobe, FiLock, FiMoreHorizontal } from 'react-icons/fi';
import { IGroup } from '../../types';
import './Group.css';

interface GroupCardProps {
  group: IGroup;
  onJoin?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin }) => {
  return (
    <div className="group-card">
      <Link to={`/groups/${group._id}`} className="group-card-link">
        <div className="group-cover-wrapper">
          <img 
            src={group.coverPhoto || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop'} 
            alt={group.name} 
            className="group-cover" 
          />
          <div className="group-privacy-tag">
            {group.privacy === 'public' ? <FiGlobe size={12} /> : <FiLock size={12} />}
            <span>{group.privacy === 'public' ? 'Public' : 'Private'}</span>
          </div>
        </div>
        <div className="group-card-info">
          <h4 className="group-name">{group.name}</h4>
          <p className="group-description">
            {group.description || 'Welcome to our community! Join us to connect with like-minded people.'}
          </p>
          <div className="group-stats">
            <FiUsers size={14} />
            <span>{group.members?.length || 0} members</span>
            <span className="dot">•</span>
            <span>2 posts today</span>
          </div>
        </div>
      </Link>
      <div className="group-card-actions">
        {group.isMember ? (
          <Link to={`/groups/${group._id}`} className="view-group-btn">View Group</Link>
        ) : group.isPending ? (
          <button className="pending-btn" disabled>Request Pending</button>
        ) : (
          <button className="join-group-btn" onClick={onJoin}>Join Group</button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
