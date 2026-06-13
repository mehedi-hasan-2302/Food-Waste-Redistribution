import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/store/authStore";

interface ReportIssuePayload {
  orderId?: number | string;
  claimId?: number | string;
  message: string;
}

interface FeedbackState {
  isLoading: boolean;
  error: string | null;
  reportIssue: (payload: ReportIssuePayload) => Promise<boolean>;
}

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("User is not authenticated.");
  return { Authorization: `Bearer ${token}` };
};

export const useFeedbackStore = create<FeedbackState>((set) => ({
  isLoading: false,
  error: null,

  reportIssue: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(
        `${API_CONFIG.baseURL}${API_ENDPOINTS.feedback.createComplaint}`,
        payload,
        {
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        }
      );
      toast.success("Issue reported to admin.");
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Could not report this issue."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },
}));
