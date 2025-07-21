import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import { API_CONFIG } from "@/config/api";
import type { Order, CreateOrderPayload, CreateClaimPayload } from "@/lib/types/order";
import { useAuthStore } from "./authStore";

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("User is not authenticated.");
  return { Authorization: `Bearer ${token}` };
};

interface OrderState {
  myOrders: Order[];
  mySales: Order[];
  myDeliveries: Order[];
  isLoading: boolean;
  error: string | null;
  // Buyer/Charity Actions
  createOrder: (
    listingId: string,
    details: CreateOrderPayload,
  ) => Promise<Order | null>;
  createClaim: (
    listingId: string,
    details: CreateClaimPayload,
  ) => Promise<Order | null>;

  // Seller/Donor Actions
  authorizePickup: (
    orderId: string,
    pickupCode: string,
    isDonation?: boolean
  ) => Promise<boolean>;
  completeDelivery: (
    orderId: string,
    isDonation?: boolean
  ) => Promise<boolean>;
}


export const useOrderStore = create<OrderState>((set) => ({
  myOrders: [],
  mySales: [],
  myDeliveries: [],
  isLoading: false,
  error: null,

  createOrder: async (listingId, orderDetails) => {
    set({ isLoading: true, error: null });
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const response = await axios.post(
        `${API_CONFIG.baseURL}/api/orders/${listingId}/create-order`,
        orderDetails,
        {
          headers
        }
      );

      if (response.data && response.data.status === "success") {
        toast.success("Order placed successfully!");

        const newOrder = response.data.data;
        set((state) => ({
          myOrders: [newOrder, ...state.myOrders],
          isLoading: false,
        }));
        return newOrder;
      } else {
        throw new Error(response.data.message || "Failed to create order.");
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Could not place order."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
      return null;
    }
  },

  createClaim: async (listingId, claimDetails) => {
    set({ isLoading: true, error: null });
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const response = await axios.post(
        `${API_CONFIG.baseURL}/api/donations/${listingId}/create-claim`,
        claimDetails,
        {
          headers,
        }
      );
      if (response.data && response.data.status === "success") {
        toast.success("Donation claimed successfully!");
        const newClaim = response.data.data;
        set((state) => ({
          myOrders: [newClaim, ...state.myOrders],
          isLoading: false,
        })); // Add to the same list for now
        return newClaim;
      } else {
        throw new Error(response.data.message || "Failed to claim donation.");
      }
    } catch (error) {
      console.log("Error creating claim:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Could not claim donation."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      return null;
    }
  },

  // --- SELLER / DONOR ACTIONS ---

  authorizePickup: async (orderId, pickupCode, isDonation = false) => {
    set({ isLoading: true, error: null });
    const endpoint = isDonation
      ? `${API_CONFIG.baseURL}/api/donations/${orderId}/authorize-pickup`
      : `${API_CONFIG.baseURL}/api/orders/${orderId}/authorize-pickup`;
    try {
      await axios.post(
        endpoint,
        { pickupCode },
        {
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        }
      );
      toast.success("Pickup authorized successfully!");
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Pickup authorization failed."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  // --- VOLUNTEER ACTIONS ---

  completeDelivery: async ( orderId, isDonation = false) => {
    set({ isLoading: true, error: null });
    const endpoint = isDonation
      ? `${API_CONFIG.baseURL}/api/donations/${orderId}/complete-delivery`
      : `${API_CONFIG.baseURL}/api/orders/${orderId}/complete-delivery`;
    try {
      await axios.post(
        endpoint,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      toast.success("Delivery marked as complete!");
      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Could not complete delivery."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },
}));
