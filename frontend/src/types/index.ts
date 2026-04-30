/**
 * CodeDNA
 * index.ts — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

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
  relationshipStatus?: 'Single' | 'In a relationship' | 'Engaged' | 'Married' | 'It\'s complicated' | 'In an open relationship' | 'Widowed' | 'Separated' | 'Divorced' | '';
  hometown?: string;
  birthdate?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | '';
  mobileNumber?: string;
  website?: string;
  savedPosts?: string[];
  friends: IUser[];
  friendRequests: IUser[];
  sentFriendRequests: IUser[];
  privacySettings?: {
    whoCanMessageMe: 'Everyone' | 'Friends' | 'No one';
    whoCanSendFriendRequest: 'Everyone' | 'Friends of Friends';
  };
  notificationPreferences?: {
    newMessages: boolean;
    friendRequests: boolean;
    storyReplies: boolean;
    groupInvites: boolean;
  };
  createdAt: string;
  updatedAt?: string;
  isOnline?: boolean;
  lastActive?: string;
}

export interface ICommentReply {
  _id: string;
  user: IUser;
  text: string;
  createdAt: string;
}

export interface IComment {
  _id: string;
  user: IUser;
  text: string;
  likes?: string[];
  replies?: ICommentReply[];
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
  mediaType: 'image' | 'video' | 'audio' | 'voice' | 'file' | 'story_reply' | '';
  mediaMetadata?: {
    mimeType?: string;
    width?: number;
    height?: number;
    duration?: number;
    size?: number;
    fileName?: string;
    fileSize?: number;
  };
  thumbnailUrl?: string;
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
  unreadCount?: number;
  lastMessage?: {
    text: string;
    sender: { _id: string, name: string };
    createdAt: string;
  };
  updatedAt: string;
  status?: string;
}

export interface ChatState {
  conversations: IConversation[];
  activeConversation: IConversation | null;
  messages: IMessage[];
  suggestions: IUser[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  typingUsers: { [conversationId: string]: string[] }; // List of user names typing in each conv
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
  slug: string;
  description: string;
  coverPhoto: string;
  privacy: 'public' | 'private';
  rules: string[];
  creator: Pick<IUser, '_id' | 'name' | 'profilePicture'>;
  admins: Pick<IUser, '_id' | 'name' | 'profilePicture'>[];
  moderators: Pick<IUser, '_id' | 'name' | 'profilePicture'>[];
  members: Pick<IUser, '_id' | 'name' | 'profilePicture'>[];
  bannedMembers: string[];
  joinRequests: { user: Pick<IUser, '_id' | 'name' | 'profilePicture'>; requestedAt: string }[];
  pinnedPosts: string[];
  createdAt: string;
  isMember?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  isPending?: boolean;
  category?: string;
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
  feeling?: string;
  sharedPost?: IPost;
  likes: string[];
  comments: IComment[];
  createdAt: string;
  updatedAt?: string;
  isPinned?: boolean;
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
  email?: string;
  mobileNumber?: string;
  password: string;
  birthdate?: string;
  gender?: string;
}
