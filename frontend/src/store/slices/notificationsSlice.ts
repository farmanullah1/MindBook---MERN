/**
 * CodeDNA
 * notificationsSlice.ts — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { INotification } from '../../types';

interface NotificationsState {
  items: INotification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const response = await api.get('/notifications');
  return response.data;
});

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (id: string) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
});

export const markAllAsRead = createAsyncThunk('notifications/markAllAsRead', async () => {
  await api.put('/notifications/read-all');
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n: INotification) => !n.read).length;
        state.loading = false;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex(n => n._id === action.payload._id);
        if (index !== -1 && !state.items[index].read) {
          state.items[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => n.read = true);
        state.unreadCount = 0;
      });
  },
});

export default notificationsSlice.reducer;
