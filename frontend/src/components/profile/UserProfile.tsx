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
import OrgVolunteerProfileDetails from "./OrgVolunteerProfileDetails";

export interface UserProfileData {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: "BUYER" | "CHARITY_ORG" | "INDEP_DELIVERY" | "DONOR_SELLER" | "ORG_VOLUNTEER" | string;
  isProfileComplete: boolean;

  DefaultDeliveryAddress?: string;
  OrganizationName?: string;
  AddressLine1?: string;
  GovRegistrationDocPath?: string;
  SelfiePath?: string;
  NIDPath?: string;
  OperatingAreas?: string[];
  BusinessName?: string;
  CharityOrgID?: number;
  charityOrg?: {
    ProfileID: number;
  };
}

interface UserProfileProps {
  onProfileUpdate: (role: UserProfileData["role"], data: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onProfileUpdate }) => {

  const profile = useProfileStore((state) => state.profile);

  if (!profile) return null;

  const handleRoleProfileSubmit = (formData: unknown) => {
    console.log(
      "[UserProfile]: Passing data through to parent page...",
      formData
    );
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
            <BuyerProfileDetails onSubmitProfile={handleRoleProfileSubmit} />
          ),
        };
      case "CHARITY_ORG":
        return {
          icon: (
            <ShieldCheck className="h-7 w-7 md:h-8 md:w-8 text-highlight" />
          ),
          title: isEditing
            ? "Complete Charity Profile"
            : "Charity Information",
          details: (
            <CharityOrgProfileDetails
              onSubmitProfile={handleRoleProfileSubmit}
            />
          ),
        };
      case "INDEP_DELIVERY":
        return {
          icon: (
            <HeartHandshake className="h-7 w-7 md:h-8 md:w-8 text-highlight" />
          ),
          title: isEditing
            ? "Complete Volunteer Profile"
            : "Volunteer Information",
          details: (
            <VolunteerProfileDetails
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
      case "ORG_VOLUNTEER":
        return {
          icon: <HeartHandshake className="h-7 w-7 md:h-8 md:w-8 text-highlight" />,
          title: isEditing
            ? "Complete Organization Volunteer Profile"
            : "Organization Volunteer Information",
          details: (
            <OrgVolunteerProfileDetails
              onSubmitProfile={handleRoleProfileSubmit}
            />
          ),
        }
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
        <div className="flex items-center justify-between border-b border-brand-green/30 pb-4 mb-5 md:mb-6"></div>
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
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-pale-mint">
        <div className="flex items-center space-x-3 border-b border-highlight/30 pb-4 mb-6">
          {roleSpecifics.icon}
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-dark-text">
            {roleSpecifics.title}
          </h2>
        </div>
        {roleSpecifics.details}
      </div>
    </div>
  );
};

export default UserProfile;
