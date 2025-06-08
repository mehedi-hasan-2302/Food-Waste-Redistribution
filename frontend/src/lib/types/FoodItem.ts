export interface DonorSellerInfo {
  UserID: number;
  Username: string;
  Email: string;
  PhoneNumber: string;
  Role: string;
  donorSeller?: {
    BusinessName?: string;
  };
}

export interface FoodItem {
  ListingID: number;
  Title: string;
  Description: string;
  FoodType: string;
  CookedDate: string;
  PickupWindowStart: string;
  PickupWindowEnd: string;
  PickupLocation: string;
  IsDonation: boolean;
  Price: number;
  Quantity: string;
  DietaryInfo: string;
  ImagePath?: string | null;
  isOrdered: boolean;
  ListingStatus: "ACTIVE" | "ORDERED" | "COMPLETED" | "EXPIRED";
  CreatedAt: string;

  originalPrice?: number;
  currentPrice?: number;
  discountApplied?: number;
  donor?: DonorSellerInfo;
}

export interface FoodItemFormData {
  Title: string;
  Description: string;
  FoodType: string;
  CookedDate: string;
  PickupWindowStart: string;
  PickupWindowEnd: string;
  PickupLocation: string;
  IsDonation: boolean;
  Price: number | string;
  Quantity: string;
  DietaryInfo: string;
  imageFile?: File | null;
}
