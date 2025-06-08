import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import type { FoodItem, FoodItemFormData } from "@/lib/types/FoodItem";

interface FoodState {
  myListings: FoodItem[];
  allListings: FoodItem[];
  selectedItem: FoodItem | null;
  isLoading: boolean;
  error: string | null;
  fetchMyListings: (token: string) => Promise<void>;
  fetchListingById: (token: string, listingId: string) => Promise<void>;
  fetchAllListings: (token: string) => Promise<void>;
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
        "http://localhost:4000/api/food-listings/my/listings",
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
    } catch (error: any) {
      const message = "Failed to fetch your food items.";
      toast.error(error.message);
      set({ error: message, isLoading: false });
    }
  },

  fetchListingById: async (token, listingId) => {
    set({ isLoading: true, error: null, selectedItem: null });
    try {
      const response = await axios.get(
        `http://localhost:4000/api/food-listings/${listingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Could not load this food item.";
      console.error("Fetch by ID error:", error);
      toast.error(message);
      set({ error: message, isLoading: false });
    }
  },

  fetchAllListings: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        "http://localhost:4000/api/food-listings/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const listings: FoodItem[] = response.data.data.map((item: any) => ({
        ListingID: item.listing.ListingId, 
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
        "http://localhost:4000/api/food-listings/upload",
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
    } catch (error: any) {
      // --- ERROR HANDLING ---
      let errorMessage = "Failed to create food item. Please try again.";

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
        `http://localhost:4000/api/food-listings/${listingId}/update`,
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
    } catch (error: any) {
      const message = "Failed to update food item.";
      toast.error(error.message);
      set({ error: message, isLoading: false });
      return null;
    }
  },

  clearSelectedItem: () => set({ selectedItem: null }),

  deleteListing: async (token, listingId) => {
    set({ isLoading: true });
    try {
      await axios.delete(
        `http://localhost:4000/api/food-listings/${listingId}`,
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
    } catch (error: any) {
      const message = "Failed to delete food item.";
      toast.error(error.message);
      set({ error: message, isLoading: false });
      return false;
    }
  },
}));
