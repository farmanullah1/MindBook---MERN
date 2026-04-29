import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { PostsState, IPost } from '../../types';

const initialState: PostsState = {
  posts: [],
  userPosts: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
};

export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeed',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/feed?page=${page}&limit=20`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (postData: { content: string; image?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/like',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${postId}/like`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const commentOnPost = createAsyncThunk(
  'posts/comment',
  async ({ postId, text }: { postId: string; text: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/comment`, { text });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId }: { postId: string; commentId: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/update',
  async (data: { postId: string; content: string; image?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${data.postId}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

const updatePostInList = (posts: IPost[], updatedPost: IPost): IPost[] => {
  return posts.map((p) => (p._id === updatedPost._id ? updatedPost : p));
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPosts(state) {
      state.posts = [];
      state.currentPage = 1;
      state.totalPages = 1;
    },
    clearUserPosts(state) {
      state.userPosts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.currentPage === 1) {
          state.posts = action.payload.posts;
        } else {
          const existingIds = new Set(state.posts.map((p: IPost) => p._id));
          const newPosts = action.payload.posts.filter((p: IPost) => !existingIds.has(p._id));
          state.posts = [...state.posts, ...newPosts];
        }
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.userPosts.unshift(action.payload);
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.posts = updatePostInList(state.posts, action.payload);
        state.userPosts = updatePostInList(state.userPosts, action.payload);
      })
      .addCase(commentOnPost.fulfilled, (state, action) => {
        state.posts = updatePostInList(state.posts, action.payload);
        state.userPosts = updatePostInList(state.userPosts, action.payload);
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.posts = updatePostInList(state.posts, action.payload);
        state.userPosts = updatePostInList(state.userPosts, action.payload);
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload);
        state.userPosts = state.userPosts.filter((p) => p._id !== action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        const userIndex = state.userPosts.findIndex((p) => p._id === action.payload._id);
        if (userIndex !== -1) {
          state.userPosts[userIndex] = action.payload;
        }
      });
  },
});

export const { clearPosts, clearUserPosts } = postsSlice.actions;
export default postsSlice.reducer;
