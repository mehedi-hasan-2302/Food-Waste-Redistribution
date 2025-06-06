import React from "react";
import BuyerProfileDetails from "./BuyerProfileDetails";
import CharityOrgProfileDetails from "./CharityOrgProfileDetails";
import VolunteerProfileDetails from "./VolunteerProfileDetails";
import DonorSellerProfileDetails from "./DonorSellerProfileDetails";
import { useProfileStore } from "@/store/profileStore";
import {
  UserCircle,
  Briefcase,
  ShieldCheck,
  HeartHandshake,
  ShoppingBag,
} from "lucide-react";
import ProfileDetailItem from "./ProfileDetailItem";

export interface UserProfileData {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: "BUYER" | "CHARITY_ORG" | "VOLUNTEER" | "DONOR_SELLER" | string;
  isProfileComplete: boolean;

  defaultDeliveryAddress?: string;
  organizationName?: string;
  organizationAddress?: string;
  govRegDocumentUrl?: string;
  selfieImageUrl?: string;
  nidImageUrl?: string;
  operatingAreas?: string[];
  BusinessName?: string;
}

interface UserProfileProps {
  onProfileUpdate: (role: UserProfileData["role"], data: unknown) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onProfileUpdate }) => {

  const profile = useProfileStore((state) => state.profile);

  if (!profile) return null;

  const handleRoleProfileSubmit = (formData: unknown) => {
    onProfileUpdate(profile.role, formData);
  };

  const getRoleSpecifics = () => {
    const isEditing = !profile.isProfileComplete;

    switch (profile.role) {
      case "BUYER":
        return {
          icon: (
            <ShoppingBag className="h-7 w-7 md:h-8 md:w-8 text-highlight" />
          ),
          title: isEditing
            ? "Complete Your Buyer Profile"
            : "Buyer Information",
          details: (
            <BuyerProfileDetails
              defaultDeliveryAddress={profile.defaultDeliveryAddress}
              isEditing={isEditing}
              onSubmitProfile={handleRoleProfileSubmit}
            />
          ),
        };
      case "CHARITY_ORG":
        return {
          icon: (
            <ShieldCheck className="h-7 w-7 md:h-8 md:w-8 text-highlight" />
          ),
          title: isEditing
            ? "Complete Charity Organization Profile"
            : "Charity Organization Information",
          details: (
            <CharityOrgProfileDetails
              organizationName={profile.organizationName}
              organizationAddress={profile.organizationAddress}
              govRegDocumentUrl={profile.govRegDocumentUrl}
              isEditing={isEditing}
              onSubmitProfile={handleRoleProfileSubmit}
            />
          ),
        };
      case "VOLUNTEER":
        return {
          icon: (
            <HeartHandshake className="h-7 w-7 md:h-8 md:w-8 text-highlight" />
          ),
          title: isEditing
            ? "Complete Volunteer Profile"
            : "Volunteer Information",
          details: (
            <VolunteerProfileDetails
              selfieImageUrl={profile.selfieImageUrl}
              nidImageUrl={profile.nidImageUrl}
              operatingAreas={profile.operatingAreas}
              isEditing={isEditing}
              onSubmitProfile={handleRoleProfileSubmit}
            />
          ),
        };
      case "DONOR_SELLER":
        return {
          icon: <Briefcase className="h-7 w-7 md:h-8 md:w-8 text-highlight" />,
          title: isEditing
            ? "Complete Business Profile"
            : "Business Information",
          details: (
            <DonorSellerProfileDetails
              onSubmitProfile={handleRoleProfileSubmit}
            />
          ),
        };
      default:
        return {
          icon: <UserCircle className="h-7 w-7 md:h-8 md:w-8 text-gray-400" />,
          title: "Role Specific Information",
          details: (
            <p className="text-gray-500">
              No specific profile section for this role or role not recognized.
            </p>
          ),
        };
    }
  };

  const roleSpecifics = getRoleSpecifics();

  return (
    <div className="font-sans max-w-5xl mx-auto">
      {/* Profile Incomplete Banner */}
      {!profile.isProfileComplete && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 md:mb-8 rounded-md"
          role="alert"
        >
          <p className="font-bold">Action Required</p>
          <p>Please complete your profile to access all features.</p>
        </div>
      )}

      {/* General Information Display */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-pale-mint mb-6 md:mb-8">
        <div className="flex items-center justify-between border-b border-brand-green/30 pb-4 mb-5 md:mb-6">
        </div>
        <dl className="divide-y divide-pale-mint">
          <ProfileDetailItem label="Full Name" value={profile.fullName} />
          <ProfileDetailItem label="Email Address" value={profile.email} />
          <ProfileDetailItem label="Phone Number" value={profile.phoneNumber} />
          <ProfileDetailItem
            label="Role"
            value={profile.role
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          />
        </dl>
      </div>

      {/* Role-Specific Section */}
      {roleSpecifics && roleSpecifics.details && (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-pale-mint">
          {/* ... role specifics header */}
          {roleSpecifics.details}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
