import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";


const ReasonModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  confirmText: string;
}> = ({ isOpen, onClose, onConfirm, title, description, confirmText }) => {
  const [reason, setReason] = useState("");
  const { isLoading } = useAdminStore();
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
    } else {
      toast.error("A reason is required.");
    }
  };
  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a clear reason..."
            required
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading} className="bg-brand-green text-white cursor-pointer">
              {isLoading && <Loader2 />} {confirmText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReasonModal;
