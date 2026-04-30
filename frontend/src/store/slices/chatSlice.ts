/**
 * CodeDNA
 * chatSlice.ts — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { IConversation, IMessage, ChatState } from '../../types';

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  suggestions: [],
  loading: false,
  error: null,
  unreadCount: 0,
  typingUsers: {},
};

export const fetchConversations = createAsyncThunk('chat/fetchConversations', async () => {
  const response = await api.get('/conversations');
  return response.data;
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (conversationId: string) => {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data;
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async (data: any) => {
  const response = await api.post(`/conversations/${data.conversationId}/messages`, data);
  return response.data;
});

export const acceptRequest = createAsyncThunk('chat/acceptRequest', async (conversationId: string) => {
  const response = await api.put(`/conversations/${conversationId}/accept`);
  return { conversationId, ...response.data };
});

export const fetchSuggestions = createAsyncThunk('chat/fetchSuggestions', async () => {
  const response = await api.get('/conversations/suggestions');
  return response.data;
});

export const getOrCreateConversation = createAsyncThunk('chat/getOrCreateConversation', async (userId: string) => {
  const response = await api.get(`/conversations/with/${userId}`);
  return response.data;
});

export const deleteMessage = createAsyncThunk('chat/deleteMessage', async (messageId: string) => {
  await api.delete(`/conversations/messages/${messageId}`);
  return messageId;
});

export const deleteForEveryone = createAsyncThunk('chat/deleteForEveryone', async (messageId: string) => {
  await api.put(`/conversations/messages/${messageId}/delete-everyone`);
  return messageId;
});

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<IConversation | null>) => {
      state.activeConversation = action.payload;
      state.messages = [];
    },
    addMessage: (state, action: PayloadAction<IMessage>) => {
      if (state.activeConversation?._id === action.payload.conversation) {
        state.messages.push(action.payload);
      }
      // Update last message in conversation list
      const conv = state.conversations.find(c => c._id === action.payload.conversation);
      if (conv) {
        conv.lastMessage = {
          text: action.payload.text || 'Media',
          sender: { _id: action.payload.sender._id, name: action.payload.sender.name },
          createdAt: action.payload.createdAt
        };
        conv.updatedAt = action.payload.createdAt;
        // Sort conversations
        state.conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
    },
    updateOnlineStatus: (state, action: PayloadAction<{userId: string, isOnline: boolean}>) => {
      state.conversations.forEach(c => {
        c.participants.forEach(p => {
          if (p._id === action.payload.userId) {
            p.isOnline = action.payload.isOnline;
          }
        });
      });
    },
    setTypingStatus: (state, action: PayloadAction<{conversationId: string, userName: string, isTyping: boolean}>) => {
      const { conversationId, userName, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userName)) {
          state.typingUsers[conversationId].push(userName);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(name => name !== userName);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (!state.messages.find(m => m._id === action.payload._id)) {
          state.messages.push(action.payload);
        }
      })
      .addCase(acceptRequest.fulfilled, (state, action) => {
        const conv = state.conversations.find(c => c._id === action.payload.conversationId);
        if (conv) {
          conv.status = 'accepted';
        }
        if (state.activeConversation?._id === action.payload.conversationId) {
          state.activeConversation.status = 'accepted';
        }
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        const exists = state.conversations.find(c => c._id === action.payload._id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
        state.activeConversation = action.payload;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(m => m._id !== action.payload);
      })
      .addCase(deleteForEveryone.fulfilled, (state, action) => {
        const msg = state.messages.find(m => m._id === action.payload);
        if (msg) {
          msg.isDeleted = true;
          msg.text = 'This message was deleted';
          msg.mediaUrl = '';
          msg.mediaType = '';
        }
      });
  },
});

export const { setActiveConversation, addMessage, updateOnlineStatus, setTypingStatus } = chatSlice.actions;
export default chatSlice.reducer;
