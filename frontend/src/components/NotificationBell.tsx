import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import type { Notification } from "@/lib/types/notification";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModalStore } from "@/store/modalStore";

const NotificationBell: React.FC = () => {
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const markAsRead = useNotificationStore((state) => state.markAsRead);
    const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
    const token = useAuthStore((state) => state.token);
    const openModal = useModalStore((state) => state.openModal);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.IsRead && token) {
      markAsRead(token, notification.NotificationID);
    }
    if (notification.Message.includes("New order received")) {
      // This is for a Seller/Donor to authorize a pickup
      openModal("AUTHORIZE_PICKUP", { orderId: notification.ReferenceID });
    } else if (notification.Message.includes("has been claimed")) {
      // This is for a Seller/Donor to authorize a pickup, but for a donation
      openModal("AUTHORIZE_PICKUP", { claimId: notification.ReferenceID });
    } else if (notification.Message.includes("has been picked up by delivery personnel and is on the way")) {
      // This is for a Volunteer to confirm completion
      openModal("COMPLETE_DELIVERY", { orderId: notification.ReferenceID });
    } else if (notification.Message.includes("has been picked up by volunteer and is on the way")) {
      openModal("COMPLETE_DELIVERY", { claimId: notification.ReferenceID });
    }

    console.log("Navigating for notification:", notification);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:text-white hover:bg-white/20"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Open notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="link"
              className="p-0 h-auto text-xs"
              onClick={() => token && markAllAsRead(token)}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.NotificationID}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-3 p-2 cursor-pointer ${
                  !notification.IsRead ? "bg-blue-50" : ""
                }`}
              >
                {!notification.IsRead && (
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                )}
                <p
                  className={`text-sm ${
                    !notification.IsRead ? "font-semibold" : ""
                  }`}
                >
                  {notification.Message}
                </p>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-gray-500">
              You have no new notifications.
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
