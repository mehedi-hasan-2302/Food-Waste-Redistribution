// src/components/profile/OrgVolunteerProfileDetails.tsx (Create this new file)
import { useState, useEffect, type FormEvent } from "react";
import ProfileDetailItem from "./ProfileDetailItem";
import { useProfileStore } from "@/store/profileStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/authStore";

// Data this form will submit
interface OrgVolunteerFormData {
  CharityOrgID: number;
  VolunteerName: string;
  VolunteerContactPhone: string;
}

interface OrgVolunteerProfileDetailsProps {
  onSubmitProfile: (requestBody: OrgVolunteerFormData) => void;
}

const OrgVolunteerProfileDetails: React.FC<OrgVolunteerProfileDetailsProps> = ({
  onSubmitProfile,
}) => {
  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);
  const authUser = useAuthStore((state) => state.user);
  // Local state for the form inputs
  const [charityOrgId, setCharityOrgId] = useState<number | string>("");

  useEffect(() => {
    // Pre-fill the form with existing data if available
    // NOTE: These fields like 'CharityOrgID' are not on the base profile object.
    // They would be pre-filled if fetched from the /get-profile API.
    // For now, they initialize as empty.
    setCharityOrgId(profile?.CharityOrgID || "");
  }, [profile]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!charityOrgId) {
      toast.error("All fields are required.");
      return;
    }
    const orgVolunteerInfo: OrgVolunteerFormData = {
        CharityOrgID: Number(charityOrgId),
        VolunteerName: authUser?.fullName || "",
        VolunteerContactPhone: authUser?.phoneNumber || "",
    }
    onSubmitProfile(orgVolunteerInfo);
  };
  if (profile?.isProfileComplete) {
    return (
      <div className="space-y-4">
        <ProfileDetailItem
          label="Affiliated Charity ID"
          value={profile.charityOrg?.ProfileID}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div>
        <Label
          htmlFor="CharityOrgID"
          className="text-base font-medium text-brand-green"
        >
          Affiliated Charity Organization ID
        </Label>
        <Input
          id="CharityOrgID"
          type="number"
          value={charityOrgId}
          onChange={(e) => setCharityOrgId(e.target.value)}
          placeholder="Enter the ID of your organization"
          className="mt-1 text-base"
          required
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto bg-highlight text-white"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Volunteer Details
      </Button>
    </form>
  );
};

export default OrgVolunteerProfileDetails;
