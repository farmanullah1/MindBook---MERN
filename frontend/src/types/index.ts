export interface IUser {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  coverPicture: string;
  bio: string;
  city: string;
  workplace: string;
  friends: IUser[];
  friendRequests: IUser[];
  sentFriendRequests: IUser[];
  createdAt: string;
  updatedAt?: string;
}

export interface IComment {
  _id: string;
  user: IUser;
  text: string;
  createdAt: string;
}

export interface IPost {
  _id: string;
  user: IUser;
  content: string;
  image: string;
  likes: string[];
  comments: IComment[];
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface PostsState {
  posts: IPost[];
  userPosts: IPost[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}
