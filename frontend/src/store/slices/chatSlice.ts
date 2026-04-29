import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { IConversation, IMessage, ChatState } from '../../types';

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: [],
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
      });
  },
});

export const { setActiveConversation, addMessage, updateOnlineStatus, setTypingStatus } = chatSlice.actions;
export default chatSlice.reducer;
