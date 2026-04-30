/**
 * CodeDNA
 * MediaViewer.tsx — core functionality
 * exports: MediaViewer
 * used_by: Post.tsx, MessageBubble.tsx
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiMaximize, FiMinimize } from 'react-icons/fi';
import './MediaViewer.css';

interface MediaViewerProps {
  url: string;
  type: 'image' | 'video';
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ url, type, onClose }) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div 
        className="media-viewer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="media-viewer-header" onClick={e => e.stopPropagation()}>
          <div className="media-actions">
            <a href={url} download target="_blank" rel="noopener noreferrer" title="Download">
              <FiDownload size={20} />
            </a>
            <button onClick={() => setIsZoomed(!isZoomed)} title={isZoomed ? "Actual Size" : "Fit to Screen"}>
              {isZoomed ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
            </button>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <motion.div 
          className="media-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {type === 'image' ? (
            <img 
              src={url} 
              alt="Preview" 
              className={isZoomed ? 'zoomed' : ''} 
              onClick={() => setIsZoomed(!isZoomed)}
            />
          ) : (
            <video 
              src={url} 
              controls 
              autoPlay 
              className={isZoomed ? 'zoomed' : ''}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaViewer;
