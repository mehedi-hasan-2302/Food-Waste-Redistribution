import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import type { Order, CreateOrderPayload } from "@/lib/types/order";

interface OrderState {
  myOrders: Order[];
  isLoading: boolean;
  error: string | null;
  createOrder: (
    listingId: number,
    orderDetails: CreateOrderPayload,
    token: string
  ) => Promise<boolean>;
}

export const useOrderStore = create<OrderState>((set) => ({
  myOrders: [],
  isLoading: false,
  error: null,


  createOrder: async (listingId, orderDetails, token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `http://localhost:4000/api/orders/${listingId}/create-order`,
        orderDetails,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
}));
