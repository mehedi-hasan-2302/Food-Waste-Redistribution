import React, { useState } from "react";
import ProfileDetailItem from "./ProfileDetailItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DonorSellerFormData {
  businessName: string;
}

interface DonorSellerProfileDetailsProps {
  businessName?: string;
  isEditing: boolean;
  onSubmitProfile: (formData: DonorSellerFormData) => void;
}

const DonorSellerProfileDetails: React.FC<DonorSellerProfileDetailsProps> = ({
  businessName: initialBusinessName,
  isEditing,
  onSubmitProfile,
}) => {
  const [businessName, setBusinessName] = useState(initialBusinessName || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitProfile({ businessName });
  };

  if (!isEditing) {
    return (
      <>
        <ProfileDetailItem label="Business Name" value={initialBusinessName} />
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div>
        <Label
          htmlFor="businessName"
          className="text-base font-medium text-brand-green"
        >
          Business Name
        </Label>
        <Input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="mt-1 text-base"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full sm:w-auto bg-highlight hover:bg-highlight/90 text-white text-base py-2.5 px-6"
      >
        Save Business Details
      </Button>
    </form>
  );
};
export default DonorSellerProfileDetails;
