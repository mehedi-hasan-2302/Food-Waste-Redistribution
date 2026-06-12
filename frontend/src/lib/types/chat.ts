export interface ChatUserSummary {
  id: number;
  username: string;
  role: string;
}

export interface ChatSearchUser extends ChatUserSummary {
  email: string;
}

export interface ChatConversation {
  id: number;
  otherUser: ChatUserSummary;
  lastMessage?: ChatMessage | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  recipientId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}
