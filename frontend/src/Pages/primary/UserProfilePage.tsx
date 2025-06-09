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
    if (isAuthenticated() && authUser) {
      if(authUser.isProfileComplete) {
        fetchFullProfile(token!);
      } else {
        initializeProfile(authUser);
      }

    } else {
      toast.error("You must be logged in to view your profile.");
      navigate("/login");
      return;
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

    const formData = new FormData();
    let requestBodyJson: any = {};
    let hasFiles = false;

    switch (role) {
      case "BUYER":
        requestBodyJson = {
          DefaultDeliveryAddress: submittedData.DefaultDeliveryAddress,
        };
        break;
      case "DONOR_SELLER":
        requestBodyJson = { BusinessName: submittedData.BusinessName };
        break;
      case "CHARITY_ORG": {
        hasFiles = !!submittedData.govRegDocument;
        if (submittedData.govRegDocument) {
          formData.append("govRegDocumentFile", submittedData.govRegDocument);
        }
        requestBodyJson = {
          OrganizationName: submittedData.OrganizationName,
          AddressLine1: submittedData.AddressLine1,
        };
        break;
      }
      case "INDEP_DELIVERY": {
        hasFiles = !!submittedData.selfieImage || !!submittedData.nidImage;
        if (submittedData.selfieImage) {
          formData.append("selfieImageFile", submittedData.selfieImage);
        }
        if (submittedData.nidImage) {
          formData.append("nidImageFile", submittedData.nidImage);
        }
        requestBodyJson = {
          FullName: profile!.fullName, // Get FullName from the existing profile
          OperatingAreas: submittedData.OperatingAreas,
          SelfiePath: submittedData.SelfiePath, // Assuming URL string
          NIDPath: submittedData.NIDPath, // Assuming URL string
        };
        break;
      }
      default:
        toast.error(`Update not configured for role: ${role}`);
        return;
    }

    let payload: FormData | object;
    const headers: { [key: string]: string } = {
      Authorization: `Bearer ${token}`,
    };

    if (hasFiles) {
      formData.append("data", JSON.stringify(requestBodyJson));
      payload = formData;
    } else {
      payload = requestBodyJson;
      headers["Content-Type"] = "application/json";
    }

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
