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
  totalOrders: number;
  pendingOrders: number;
  totalDonationClaims: number;
  pendingDonationClaims: number;
  activeDeliveries: number;
  totalComplaints: number;
  pendingComplaints: number;
}

interface AdminFlowUser {
  UserID: number;
  Username: string;
  Email?: string;
  PhoneNumber?: string;
}

interface AdminFlowListing {
  ListingID: number;
  Title: string;
  IsDonation: boolean;
}

interface AdminFlowDelivery {
  DeliveryID: number;
  DeliveryStatus: "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "FAILED";
  DeliveryPersonnelType: "INDEPENDENT" | "ORG_VOLUNTEER";
  independentDeliveryPersonnel?: AdminFlowUser | null;
  organizationVolunteer?: {
    OrgVolunteerID: number;
    VolunteerName: string;
    VolunteerContactPhone: string;
    user?: AdminFlowUser | null;
  } | null;
}

export interface AdminOrder {
  OrderID: number;
  OrderStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  PaymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  PaymentMethod?: "PAY_ON_DELIVERY" | "PAY_ON_PICKUP";
  DeliveryType: "HOME_DELIVERY" | "SELF_PICKUP";
  FinalPrice: string | number;
  DeliveryFee: string | number;
  CreatedAt: string;
  buyer: AdminFlowUser;
  seller: AdminFlowUser;
  listing: AdminFlowListing;
  delivery?: AdminFlowDelivery | null;
}

export interface AdminDonationClaim {
  ClaimID: number;
  ClaimStatus: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  DeliveryType: "HOME_DELIVERY" | "SELF_PICKUP";
  charityOrg: AdminFlowUser;
  donor: AdminFlowUser;
  listing: AdminFlowListing;
  delivery?: AdminFlowDelivery | null;
}

export interface AdminOrderOversight {
  orders: AdminOrder[];
  donationClaims: AdminDonationClaim[];
}

export interface ProcessVerificationPayload {
  userId: number;
  type: "charity" | "delivery";
  status: "approve" | "reject";
  reason?: string;
}
