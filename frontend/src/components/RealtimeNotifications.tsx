import { API_CONFIG } from "@/config/api";
import { useAuthStore } from "@/store/authStore";
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

    return () => {
      socket.disconnect();
    };
  }, [addRealtimeNotification, token, user]);

  return null;
};

export default RealtimeNotifications;
