import { io, Socket } from 'socket.io-client';
import { store } from '../store/store';
import { addMessage, updateOnlineStatus } from '../store/slices/chatSlice';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:5000');

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.socket?.emit('join', userId);
    });

    this.socket.on('receive-message', (message) => {
      store.dispatch(addMessage(message));
    });

    this.socket.on('status-updated', (data) => {
      store.dispatch(updateOnlineStatus(data));
    });

    this.socket.on('user-typing', (data) => {
      // Could add to state if needed for UI indicator
    });

    this.socket.on('user-stopped-typing', (data) => {
      // Could add to state
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }

  emitMessage(data: { conversationId: string, sender: string, recipients: string[], message: any }) {
    this.socket?.emit('send-message', data);
  }

  emitTyping(data: { conversationId: string, userId: string, recipients: string[], isTyping: boolean }) {
    this.socket?.emit(data.isTyping ? 'typing-start' : 'typing-stop', data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
