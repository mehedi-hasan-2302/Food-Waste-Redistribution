import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import { API_CONFIG } from "@/config/api";
import type { FoodItem, FoodItemFormData } from "@/lib/types/FoodItem";

interface FoodState {
  myListings: FoodItem[];
  allListings: FoodItem[];
  selectedItem: FoodItem | null;
  isLoading: boolean;
  error: string | null;
  fetchMyListings: (token: string) => Promise<void>;
  fetchListingById: (listingId: string) => Promise<void>;
  fetchAllListings: () => Promise<void>;
  createListing: (
    token: string,
    formData: Partial<FoodItemFormData>
  ) => Promise<FoodItem | null>;
  updateListing: (
    token: string,
    listingId: string,
    formData: FoodItemFormData
  ) => Promise<FoodItem | null>;
  clearSelectedItem: () => void;
  deleteListing: (token: string, listingId: string) => Promise<boolean>;
}

// Helper to build FormData for create/update
const buildFoodItemFormData = (data: Partial<FoodItemFormData>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "imageFile" && value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  // Append the file if it exists
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }
  return formData;
};

export const useFoodStore = create<FoodState>((set) => ({
  myListings: [],
  allListings: [],
  selectedItem: null,
  isLoading: false,
  error: null,

  fetchMyListings: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/food-listings/my/listings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const listings = response.data.data.map((item: any) => ({
        ListingID: item.listing.ListingID,
        Title: item.listing.title,
        Description: item.listing.description,
        FoodType: item.listing.foodType,
        Quantity: item.listing.quantity,
        DietaryInfo: item.listing.dietaryInfo,
        CookedDate: item.listing.cookedDate,
        IsDonation: item.listing.isDonation,
        Price: parseFloat(item.listing.price) || 0,
        ListingStatus: item.listing.listingStatus,
        ImagePath: item.listing.imagePath,
        CreatedAt: item.listing.createdAt,
        PickupWindowStart: item.listing.pickupWindowStart,
        PickupWindowEnd: item.listing.pickupWindowEnd,
        PickupLocation: item.listing.pickupLocation,
        isOrdered:
          item.listing.listingStatus === "ORDERED" ||
          item.listing.listingStatus === "COMPLETED",
      }));
      set({ myListings: listings, isLoading: false });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to fetch your food items."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchListingById: async (listingId: string) => {
    set({ isLoading: true, error: null, selectedItem: null });
    try {
      // Make request without authentication headers since this is a public route
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/food-listings/${listingId}`
      );

      if (response.data && response.data.status === "success") {
        // The API returns the item object directly in response.data.data
        const apiItemData = response.data.data;

        // --- THIS IS THE KEY MAPPING LOGIC ---
        const foodItem: FoodItem = {
          ...apiItemData, 
          Price: parseFloat(apiItemData.Price) || 0,
          originalPrice: parseFloat(apiItemData.originalPrice) || 0,
          currentPrice: apiItemData.currentPrice || 0,
        };

        set({ selectedItem: foodItem, isLoading: false });
      } else {
        throw new Error(
          response.data.message || "Failed to fetch item details."
        );
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Could not load this food item."
        : "An unexpected error occurred.";
      console.error("Fetch by ID error:", error);
      toast.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchAllListings: async () => {
    set({ isLoading: true, error: null });
    try {
      // Make request without authentication headers since this is a public route
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/food-listings/`
      );

      const listings: FoodItem[] = response.data.data.map((item: any) => ({
        ListingID: item.listing.ListingID,
        Title: item.listing.title,
        Description: item.listing.description,
        FoodType: item.listing.foodType,
        Quantity: item.listing.quantity,
        DietaryInfo: item.listing.dietaryInfo,
        CookedDate: item.listing.cookedDate,
        IsDonation: item.listing.isDonation,
        Price: parseFloat(item.listing.price) || 0,
        ListingStatus: item.listing.listingStatus,
        ImagePath: item.listing.imagePath,
        CreatedAt: item.listing.createdAt,
        PickupWindowStart: item.listing.pickupWindowStart,
        PickupWindowEnd: item.listing.pickupWindowEnd,
        PickupLocation: item.listing.pickupLocation,
        originalPrice: parseFloat(item.listing.originalPrice) || undefined,
        currentPrice: item.listing.currentPrice,
        discountApplied: item.listing.discountApplied,
        donor: item.donorSeller,
      }));

      set({ allListings: listings, isLoading: false });
    } catch (error) {
      const message = "Failed to fetch available food items.";
      console.error(message, error);
      toast.error(message);
      set({ error: message, isLoading: false });
    }
  },

  createListing: async (token, formData) => {
    set({ isLoading: true, error: null });
    try {
      const apiFormData = buildFoodItemFormData(formData);

      const response = await axios.post(
        `${API_CONFIG.baseURL}/api/food-listings/upload`,
        apiFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newListing = response.data.data.listing;
      set((state) => ({
        myListings: [newListing, ...state.myListings],
        isLoading: false,
      }));
      toast.success("Food item created successfully!");
      return newListing;
    } catch (error) {
      let errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to create food item."
        : "An unexpected error occurred.";

      if (axios.isAxiosError(error) && error.response) {
        console.error("API Validation Error Response:", error.response.data);

        const backendError =
          error.response.data?.message || error.response.data?.errors;
        if (typeof backendError === "string") {
          errorMessage = backendError;
        } else if (Array.isArray(backendError)) {
          errorMessage = backendError.join(", ");
        }
      }

      toast.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateListing: async (token, listingId, formData) => {
    set({ isLoading: true });
    try {
      const apiFormData = buildFoodItemFormData(formData);

      console.log("Updating FormData for API:");
      for (const [key, value] of apiFormData.entries()) {
        console.log(key, value);
      }
      const response = await axios.put(
        `${API_CONFIG.baseURL}/api/food-listings/${listingId}/update`,
        apiFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedListing = response.data.data;
      set((state) => ({
        myListings: state.myListings.map((item) =>
          item.ListingID === updatedListing.ListingID ? updatedListing : item
        ),
        isLoading: false,
      }));
      toast.success("Food item updated successfully!");
      return updatedListing;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update food item."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  clearSelectedItem: () => set({ selectedItem: null }),

  deleteListing: async (token, listingId) => {
    set({ isLoading: true });
    try {
      await axios.delete(
        `${API_CONFIG.baseURL}/api/food-listings/${listingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set((state) => ({
        myListings: state.myListings.filter(
          (item) => String(item.ListingID) !== listingId
        ),
        isLoading: false,
      }));
      toast.success("Food item deleted successfully.");
      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to delete food item."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
}));
