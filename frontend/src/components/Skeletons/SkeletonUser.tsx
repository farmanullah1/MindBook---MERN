import React from 'react';
import './Skeletons.css';

const SkeletonUser: React.FC = () => {
  return (
    <div className="skeleton-user-card card">
      <div className="skeleton skeleton-avatar-large" />
      <div className="skeleton-user-info">
        <div className="skeleton skeleton-text skeleton-name" />
        <div className="skeleton skeleton-text skeleton-mutual" />
      </div>
      <div className="skeleton-user-actions">
        <div className="skeleton skeleton-button" />
        <div className="skeleton skeleton-button-secondary" />
      </div>
    </div>
  );
};

export default SkeletonUser;
