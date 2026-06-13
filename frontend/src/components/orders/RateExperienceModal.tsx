import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Star } from "lucide-react";
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

const RateExperienceModal: React.FC = () => {
  const { isOpen, closeModal, modalProps } = useModalStore();
  const { rateExperience, isLoading } = useFeedbackStore();
  const targets = modalProps?.ratingTargets || [];
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [ratingValue, setRatingValue] = useState(5);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId(undefined);
      setRatingValue(5);
      setMessage("");
      return;
    }

    setSelectedUserId(targets[0]?.userId);
  }, [isOpen, targets]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserId) return;

    const wasSuccessful = await rateExperience({
      orderId: modalProps?.orderId,
      claimId: modalProps?.claimId,
      regardingUserId: selectedUserId,
      ratingValue,
      message: message.trim() || undefined,
    });

    if (wasSuccessful) {
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="bg-white sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Rate Experience</DialogTitle>
          <DialogDescription>
            Rate a person involved in this completed activity. Ratings help the
            platform build trust over time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="ratingTarget">Who are you rating?</Label>
            <select
              id="ratingTarget"
              value={selectedUserId || ""}
              onChange={(event) => setSelectedUserId(Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-dark-text/20 bg-white px-3 py-2"
              required
            >
              {targets.map((target) => (
                <option key={target.userId} value={target.userId}>
                  {target.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Rating</Label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRatingValue(value)}
                  className="rounded-md p-1 text-yellow-500 focus:outline-none focus:ring-2 focus:ring-brand-green"
                  aria-label={`${value} star rating`}
                >
                  <Star
                    className="h-7 w-7"
                    fill={value <= ratingValue ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="ratingMessage">Comment (optional)</Label>
            <Textarea
              id="ratingMessage"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share what went well or what could improve."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedUserId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Rating
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RateExperienceModal;
