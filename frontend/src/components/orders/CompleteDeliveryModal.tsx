import { useModalStore } from "@/store/modalStore";
import { useOrderStore } from "@/store/orderStore";
import { Button } from "@/components/ui/button";
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

const CompleteDeliveryModal: React.FC = () => {
  const { isOpen, closeModal, modalProps } = useModalStore();
  const { completeDelivery, isLoading } = useOrderStore();

  const orderId = modalProps?.orderId || modalProps?.claimId;
  const isDonation = !!modalProps?.claimId;

  const handleConfirm = async () => {
    if (!orderId) {
      toast.error("An error occurred. Missing Order ID.");
      return;
    }

    const wasSuccessful = await completeDelivery(String(orderId), isDonation);
    if (wasSuccessful) {
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Confirm Delivery Completion</DialogTitle>
          <DialogDescription>
            Are you sure you have successfully delivered Order #{orderId}? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button type="button" variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, Delivery Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteDeliveryModal;
