import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { AuthState, IUser, LoginCredentials, RegisterCredentials } from '../../types';

const storedToken = localStorage.getItem('minds_books_token');
const storedUser = localStorage.getItem('minds_books_user');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    localStorage.removeItem('token');
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

export const toggleSavePost = createAsyncThunk('auth/savePost', async (postId: string, { rejectWithValue }) => {
  try {
    const response = await api.post(`/users/save-post/${postId}`);
    return response.data.savedPosts || response.data; // Ensure we get the updated user or savedPosts array
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to save post');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('minds_books_token');
      localStorage.removeItem('minds_books_user');
    },
    clearError(state) {
      state.error = null;
    },
    updateUserInState(state, action: PayloadAction<Partial<IUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('minds_books_user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('minds_books_token', action.payload.token);
        localStorage.setItem('minds_books_user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('minds_books_token', action.payload.token);
        localStorage.setItem('minds_books_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('minds_books_user', JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('minds_books_token');
        localStorage.removeItem('minds_books_user');
      })
      .addCase(toggleSavePost.fulfilled, (state, action) => {
        if (state.user) {
          // Depending on API, action.payload might be full user or array
          if (Array.isArray(action.payload)) {
             state.user.savedPosts = action.payload;
          } else {
             state.user.savedPosts = action.payload.savedPosts;
          }
        }
      });
  },
});

export const { logout, clearError, updateUserInState } = authSlice.actions;
export default authSlice.reducer;
