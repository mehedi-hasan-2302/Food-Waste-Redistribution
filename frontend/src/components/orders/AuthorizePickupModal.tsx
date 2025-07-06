import { useState, type FormEvent } from "react";
import { useModalStore } from "@/store/modalStore";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const AuthorizePickupModal: React.FC = () => {
  // Get modal state and actions
  const { isOpen, closeModal, modalProps } = useModalStore();
  // Get order state and actions
  const { authorizePickup, isLoading } = useOrderStore();
  const token = useAuthStore((state) => state.token);

  const [pickupCode, setPickupCode] = useState("");

  const entityId = modalProps?.orderId || modalProps?.claimId;
  const isDonation = !!modalProps?.claimId;


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !entityId) {
      toast.error("An error occurred. Missing token or Entity ID.");
      return;
    }
    if (pickupCode.length !== 8) {
      // Your API codes are 8 characters
      toast.error("Pickup code must be 8 characters long.");
      return;
    }

    const wasSuccessful = await authorizePickup(String(entityId), pickupCode, isDonation);
    if (wasSuccessful) {
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Authorize Pickup</DialogTitle>
          <DialogDescription>
            Enter the 8-character pickup code provided by the delivery person to
            authorize this pickup.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4">
          <div>
            <Label htmlFor="pickupCode" className="sr-only">
              Pickup Code
            </Label>
            <Input
              id="pickupCode"
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
              placeholder="Enter Pickup Code"
              maxLength={8}
              className="text-center text-lg tracking-widest font-mono"
              required
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Pickup
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorizePickupModal;
