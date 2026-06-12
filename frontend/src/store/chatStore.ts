import { create } from "zustand";
import axios from "axios";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";
import type { ChatConversation, ChatMessage, ChatSearchUser } from "@/lib/types/chat";

interface ChatState {
  conversations: ChatConversation[];
  userSearchResults: ChatSearchUser[];
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSearchingUsers: boolean;
  error: string | null;
  searchUsers: (token: string, query: string) => Promise<void>;
  fetchConversations: (token: string) => Promise<void>;
  openConversationWithUser: (token: string, userId: number) => Promise<void>;
  fetchMessages: (token: string, conversationId: number) => Promise<void>;
  sendMessage: (token: string, recipientId: number, message: string) => Promise<void>;
  addRealtimeMessage: (message: ChatMessage, currentUserId: number) => void;
}

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  userSearchResults: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  isSearchingUsers: false,
  error: null,

  searchUsers: async (token, query) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      set({ userSearchResults: [], error: null });
      return;
    }

    set({ isSearchingUsers: true, error: null });
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}${API_ENDPOINTS.chat.searchUsers}?q=${encodeURIComponent(trimmedQuery)}`,
        authHeader(token)
      );
      set({
        userSearchResults: response.data.data || [],
        isSearchingUsers: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Failed to search users"),
        isSearchingUsers: false,
      });
    }
  },

  fetchConversations: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}${API_ENDPOINTS.chat.conversations}`,
        authHeader(token)
      );
      set({
        conversations: response.data.data || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Failed to load conversations"),
        isLoading: false,
      });
    }
  },

  openConversationWithUser: async (token, userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_CONFIG.baseURL}${API_ENDPOINTS.chat.conversationWithUser(userId)}`,
        {},
        authHeader(token)
      );
      const conversation: ChatConversation = response.data.data;
      set((state) => ({
        activeConversation: conversation,
        conversations: upsertConversation(state.conversations, conversation),
        userSearchResults: [],
        isLoading: false,
      }));
      await get().fetchMessages(token, conversation.id);
    } catch (error) {
      set({
        error: getErrorMessage(error, "Failed to open conversation"),
        isLoading: false,
      });
    }
  },

  fetchMessages: async (token, conversationId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}${API_ENDPOINTS.chat.messages(conversationId)}`,
        authHeader(token)
      );
      set({
        messages: response.data.data || [],
        conversations: get().conversations.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation
        ),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Failed to load messages"),
        isLoading: false,
      });
    }
  },

  sendMessage: async (token, recipientId, message) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    set({ error: null });
    try {
      await axios.post(
        `${API_CONFIG.baseURL}${API_ENDPOINTS.chat.sendMessage}`,
        { recipientId, message: trimmedMessage },
        authHeader(token)
      );
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to send message") });
    }
  },

  addRealtimeMessage: (message, currentUserId) => {
    set((state) => {
      const alreadyExists = state.messages.some(
        (existing) => existing.id === message.id
      );
      const belongsToActiveConversation =
        state.activeConversation?.id === message.conversationId;
      const shouldIncrementUnread =
        !belongsToActiveConversation && message.senderId !== currentUserId;

      return {
        messages:
          alreadyExists || !belongsToActiveConversation
            ? state.messages
            : [...state.messages, message],
        conversations: state.conversations.map((conversation) =>
          conversation.id === message.conversationId
            ? {
                ...conversation,
                lastMessage: message,
                unreadCount: shouldIncrementUnread
                  ? conversation.unreadCount + 1
                  : conversation.unreadCount,
                updatedAt: message.createdAt,
              }
            : conversation
        ),
      };
    });
  },
}));

function upsertConversation(
  conversations: ChatConversation[],
  conversation: ChatConversation
) {
  const exists = conversations.some((item) => item.id === conversation.id);
  if (exists) {
    return conversations.map((item) =>
      item.id === conversation.id ? conversation : item
    );
  }
  return [conversation, ...conversations];
}
