export interface Notification {
  NotificationID: number;
  NotificationType:
    | "ORDER_UPDATE"
    | "CLAIM_UPDATE"
    | "DELIVERY_UPDATE"
    | string;
  Message: string;
  ReferenceID: number; // This will be the OrderID, ClaimID, etc.
  createdAt: string; // ISO date string
  IsRead: boolean;
}
