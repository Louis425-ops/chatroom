//typescript 类型定义文件, 为整个聊天室应用定义统一的数据类型
export interface ApiResponse<T> {
  message: string;
  code: number;
  data: T | null;
}

export interface Message {
  messageId: string;
  roomId: string;
  sender: string;
  content: string;
  time: number;
}

export interface RoomPreviewInfo {
  roomId: string;
  roomName: string;
  lastMessage: Message | null;
}

// API Request/Response Types
export interface RoomAddArgs {
  user: string;
  roomName: string;
}

export interface RoomAddRes {
  roomId: string;
}

export interface RoomListRes {
  rooms: RoomPreviewInfo[];
}

export interface RoomDeleteArgs {
  user: string;
  roomId: string;
}

export interface MessageAddArgs {
  roomId: string;
  content: string;
  sender: string;
}

export interface RoomMessageListArgs {
  roomId: string;
}

export interface RoomMessageListRes {
  messages: Message[];
}

export interface RoomMessageGetUpdateArgs {
  roomId: string;
  sinceMessageId: string;
}

export interface RoomMessageGetUpdateRes {
  messages: Message[];
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  isRoot: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}