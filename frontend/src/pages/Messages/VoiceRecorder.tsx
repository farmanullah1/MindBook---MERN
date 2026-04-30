/**
 * CodeDNA
 * VoiceRecorder.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState, useRef, useEffect } from 'react';
import { FiMic, FiSquare, FiTrash2, FiSend } from 'react-icons/fi';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
  onStop: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onStop, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSend = () => {
    if (audioBlob) {
      onStop(audioBlob, recordingTime);
    }
  };

  return (
    <div className="voice-recorder-overlay">
      <div className="recorder-status">
        <div className={`recording-dot ${isRecording ? 'active' : ''}`} />
        <span className="recording-time">{formatTime(recordingTime)}</span>
      </div>

      <div className="recorder-controls">
        <button className="recorder-btn cancel" onClick={onCancel}>
          <FiTrash2 size={20} />
        </button>
        
        {isRecording ? (
          <button className="recorder-btn stop" onClick={stopRecording}>
            <FiSquare size={20} />
          </button>
        ) : (
          <button className="recorder-btn send" onClick={handleSend}>
            <FiSend size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
