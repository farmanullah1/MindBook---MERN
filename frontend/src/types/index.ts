export interface IUser {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  coverPicture: string;
  bio?: string;
  location?: { city: string; country: string };
  work?: { _id?: string; title: string; company: string; startYear?: number; endYear?: number }[];
  education?: { _id?: string; school: string; degree: string; year?: number }[];
  savedPosts?: string[];
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

export interface INotification {
  _id: string;
  user: string;
  fromUser: IUser;
  type: 'like' | 'comment' | 'friend_request' | 'friend_accept';
  post?: { _id: string; content: string };
  text?: string;
  read: boolean;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  conversation: string;
  sender: IUser;
  text: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio' | 'file' | '';
  isDeleted: boolean;
  deletedFor: string[];
  readBy: string[];
  repliedTo?: IMessage;
  createdAt: string;
}

export interface IConversation {
  _id: string;
  participants: IUser[];
  isGroup: boolean;
  groupName?: string;
  groupIcon?: string;
  groupAdmin?: string;
  groupMembers?: IUser[];
  lastMessage?: {
    text: string;
    sender: { _id: string, name: string };
    createdAt: string;
  };
  updatedAt: string;
}

export interface ChatState {
  conversations: IConversation[];
  activeConversation: IConversation | null;
  messages: IMessage[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

export interface IStory {
  _id: string;
  user: Pick<IUser, '_id' | 'name' | 'profilePicture'>;
  image?: string;
  video?: string;
  createdAt: string;
}

export interface IUserStoryGroup {
  user: Pick<IUser, '_id' | 'name' | 'profilePicture'>;
  stories: IStory[];
  latestUpdate: string;
}

export interface IGroup {
  _id: string;
  name: string;
  description: string;
  coverPhoto: string;
  admin: Pick<IUser, '_id' | 'name' | 'profilePicture'>;
  members: Pick<IUser, '_id' | 'name' | 'profilePicture'>[];
  privacy: 'public' | 'private';
  createdAt: string;
}

export interface IEvent {
  _id: string;
  creator: Pick<IUser, '_id' | 'name' | 'profilePicture'>;
  title: string;
  description: string;
  date: string;
  location: string;
  coverImage: string;
  attendees: Pick<IUser, '_id' | 'name' | 'profilePicture'>[];
  createdAt: string;
}

export interface IPost {
  _id: string;
  user: IUser;
  group?: IGroup;
  content: string;
  image: string;
  video?: string;
  location?: string;
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
