import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useFeedbackStore } from "@/store/feedbackStore";
import { useModalStore } from "@/store/modalStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ReportIssueModal: React.FC = () => {
  const { isOpen, closeModal, modalProps } = useModalStore();
  const { reportIssue, isLoading } = useFeedbackStore();
  const [message, setMessage] = useState("");

  const entityLabel = modalProps?.claimId ? "donation claim" : "order";

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
    }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const wasSuccessful = await reportIssue({
      orderId: modalProps?.orderId,
      claimId: modalProps?.claimId,
      message,
    });

    if (wasSuccessful) {
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="bg-white sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Report Issue</DialogTitle>
          <DialogDescription>
            Tell admin what went wrong with this {entityLabel}. Keep it clear so
            they can check the users, listing, and delivery history.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="issueMessage">Issue details</Label>
            <Textarea
              id="issueMessage"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              minLength={10}
              required
              placeholder="Example: Rider did not arrive, food condition was not as listed, or pickup code was refused."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportIssueModal;
