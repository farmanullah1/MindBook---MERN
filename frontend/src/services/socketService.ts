/**
 * CodeDNA
 * socketService.ts — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import { io, Socket } from 'socket.io-client';
import { store } from '../store/store';
import { addMessage, updateOnlineStatus, setTypingStatus } from '../store/slices/chatSlice';
import { addNotification } from '../store/slices/notificationsSlice';
import { setOnlineUsers, userJoined, userLeft } from '../store/slices/onlineSlice';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:5000');

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.socket?.emit('join', userId);
    });

    this.socket.on('online-users-list', (userIds: string[]) => {
      store.dispatch(setOnlineUsers(userIds));
    });

    this.socket.on('receive-message', (message) => {
      store.dispatch(addMessage(message));
    });

    this.socket.on('status-updated', (data: { userId: string, isOnline: boolean }) => {
      store.dispatch(updateOnlineStatus(data));
      if (data.isOnline) {
        store.dispatch(userJoined(data.userId));
      } else {
        store.dispatch(userLeft(data.userId));
      }
    });

    this.socket.on('user-typing', (data) => {
      store.dispatch(setTypingStatus({ ...data, isTyping: true }));
    });

    this.socket.on('user-stopped-typing', (data) => {
      store.dispatch(setTypingStatus({ ...data, isTyping: false }));
    });
    
    this.socket.on('notification-received', (notification) => {
      store.dispatch(addNotification(notification));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }

  emitMessage(data: { conversationId: string, sender: string, recipients: string[], message: any }) {
    this.socket?.emit('send-message', data);
  }

  emitTyping(data: { conversationId: string, userId: string, userName: string, recipients: string[], isTyping: boolean }) {
    this.socket?.emit(data.isTyping ? 'typing-start' : 'typing-stop', data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
