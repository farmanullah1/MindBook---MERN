import React from 'react';
import './Skeletons.css';

const SkeletonChatList: React.FC = () => {
  return (
    <div className="skeleton-chat-item">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton-chat-info">
        <div className="skeleton skeleton-text skeleton-name" />
        <div className="skeleton skeleton-text skeleton-message" />
      </div>
    </div>
  );
};

export default SkeletonChatList;
