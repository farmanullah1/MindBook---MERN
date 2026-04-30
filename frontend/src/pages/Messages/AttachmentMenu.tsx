/**
 * CodeDNA
 * AttachmentMenu.tsx — core functionality
 * exports: none
 * used_by: ChatWindow.tsx
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Implemented attachment selection menu
 */

import React, { useRef } from 'react';
import { FiImage, FiFile, FiMic, FiVideo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface AttachmentMenuProps {
  onSelectFiles: (files: FileList) => void;
  onVoiceRecord: () => void;
  onClose: () => void;
}

const AttachmentMenu: React.FC<AttachmentMenuProps> = ({ onSelectFiles, onVoiceRecord, onClose }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectFiles(e.target.files);
      onClose();
    }
  };

  return (
    <motion.div 
      className="attachment-menu"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
    >
      <div className="attachment-options">
        <button className="attachment-option" onClick={() => imageInputRef.current?.click()}>
          <div className="icon-wrapper image">
            <FiImage size={20} />
          </div>
          <span>Photos</span>
        </button>
        
        <button className="attachment-option" onClick={() => imageInputRef.current?.click()}>
          <div className="icon-wrapper video">
            <FiVideo size={20} />
          </div>
          <span>Videos</span>
        </button>

        <button className="attachment-option" onClick={() => docInputRef.current?.click()}>
          <div className="icon-wrapper document">
            <FiFile size={20} />
          </div>
          <span>Documents</span>
        </button>

        <button className="attachment-option" onClick={onVoiceRecord}>
          <div className="icon-wrapper voice">
            <FiMic size={20} />
          </div>
          <span>Voice</span>
        </button>
      </div>

      <input 
        type="file" 
        ref={imageInputRef} 
        accept="image/*,video/*" 
        multiple 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      
      <input 
        type="file" 
        ref={docInputRef} 
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx" 
        multiple 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
    </motion.div>
  );
};

export default AttachmentMenu;
