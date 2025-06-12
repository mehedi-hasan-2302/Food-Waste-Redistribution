import { useEffect, useState, type FormEvent } from "react";
import ProfileDetailItem from "./ProfileDetailItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileStore } from "@/store/profileStore";
import { Loader2 } from "lucide-react";

interface BuyerFormData {
  DefaultDeliveryAddress: string;
}

interface BuyerProfileDetailsProps {
  onSubmitProfile: (requestBody: BuyerFormData) => void;
}

const BuyerProfileDetails: React.FC<BuyerProfileDetailsProps> = ({
  onSubmitProfile,
}) => {
  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);
  const [address, setAddress] = useState("");

  useEffect(() => {
    setAddress(profile?.DefaultDeliveryAddress || "");
  }, [profile?.DefaultDeliveryAddress]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmitProfile({ DefaultDeliveryAddress: address });
  };

  if (profile?.isProfileComplete) {
    return (
      <>
        <ProfileDetailItem
          label="Default Delivery Address"
          value={profile.DefaultDeliveryAddress || "Not Provided"}
        />
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div>
        <Label
          htmlFor="DefaultDeliveryAddress"
          className="text-base font-medium text-brand-green"
        >
          Default Delivery Address
        </Label>
        <Input
          id="DefaultDeliveryAddress"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 text-base"
          disabled={isLoading}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full sm:w-auto bg-highlight hover:bg-highlight/90 text-white text-base py-2.5 px-6"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Buyer Details
      </Button>
    </form>
  );
};
export default BuyerProfileDetails;
