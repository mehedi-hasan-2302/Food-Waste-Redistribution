// src/components/profile/CharityOrgProfileDetails.tsx
import { useEffect, useState, type FormEvent } from "react";
import ProfileDetailItem from "./ProfileDetailItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileStore } from "@/store/profileStore";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface CharityApiRequestBody {
  OrganizationName: string;
  AddressLine1: string;
  GovRegistrationDocPath: string;
}

interface CharityOrgProfileDetailsProps {
  onSubmitProfile: (requestBody: CharityApiRequestBody) => void;
}

const CharityOrgProfileDetails: React.FC<CharityOrgProfileDetailsProps> = ({
  onSubmitProfile,
}) => {
  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);

  const [orgName, setOrgName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [docPath, setDocPath] = useState("");

  useEffect(() => {
    setOrgName(profile?.OrganizationName || "");
    setOrgAddress(profile?.AddressLine1 || "");
    setDocPath(profile?.GovRegistrationDocPath || "");
  }, [profile?.OrganizationName, profile?.AddressLine1, profile?.GovRegistrationDocPath]);  

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orgName.trim() || !orgAddress.trim() || !docPath.trim()) {
      toast.error("All fields, including the document URL, are required.");
      return;
    }
    onSubmitProfile({
      OrganizationName: orgName,
      AddressLine1: orgAddress,
      GovRegistrationDocPath: docPath,
    });
  };

  if (profile?.isProfileComplete) {
    return (
      <>
        <ProfileDetailItem
          label="Organization Name"
          value={profile?.OrganizationName}
        />
        <ProfileDetailItem
          label="Organization Address"
          value={profile?.AddressLine1}
        />
  
        <ProfileDetailItem
          label="Govt. Registration Doc."
          value={
            profile?.GovRegistrationDocPath ? (
              <a href={profile?.GovRegistrationDocPath}>View Document</a>
            ) : (
              "Not Provided"
            )
          }
        />

      </>
    );
  }

  // The form for an incomplete profile.
  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div>
        <Label
          htmlFor="orgName"
          className="text-base font-medium text-brand-green"
        >
          Organization Name
        </Label>
        <Input
          id="orgName"
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="mt-1 text-base"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label
          htmlFor="orgAddress"
          className="text-base font-medium text-brand-green"
        >
          Organization Address
        </Label>
        <Input
          id="orgAddress"
          type="text"
          value={orgAddress}
          onChange={(e) => setOrgAddress(e.target.value)}
          className="mt-1 text-base"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label
          htmlFor="govRegDocument"
          className="text-base font-medium text-brand-green"
        >
          Government Registration Document (PDF, Image)
        </Label>
        <Input
          id="govRegDocumentUrl"
          type="text"
          value={docPath}
          onChange={(e) => setDocPath(e.target.value)}
          className="mt-1 text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pale-mint file:text-brand-green hover:file:bg-brand-green/20"
          accept=".pdf,.jpg,.jpeg,.png"
          required
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        className="w-full sm:w-auto bg-highlight hover:bg-highlight/90 text-white text-base py-2.5 px-6"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Charity Details
      </Button>
    </form>
  );
};

export default CharityOrgProfileDetails;