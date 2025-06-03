import { useState } from "react";
import UserProfile from "@/components/profile/UserProfile";
import type { UserProfileData } from "@/components/profile/UserProfile";

// const initialSampleCharity: UserProfileData = {
//   fullName: "Jane Smith (Charity Rep)",
//   phoneNumber: "01987654321",
//   email: "jane.charity@example.org",
//   address: "456 Charity Ave, Dhaka",
//   role: "CHARITY_ORG",
//   isProfileComplete: false, 
//   organizationName: undefined,
//   organizationAddress: undefined,
//   govRegDocumentUrl: undefined,
// };

// const initialSampleVolunteer: UserProfileData = {
//   fullName: "Alex Green (Volunteer)",
//   phoneNumber: "01555555555",
//   email: "alex.volunteer@example.net",
//   address: "101 Service Ln, Dhaka",
//   role: "VOLUNTEER",
//   isProfileComplete: false,
//   operatingAreas: undefined,
// };

// const sampleDonorSeller: UserProfileData = {
//   fullName: "Samina Khan (Donor/Seller)",
//   phoneNumber: "01711223344",
//   email: "samina.seller@example.com",
//   address: "202 Commerce Rd, Dhaka",
//   role: "DONOR_SELLER",
//   isProfileComplete: false,
//   businessName: undefined,
// };

const sampleBuyer: UserProfileData = {
  fullName: "John Doe (Buyer)",
  phoneNumber: "01234567890",
  email: "john.buyer@example.com",
  address: "123 Buyer St, Apt 4B, Dhaka",
  role: "BUYER",
  isProfileComplete: false,
  defaultDeliveryAddress: undefined,
};

const UserProfilePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfileData>(sampleBuyer);

  const handleProfileUpdate = (
    role: UserProfileData["role"],
    submittedData: any
  ) => {
    console.log(`Simulating update for ${role} with data:`, submittedData);

    setCurrentUser((prevUser) => {
      if (!prevUser || prevUser.role !== role) return prevUser;

      let updatedProfileData = {};
      if (role === "CHARITY_ORG") {
        updatedProfileData = {
          organizationName: submittedData.organizationName,
          organizationAddress: submittedData.organizationAddress,
          govRegDocumentUrl: submittedData.govRegDocument
            ? `docs/${submittedData.govRegDocument.name}`
            : prevUser.govRegDocumentUrl,
        };
      } else if (role === "VOLUNTEER") {
        updatedProfileData = {
          operatingAreas: submittedData.operatingAreas
            .split(",")
            .map((s: string) => s.trim()),
          selfieImageUrl: submittedData.selfieImage
            ? `images/${submittedData.selfieImage.name}`
            : prevUser.selfieImageUrl,
          nidImageUrl: submittedData.nidImage
            ? `images/${submittedData.nidImage.name}`
            : prevUser.nidImageUrl,
        };
      }

      return {
        ...prevUser,
        ...updatedProfileData,
        isProfileComplete: true,
      };
    });
  };


  return (
    <div className="bg-pale-mint min-h-screen py-8 sm:py-12 px-4">
      <UserProfile user={currentUser} onProfileUpdate={handleProfileUpdate} />
    </div>
  );
};

export default UserProfilePage;