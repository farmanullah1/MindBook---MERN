/**
 * CodeDNA
 * MediaViewer.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import './Messages.css';

interface MediaViewerProps {
  url: string;
  type: string;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ url, type, onClose }) => {
  return (
    <div className="media-viewer-overlay" onClick={onClose}>
      <div className="media-viewer-content" onClick={(e) => e.stopPropagation()}>
        <div className="media-viewer-header">
          <button className="icon-btn" onClick={onClose}><FiX size={24} /></button>
          <a href={url} download target="_blank" rel="noopener noreferrer" className="icon-btn">
            <FiDownload size={24} />
          </a>
        </div>
        <div className="media-viewer-body">
          {type === 'image' ? (
            <img src={url} alt="Full screen" />
          ) : (
            <video src={url} controls autoPlay />
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
