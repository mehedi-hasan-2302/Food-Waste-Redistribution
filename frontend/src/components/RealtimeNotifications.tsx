import { API_CONFIG } from "@/config/api";
import type { ChatMessage } from "@/lib/types/chat";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import {
  type RealtimeNotificationPayload,
  useNotificationStore,
} from "@/store/notificationStore";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const RealtimeNotifications: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const addRealtimeNotification = useNotificationStore(
    (state) => state.addRealtimeNotification
  );
  const addRealtimeMessage = useChatStore((state) => state.addRealtimeMessage);

  useEffect(() => {
    if (!user || !token) return;

    const socket = io(API_CONFIG.baseURL, {
      transports: ["websocket", "polling"],
      auth: { token },
    });

    socket.on(
      "new_notification",
      (notification: RealtimeNotificationPayload) => {
        addRealtimeNotification(notification);
        toast.info(notification.message);
      }
    );

    socket.on(
      "delivery_notification",
      (notification: RealtimeNotificationPayload) => {
        addRealtimeNotification(notification);
        toast.info(notification.message);
      }
    );

    socket.on("chat_message", (message: ChatMessage) => {
      addRealtimeMessage(message, Number(user.id));
    });

    return () => {
      socket.disconnect();
    };
  }, [addRealtimeMessage, addRealtimeNotification, token, user]);

  return null;
};

export default RealtimeNotifications;
