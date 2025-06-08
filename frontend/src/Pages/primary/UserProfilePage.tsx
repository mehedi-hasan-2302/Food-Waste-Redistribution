import { useEffect } from "react";
import UserProfile from "@/components/profile/UserProfile";
import type { UserProfileData } from "@/components/profile/UserProfile";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const UserProfilePage: React.FC = () => {
  const {
    user: authUser,
    token,
    isAuthenticated,
    updateProfileCompletionStatus,
  } = useAuthStore();
  const {
    profile,
    isLoading,
    initializeProfile,
    fetchFullProfile,
    completeProfile,
  } = useProfileStore();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      navigate("/login");
      return;
    }

    if (authUser.isProfileComplete) {
      fetchFullProfile(token!);
    } else {
      initializeProfile(authUser);
    }
  }, [
    authUser,
    isAuthenticated,
    navigate,
    token,
    fetchFullProfile,
    initializeProfile,
  ]);

  const handleProfileUpdate = async (
    role: UserProfileData["role"],
    submittedData: any
  ) => {
    if (!token) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    const payload = submittedData;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const wasSuccessful = await completeProfile(token, payload, headers);

    if (wasSuccessful) {
      updateProfileCompletionStatus(true);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="bg-pale-mint min-h-screen flex items-center justify-center text-dark-text">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading user profile...
      </div>
    );
  }
  
  return (
    <div className="bg-pale-mint min-h-screen py-8 sm:py-12 px-4">
      <UserProfile onProfileUpdate={handleProfileUpdate} />
    </div>
  );
};

export default UserProfilePage;
