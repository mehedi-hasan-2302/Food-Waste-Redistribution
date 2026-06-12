// src/store/notificationStore.ts
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import { API_CONFIG } from "@/config/api";
import type { Notification } from "@/lib/types/notification";

export interface RealtimeNotificationPayload {
  id: number;
  type: string;
  message: string;
  referenceId?: number;
  timestamp?: string | Date;
  data?: unknown;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (token: string) => Promise<void>;
  markAsRead: (token: string, notificationId: number) => Promise<void>;
  markAllAsRead: (token: string) => Promise<void>;
  addRealtimeNotification: (payload: RealtimeNotificationPayload) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addRealtimeNotification: (payload) => {
    const incomingNotification: Notification = {
      NotificationID: payload.id,
      NotificationType: payload.type,
      Message: payload.message,
      ReferenceID: payload.referenceId ?? 0,
      createdAt: payload.timestamp
        ? new Date(payload.timestamp).toISOString()
        : new Date().toISOString(),
      IsRead: false,
    };

    set((state) => {
      const alreadyExists = state.notifications.some(
        (notification) =>
          notification.NotificationID === incomingNotification.NotificationID
      );

      if (alreadyExists) return state;

      const notifications = [incomingNotification, ...state.notifications];
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.IsRead).length,
      };
    });
  },

  fetchNotifications: async (token) => {
    // No need to set loading true for background fetches
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/notifications/get-notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && response.data.status === "success") {
        const fetchedNotifications: Notification[] = response.data.data;
        const unread = fetchedNotifications.filter((n) => !n.IsRead).length;
        set({ notifications: fetchedNotifications, unreadCount: unread });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // We don't show a toast for background fetch errors to avoid annoying the user.
    }
  },

  markAsRead: async (token, notificationId) => {
    const originalNotifications = get().notifications;
    // Optimistic UI update: Mark as read immediately
    const updatedNotifications = originalNotifications.map((n) =>
      n.NotificationID === notificationId ? { ...n, IsRead: true } : n
    );
    const newUnreadCount = updatedNotifications.filter((n) => !n.IsRead).length;
    set({ notifications: updatedNotifications, unreadCount: newUnreadCount });

    try {
      await axios.patch(
        `${API_CONFIG.baseURL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
        console.log("Failed to mark notification as read:", error);
        toast.error("Failed to mark notification as read. Reverting.");
        // On error, revert the UI back to its original state
        set({
        notifications: originalNotifications,
        unreadCount: originalNotifications.filter((n) => !n.IsRead).length,
      });
    }
  },

  markAllAsRead: async (token) => {
    const originalNotifications = get().notifications;
    // Optimistic UI update
    const updatedNotifications = originalNotifications.map((n) => ({
      ...n,
      IsRead: true,
    }));
    set({ notifications: updatedNotifications, unreadCount: 0 });

    try {
      await axios.patch(
        `${API_CONFIG.baseURL}/api/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
        toast.error("Failed to mark all as read. Reverting.");
        set({
        notifications: originalNotifications,
        unreadCount: originalNotifications.filter((n) => !n.IsRead).length,
      });
    }
  },
}));
