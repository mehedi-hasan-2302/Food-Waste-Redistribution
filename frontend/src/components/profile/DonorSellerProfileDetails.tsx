import { useState, useEffect, type FormEvent } from "react";
import ProfileDetailItem from "./ProfileDetailItem";
import {  useProfileStore } from "@/store/profileStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";


interface DonorSellerFormData {
  BusinessName: string;
}

interface DonorSellerProfileDetailsProps {
  onSubmitProfile: (formData: DonorSellerFormData) => void;
}

const DonorSellerProfileDetails: React.FC<DonorSellerProfileDetailsProps> = ({
  onSubmitProfile,
}) => {
  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);

  const [businessName, setBusinessName] = useState<string>("");

  useEffect(() => {
    setBusinessName(profile?.BusinessName || "");
  }, [profile?.BusinessName])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requestBody = {
      BusinessName: businessName,
    };
    onSubmitProfile(requestBody);
  };

  if (profile?.isProfileComplete) {
    return (
      <>
        <ProfileDetailItem label="Business Name" value={profile?.BusinessName || "Not Provided"} />
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
          placeholder="Enter your business name"
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        className="w-full sm:w-auto bg-highlight hover:bg-highlight/90 text-white text-base py-2.5 px-6"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Business Details
      </Button>
    </form>
  );
};
export default DonorSellerProfileDetails;
