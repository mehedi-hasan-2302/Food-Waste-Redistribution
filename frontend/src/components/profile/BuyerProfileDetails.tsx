import { useState } from "react";
import ProfileDetailItem from "./ProfileDetailItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BuyerFormData {
  defaultDeliveryAddress: string;
}

interface BuyerProfileDetailsProps {
  defaultDeliveryAddress?: string;
  isEditing: boolean;
  onSubmitProfile: (formData: BuyerFormData) => void;
}

const BuyerProfileDetails: React.FC<BuyerProfileDetailsProps> = ({
  defaultDeliveryAddress: initialAddress,
  isEditing,
  onSubmitProfile,
}) => {
  const [address, setAddress] = useState(initialAddress || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitProfile({ defaultDeliveryAddress: address });
  };

  if (!isEditing) {
    return (
      <>
        <ProfileDetailItem
          label="Default Delivery Address"
          value={initialAddress}
        />
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div>
        <Label
          htmlFor="defaultDeliveryAddress"
          className="text-base font-medium text-brand-green"
        >
          Default Delivery Address
        </Label>
        <Input
          id="defaultDeliveryAddress"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 text-base"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full sm:w-auto bg-highlight hover:bg-highlight/90 text-white text-base py-2.5 px-6"
      >
        Save Buyer Details
      </Button>
    </form>
  );
};
export default BuyerProfileDetails;
