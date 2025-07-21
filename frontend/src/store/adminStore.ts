import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "./authStore";
import { API_CONFIG } from "@/config/api";
import type { AdminUser, DashboardStats, FoodListing, PendingCharity, PendingDelivery, ProcessVerificationPayload } from "@/lib/types/admin";

const getAuthHeaders = () => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error("Admin is not authenticated.");
    return { Authorization: `Bearer ${token}` };
}

interface AdminState {
  // State
  dashboardStats: DashboardStats | null;
  pendingCharities: PendingCharity[];
  pendingDelivery: PendingDelivery[];
  users: AdminUser[];
  foodListings: FoodListing[];
  isLoading: boolean;
  error: string | null;

  // Actions
  getDashboardStats: () => Promise<void>;
  getPendingVerifications: () => Promise<void>;
  processVerification: (
    payload: ProcessVerificationPayload
  ) => Promise<boolean>;
  getAllUsers: () => Promise<void>;
  suspendUser: (userId: number, reason: string) => Promise<boolean>;
  reactivateUser: (userId: number) => Promise<boolean>;
  getAllFoodListings: () => Promise<void>;
  removeFoodListing: (listingId: number, reason: string) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial State
  dashboardStats: null,
  pendingCharities: [],
  pendingDelivery: [],
  users: [],
  foodListings: [],
  isLoading: false,
  error: null,

  // --- API Actions ---
  getDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/admin/dashboard/stats`,
        { headers: getAuthHeaders() }
      );
      if (response.data.status === "success") {
        set({ dashboardStats: response.data.data, isLoading: false });
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to fetch dashboard stats."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
    }
  },

  getPendingVerifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/admin/verifications/pending`,
        { headers: getAuthHeaders() }
      );
      if (response.data.status === "success") {
        set({
          pendingCharities: response.data.data.pendingCharities,
          pendingDelivery: response.data.data.pendingDelivery,
          isLoading: false,
        });
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          "Failed to fetch pending verifications."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
    }
  },

  processVerification: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(
        `${API_CONFIG.baseURL}/api/admin/verifications/process`,
        payload,
        { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
      );
      toast.success(
        `Verification for user ${payload.userId} processed successfully!`
      );
      // Refresh the list after processing
      get().getPendingVerifications();
      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to process verification."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  getAllUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/admin/users`,
        { headers: getAuthHeaders() }
      );
      if (response.data.status === "success") {
        set({ users: response.data.data, isLoading: false });
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to fetch users."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
    }
  },

  suspendUser: async (userId, reason) => {
    set({ isLoading: true, error: null });
    try {
      await axios.put(
        `${API_CONFIG.baseURL}/api/admin/users/${userId}/suspend`,
        { reason },
        { headers: { ...getAuthHeaders(), "Content-Type": "application/json" } }
      );
      toast.success(`User ${userId} suspended successfully.`);
      // Refresh the user list to show the status change
      get().getAllUsers();
      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to suspend user."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  reactivateUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await axios.put(
        `${API_CONFIG.baseURL}/api/admin/users/${userId}/reactivate`,
        {},
        { headers: getAuthHeaders() }
      );
      toast.success(`User ${userId} reactivated successfully.`);
      get().getAllUsers();
      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to reactivate user."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  getAllFoodListings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/admin/food-listings`,
        { headers: getAuthHeaders() }
      );
      if (response.data.status === "success") {
        set({ foodListings: response.data.data, isLoading: false });
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to fetch food listings."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
    }
  },

  removeFoodListing: async (listingId, reason) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(
        `${API_CONFIG.baseURL}/api/admin/food-listings/${listingId}`,
        {
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          data: { reason },
        }
      );
      toast.success(`Food listing ${listingId} removed successfully.`);
      get().getAllFoodListings();
      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to remove food listing."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },
}));