/**
 * CodeDNA
 * onlineSlice.ts — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnlineState {
  onlineUserIds: string[];
}

const initialState: OnlineState = {
  onlineUserIds: [],
};

const onlineSlice = createSlice({
  name: 'online',
  initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUserIds = action.payload;
    },
    userJoined: (state, action: PayloadAction<string>) => {
      if (!state.onlineUserIds.includes(action.payload)) {
        state.onlineUserIds.push(action.payload);
      }
    },
    userLeft: (state, action: PayloadAction<string>) => {
      state.onlineUserIds = state.onlineUserIds.filter(id => id !== action.payload);
    },
  },
});

export const { setOnlineUsers, userJoined, userLeft } = onlineSlice.actions;
export default onlineSlice.reducer;
