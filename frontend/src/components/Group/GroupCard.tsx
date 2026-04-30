/**
 * CodeDNA
 * GroupCard.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiGlobe, FiLock } from 'react-icons/fi';
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
        <img src={group.coverPhoto || 'https://via.placeholder.com/300x150'} alt={group.name} className="group-cover" />
        <div className="group-card-info">
          <h4 className="group-name">{group.name}</h4>
          <div className="group-meta">
            <span className="privacy">
              {group.privacy === 'public' ? <FiGlobe /> : <FiLock />}
              {group.privacy === 'public' ? 'Public' : 'Private'} Group
            </span>
            <span className="dot">•</span>
            <span className="members">{group.members?.length || 0} members</span>
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
