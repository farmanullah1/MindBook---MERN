/**
 * CodeDNA
 * MediaPreviewModal.tsx — core functionality
 * exports: none
 * used_by: ChatWindow.tsx
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Implemented media preview and upload flow
 */

import React, { useState, useEffect } from 'react';
import { FiX, FiSend, FiFile, FiVideo, FiImage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaPreviewModalProps {
  files: File[];
  onSend: (files: File[], caption: string) => void;
  onCancel: () => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({ files, onSend, onCancel }) => {
  const [caption, setCaption] = useState('');
  const [previews, setPreviews] = useState<{ url: string; type: string; name: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const newPreviews = files.map(file => ({
      url: file.type.startsWith('image/') || file.type.startsWith('video/') ? URL.createObjectURL(file) : '',
      type: file.type,
      name: file.name
    }));
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach(p => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [files]);

  const renderPreviewContent = (preview: { url: string; type: string; name: string }) => {
    if (preview.type.startsWith('image/')) {
      return <img src={preview.url} alt="Preview" className="preview-media" />;
    }
    if (preview.type.startsWith('video/')) {
      return <video src={preview.url} className="preview-media" controls />;
    }
    return (
      <div className="preview-file-icon">
        <FiFile size={80} />
        <span className="preview-file-name">{preview.name}</span>
      </div>
    );
  };

  return (
    <div className="media-preview-overlay">
      <motion.div 
        className="media-preview-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="preview-header">
          <h3>Preview {files.length > 1 ? `(${files.length} files)` : ''}</h3>
          <button className="close-btn" onClick={onCancel}><FiX size={24} /></button>
        </div>

        <div className="preview-body">
          <div className="main-preview">
            {previews[activeIndex] && renderPreviewContent(previews[activeIndex])}
          </div>

          {files.length > 1 && (
            <div className="preview-thumbnails">
              {previews.map((p, index) => (
                <div 
                  key={index} 
                  className={`thumb-item ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                >
                  {p.type.startsWith('image/') ? (
                    <img src={p.url} alt="Thumb" />
                  ) : p.type.startsWith('video/') ? (
                    <div className="thumb-video-icon"><FiVideo /></div>
                  ) : (
                    <div className="thumb-file-icon"><FiFile /></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="preview-footer">
          <div className="caption-input-wrapper">
            <input 
              type="text" 
              placeholder="Add a caption..." 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSend(files, caption)}
            />
          </div>
          <button className="send-preview-btn" onClick={() => onSend(files, caption)}>
            <FiSend size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MediaPreviewModal;
