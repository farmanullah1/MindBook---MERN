/**
 * CodeDNA
 * VoiceRecorder.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiMic, FiX, FiSend, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
  onStop: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onStop, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      onCancel();
    }
  }, [onCancel]);

  const stopAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      const duration = recordingTime;
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onStop(blob, duration);
        cleanup();
      };
      mediaRecorderRef.current.stop();
    }
  };

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    startRecording();
    return () => cleanup();
  }, [startRecording, cleanup]);

  return (
    <motion.div 
      className="voice-recorder-bar"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="recording-info">
        <motion.div 
          className="recording-dot"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="recording-timer">{formatTime(recordingTime)}</span>
        <div className="recording-wave">
          {[...Array(5)].map((_, i) => (
            <motion.div 
              key={i}
              className="wave-bar"
              animate={{ height: [4, Math.random() * 16 + 4, 4] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      <div className="recorder-actions">
        <button className="recorder-action-btn cancel" onClick={onCancel} title="Cancel">
          <FiTrash2 size={18} />
        </button>
        <button className="recorder-action-btn send" onClick={stopAndSend} title="Send voice message">
          <FiSend size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default VoiceRecorder;
