export interface AdminUser {
  UserID: number;
  Username: string;
  Email: string;
  PhoneNumber: string;
  Role: string;
  AccountStatus: "ACTIVE" | "CLOSED" | "PENDING_VERIFICATION";
  IsEmailVerified: boolean;
  RegistrationDate: string;
  profile: any; 
}

export interface PendingCharity {
  ProfileID: number;
  OrganizationName: string;
  GovRegistrationDocPath: string;
  AddressLine1: string;
  user: {
    UserID: number;
    Username: string;
    Email: string;
    PhoneNumber: string;
    RegistrationDate: string;
  };
}

export interface PendingDelivery {
  ProfileID: number;
  FullName: string;
  SelfiePath: string;
  NIDPath: string;
  OperatingAreas: Record<string, string>;
  user: {
    UserID: number;
    Username: string;
    Email: string;
    PhoneNumber: string;
    RegistrationDate: string;
  };
}

export interface FoodListing {
  ListingID: number;
  Title: string;
  Description: string;
  FoodType: string;
  Quantity: string | null;
  DietaryInfo: string | null;
  CookedDate: string;
  IsDonation: boolean;
  Price: string | null;
  ListingStatus: "ACTIVE" | "SOLD" | "CLAIMED" | "REMOVED" | "EXPIRED";
  ImagePath: string | null;
  donor: {
    UserID: number;
    Username: string;
    Email: string;
    // ... other donor properties
  };
  // ... other listing properties
}

export interface DashboardStats {
  totalUsers: number;
  totalDonors: number;
  totalCharities: number;
  totalBuyers: number;
  totalDeliveryPersonnel: number;
  pendingCharityVerifications: number;
  pendingDeliveryVerifications: number;
  totalFoodListings: number;
  activeFoodListings: number;
  totalComplaints: number;
  pendingComplaints: number;
}

export interface ProcessVerificationPayload {
  userId: number;
  type: "charity" | "delivery";
  status: "approve" | "reject";
  reason?: string;
}
