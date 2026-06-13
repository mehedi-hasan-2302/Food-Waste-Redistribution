export type PaymentMethod = "PAY_ON_DELIVERY" | "PAY_ON_PICKUP";

export interface Order {
  orderId: number;
  orderStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentMethod?: PaymentMethod;
  PaymentMethod?: PaymentMethod;
  pickupCode: string;
  estimatedTotal: number;
  deliveryFee: number;
  listing: {
    id: number;
    ListingID: number;
    title: string;
    finalPrice: number;
  };
  seller: {
    id?: number;
    UserID?: number;
    username: string;
    phone: string;
  };
  assignedDeliveryPersonnel?: {
    id: number;
    name: string;
    rating: string;
  };
}

export interface CreateOrderPayload {
  deliveryType: "HOME_DELIVERY" | "SELF_PICKUP";
  deliveryAddress: string;
  proposedPrice?: number;
  paymentMethod?: PaymentMethod;
  orderNotes?: string;
}

export interface CreateClaimPayload {
  deliveryType: "HOME_DELIVERY" | "SELF_PICKUP";
  deliveryAddress: string;
  claimNotes?: string;
}
