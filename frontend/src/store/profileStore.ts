import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import type { UserProfileData } from "@/components/profile/UserProfile";
import type { AppUser } from "./authStore";

interface ProfileState {
  profile: UserProfileData | null;
  isLoading: boolean;
  error: string | null;
  initializeProfile: (authUser: AppUser) => void;
  fetchFullProfile: (token: string) => Promise<void>;
  completeProfile: (token: string, requestBody: Partial<UserProfileData>) => Promise<boolean>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  initializeProfile: (authUser) => {
    const baseProfile: UserProfileData = {
      id: authUser.id,
      fullName: authUser.fullName,
      email: authUser.email,
      phoneNumber: authUser.phoneNumber,
      role: authUser.role,
      isProfileComplete: authUser.isProfileComplete || false,
    };
    set({ profile: baseProfile, isLoading: false, error: null });

    if (
      !baseProfile.isProfileComplete &&
      !toast.isActive("complete-profile-reminder")
    ) {
      toast.info("Please complete your profile to access all features!", {
        toastId: "complete-profile-reminder",
      });
    }
  },

  fetchFullProfile: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        "http://localhost:4000/api/profile/get-profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Full Profile Data:", response.data.data);
      if (response.data && response.data.status === "success") {
        console.log("Full Profile Data:", response.data.data);
        const { user, profile, profileCompleted } = response.data.data;
        set({
          profile: {
            id: String(user.UserID),
            fullName: user.Username,
            email: user.Email,
            phoneNumber: user.PhoneNumber,
            role: user.Role,
            isProfileComplete: profileCompleted,
            ...profile,
          },
          isLoading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch profile.");
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to load profile details."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
    }
  },

  completeProfile: async (token, requestBody) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        "http://localhost:4000/api/profile/complete",
        requestBody,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.status === "success") {
        toast.success(response.data.message || "Profile updated successfully!");
        const { user: updatedUser, profile: updatedProfileDetails } =
          response.data.data;
        console.log(response.data.data);

        // Update this store with the new, complete profile data
        set({
          profile: {
            id: String(updatedUser.UserID),
            fullName: updatedUser.Username,
            email: updatedUser.Email,
            phoneNumber: updatedUser.PhoneNumber,
            role: updatedUser.Role,
            isProfileComplete: updatedUser.isProfileComplete,
            ...updatedProfileDetails,
          },
          isLoading: false,
        });

        
        return true;
      } else {
        throw new Error(response.data.message || "Update failed.");
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update profile."
        : "An unexpected error occurred.";
      toast.error(errorMessage);
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  clearProfile: () => set({ profile: null, isLoading: false, error: null }),
}));
