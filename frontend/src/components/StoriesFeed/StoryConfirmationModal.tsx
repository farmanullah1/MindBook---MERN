/**
 * CodeDNA
 * StoryConfirmationModal.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState } from 'react';
import './StoryConfirmationModal.css';

interface StoryConfirmationModalProps {
  file: File;
  previewUrl: string;
  isVideo: boolean;
  onConfirm: (caption: string) => void;
  onCancel: () => void;
  loading: boolean;
}

const StoryConfirmationModal: React.FC<StoryConfirmationModalProps> = ({ file, previewUrl, isVideo, onConfirm, onCancel, loading }) => {
  const [caption, setCaption] = useState('');

  return (
    <div className="modal-overlay">
      <div className="modal-content story-confirm-modal animate-scale-in">
        <div className="modal-header">
          <h3>Create Story</h3>
          <button className="modal-close" onClick={onCancel} disabled={loading}>&times;</button>
        </div>
        
        <div className="modal-body story-confirm-body">
          <div className="story-preview-container">
            {isVideo ? (
              <video src={previewUrl} controls className="story-preview-media" />
            ) : (
              <img src={previewUrl} alt="Story Preview" className="story-preview-media" />
            )}
          </div>
          
          <textarea
            className="story-caption-input input-field"
            placeholder="Add a caption (optional)..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={loading}
            maxLength={150}
          />
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary btn-loading" onClick={() => onConfirm(caption)} disabled={loading}>
            {loading ? <div className="spinner small"></div> : 'Post to Story'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryConfirmationModal;
