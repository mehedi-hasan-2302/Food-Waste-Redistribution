import React from "react";
import BuyerProfileDetails from "./BuyerProfileDetails";
import CharityOrgProfileDetails from "./CharityOrgProfileDetails";
import VolunteerProfileDetails from "./VolunteerProfileDetails";
import DonorSellerProfileDetails from "./DonorSellerProfileDetails";
import ProfileDetailItem from "./ProfileDetailItem";
import {
  UserCircle,
  Briefcase,
  ShieldCheck,
  HeartHandshake,
  ShoppingBag,
} from "lucide-react";

export interface UserProfileData {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  role: "BUYER" | "CHARITY_ORG" | "VOLUNTEER" | "DONOR_SELLER" | string;
  isProfileComplete: boolean;

  defaultDeliveryAddress?: string;
  organizationName?: string;
  organizationAddress?: string;
  govRegDocumentUrl?: string;
  selfieImageUrl?: string;
  nidImageUrl?: string;
  operatingAreas?: string[];
  businessName?: string;
}

interface UserProfileProps {
  user: UserProfileData;
  // In a real app, this would trigger API call and update global state
  onProfileUpdate: (role: UserProfileData["role"], data: unknown) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onProfileUpdate }) => {
  const handleRoleProfileSubmit = (formData: unknown) => {
    console.log("Submitting role-specific profile data:", formData);
    onProfileUpdate(user.role, formData);
    alert(
      "Profile data submitted (simulated). Please refresh or update props to see changes."
    );
  };

  const getRoleSpecifics = () => {
    const isEditing = !user.isProfileComplete;

    switch (user.role) {
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
              defaultDeliveryAddress={user.defaultDeliveryAddress}
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
              organizationName={user.organizationName}
              organizationAddress={user.organizationAddress}
              govRegDocumentUrl={user.govRegDocumentUrl}
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
              selfieImageUrl={user.selfieImageUrl}
              nidImageUrl={user.nidImageUrl}
              operatingAreas={user.operatingAreas}
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
              businessName={user.businessName}
              isEditing={isEditing}
              onSubmitProfile={handleRoleProfileSubmit}
            />
          ),
        };
      default:
        return {

        };
    }
  };

  const roleSpecifics = getRoleSpecifics();

  return (
    <div className="font-sans max-w-5xl mx-auto">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-pale-mint mb-6 md:mb-8">
        <div className="flex items-center justify-between border-b border-brand-green/30 pb-4 mb-5 md:mb-6">
          <div className="flex items-center space-x-3">
            <UserCircle className="h-7 w-7 md:h-8 md:w-8 text-brand-green flex-shrink-0" />
            <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-semibold text-dark-text">
              General Information
            </h2>
          </div>
        </div>
        <dl className="divide-y divide-pale-mint">
          <ProfileDetailItem label="Full Name" value={user.fullName} />
          <ProfileDetailItem label="Email Address" value={user.email} />
          <ProfileDetailItem label="Phone Number" value={user.phoneNumber} />
          <ProfileDetailItem label="Address" value={user.address} />
          <ProfileDetailItem
            label="Role"
            value={user.role
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          />
        </dl>
      </div>

      {/* Role-Specific Information Section (Form or Display) */}
      {roleSpecifics && ( // Check if roleSpecifics is defined
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-pale-mint">
          <div className="flex items-center space-x-3 border-b border-highlight/30 pb-4 mb-5 md:mb-6">
            {roleSpecifics.icon}
            <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-semibold text-dark-text">
              {roleSpecifics.title}
            </h2>
          </div>
          {roleSpecifics.details}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
