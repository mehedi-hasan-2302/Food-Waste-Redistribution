import { useEffect } from "react";
import UserProfile from "@/components/profile/UserProfile";
import type { UserProfileData } from "@/components/profile/UserProfile";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const UserProfilePage: React.FC = () => {
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const updateProfileCompletionStatus = useAuthStore(
    (state) => state.updateProfileCompletionStatus
  );


  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);
  const initializeProfile = useProfileStore(
    (state) => state.initializeProfile
  );
  const fetchFullProfile = useProfileStore((state) => state.fetchFullProfile);
  const completeProfile = useProfileStore((state) => state.completeProfile);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || !authUser) {
      navigate("/login");
      return;

    } 
    if (authUser.isProfileComplete) {
      console.log("Profile already complete, no need to fetch full profile.");
      fetchFullProfile(token!);
    } else {
      initializeProfile(authUser);
    }

  }, [
    authUser,
    isAuthenticated,
    token,
    initializeProfile,
    fetchFullProfile,
    navigate,
  ]);

  const handleProfileUpdate = async (
    role: UserProfileData["role"],
    submittedData: any
  ) => {
    if (!token) {
      toast.error("You must be logged in to update your profile.");
      return;
    }
    
    const currentProfile = useProfileStore.getState().profile;
    if (!currentProfile) {
      toast.error("Profile data not available. Please refresh.");
      return;
    }

    const payload = {
      ...submittedData,
    };

    if (role === "INDEP_DELIVERY") {
      payload.FullName = currentProfile.fullName;
    }
    if(role === "ORG_VOLUNTEER") {
      payload.VolunteerName = authUser?.fullName;
      payload.VolunteerContactPhone = authUser?.phoneNumber;
    }

    const wasSuccessful = await completeProfile(token, payload);

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
