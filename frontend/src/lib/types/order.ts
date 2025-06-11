export interface Order {
  orderId: number;
  orderStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
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
  orderNotes?: string;
}

export interface CreateClaimPayload {
  deliveryType: "HOME_DELIVERY" | "SELF_PICKUP";
  deliveryAddress: string;
  claimNotes?: string;
}
