/**
 * CodeDNA
 * SkeletonPost.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import './SkeletonPost.css';

const SkeletonPost: React.FC = () => {
  return (
    <div className="skeleton-post card">
      <div className="skeleton-header">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton-meta">
          <div className="skeleton skeleton-text skeleton-name" />
          <div className="skeleton skeleton-text skeleton-time" />
        </div>
      </div>
      <div className="skeleton-body">
        <div className="skeleton skeleton-text skeleton-line" />
        <div className="skeleton skeleton-text skeleton-line" />
        <div className="skeleton skeleton-text skeleton-line skeleton-short" />
      </div>
      <div className="skeleton skeleton-image" />
      <div className="skeleton-footer">
        <div className="skeleton skeleton-button" />
        <div className="skeleton skeleton-button" />
        <div className="skeleton skeleton-button" />
      </div>
    </div>
  );
};

export default SkeletonPost;
