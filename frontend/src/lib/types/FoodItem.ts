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
