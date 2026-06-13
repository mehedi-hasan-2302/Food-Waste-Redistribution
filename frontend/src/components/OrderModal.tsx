import { useState, type FormEvent } from "react";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import type {
  CreateClaimPayload,
  CreateOrderPayload,
  PaymentMethod,
} from "@/lib/types/order";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface OrderModalProps {
  listingId: number;
  listingPrice: number;
  listingTitle: string;
  isDonation: boolean;
  children: React.ReactNode;
}

type DeliveryChoice = "HOME_DELIVERY" | "SELF_PICKUP";

const DELIVERY_FEE = 50;

const OrderModal: React.FC<OrderModalProps> = ({
    listingId,
    listingPrice,
    listingTitle,
    isDonation,
    children,
}) => {
  const { createOrder, createClaim, isLoading } = useOrderStore();
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [deliveryType, setDeliveryType] =
    useState<DeliveryChoice>("HOME_DELIVERY");
  const [paymentChoice, setPaymentChoice] =
    useState<PaymentMethod>("PAY_ON_DELIVERY");
  const [deliveryAddress, setDeliveryAddress] = useState(""); 
  const [orderNotes, setOrderNotes] = useState("");
  const deliveryFee =
    !isDonation && deliveryType === "HOME_DELIVERY" ? DELIVERY_FEE : 0;
  const estimatedTotal = listingPrice + deliveryFee;
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("You must be logged in to place an order.");
      return;
    }
    let success = false;
    if (isDonation) {
      const claimDetails: CreateClaimPayload = {
        deliveryType,
        deliveryAddress:
          deliveryType === "HOME_DELIVERY" ? deliveryAddress : "SELF_PICKUP",
        claimNotes: orderNotes,
      };
      const newClaim = await createClaim(String(listingId), claimDetails);
      success = !!newClaim;
    } else {
    const orderDetails: CreateOrderPayload = {
      deliveryType,
      deliveryAddress:
        deliveryType === "HOME_DELIVERY" ? deliveryAddress : "SELF_PICKUP",
      proposedPrice: listingPrice,
      paymentMethod: paymentChoice,
      orderNotes: orderNotes.trim() || undefined,
    };

    const newOrder = await createOrder(String(listingId), orderDetails)
    success = !!newOrder;
  }

    if (success) {
      setIsOpen(false);
      navigate("/");
    }
  };

  const modalTitle = isDonation ? "Claim Donation" : "Confirm Your Order";
  const modalDescription = isDonation
    ? "You are requesting this donation:"
    : "You are placing an order for:";
  const notesLabel = isDonation
    ? "Claim Notes (Optional)"
    : "Order Notes (Optional)";
  const buttonText = isDonation
    ? "Confirm Claim"
    : `Place Order for Tk ${estimatedTotal}`;


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">{modalTitle}</DialogTitle>
          <DialogDescription>
            {modalDescription}{" "}
            <span className="font-semibold">{listingTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label className="font-semibold">Delivery Option</Label>
            <RadioGroup
              value={deliveryType}
              onValueChange={(value) => {
                const nextDeliveryType = value as DeliveryChoice;
                setDeliveryType(nextDeliveryType);
                setPaymentChoice(
                  nextDeliveryType === "SELF_PICKUP"
                    ? "PAY_ON_PICKUP"
                    : "PAY_ON_DELIVERY"
                );
              }}
              className="mt-2 grid gap-3 sm:grid-cols-2"
            >
              <Label
                htmlFor="home_delivery"
                className="flex cursor-pointer items-start gap-3 rounded-md border border-dark-text/15 p-3 hover:border-brand-green"
              >
                <RadioGroupItem value="HOME_DELIVERY" id="home_delivery" />
                <span>
                  <span className="block font-semibold">Home Delivery</span>
                  <span className="block text-sm text-dark-text/65">
                    {isDonation
                      ? "Coordinate delivery with your organization volunteer."
                      : "A verified rider is assigned if available."}
                  </span>
                </span>
              </Label>
              <Label
                htmlFor="self_pickup"
                className="flex cursor-pointer items-start gap-3 rounded-md border border-dark-text/15 p-3 hover:border-brand-green"
              >
                <RadioGroupItem value="SELF_PICKUP" id="self_pickup" />
                <span>
                  <span className="block font-semibold">Self Pickup</span>
                  <span className="block text-sm text-dark-text/65">
                    Use the pickup code after the seller/donor confirms.
                  </span>
                </span>
              </Label>
            </RadioGroup>
          </div>

          {deliveryType === "HOME_DELIVERY" && (
            <div>
              <Label htmlFor="deliveryAddress" className="font-semibold">
                Delivery Address
              </Label>
              <Input
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
            </div>
          )}

          {!isDonation && (
            <div>
              <Label className="font-semibold">Payment Method</Label>
              <RadioGroup
                value={paymentChoice}
                onValueChange={(value) => setPaymentChoice(value as PaymentMethod)}
                className="mt-2 grid gap-3 sm:grid-cols-2"
              >
                <Label
                  htmlFor="pay_on_delivery"
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-dark-text/15 p-3 hover:border-brand-green"
                >
                  <RadioGroupItem
                    value="PAY_ON_DELIVERY"
                    id="pay_on_delivery"
                    disabled={deliveryType !== "HOME_DELIVERY"}
                  />
                  <span>
                    <span className="block font-semibold">Pay on delivery</span>
                    <span className="block text-sm text-dark-text/65">
                      Cash/offline payment to rider or seller.
                    </span>
                  </span>
                </Label>
                <Label
                  htmlFor="pay_on_pickup"
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-dark-text/15 p-3 hover:border-brand-green"
                >
                  <RadioGroupItem value="PAY_ON_PICKUP" id="pay_on_pickup" />
                  <span>
                    <span className="block font-semibold">Pay at pickup</span>
                    <span className="block text-sm text-dark-text/65">
                      Online payment can be added later.
                    </span>
                  </span>
                </Label>
              </RadioGroup>
            </div>
          )}

          <div>
            <Label htmlFor="orderNotes" className="font-semibold">
              {notesLabel}
            </Label>
            <Textarea
              id="orderNotes"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>

          {!isDonation && (
            <div className="rounded-md border border-brand-green/20 bg-brand-green/5 p-3 text-sm">
              <div className="flex justify-between">
                <span>Food price</span>
                <span className="font-medium">Tk {listingPrice}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Delivery fee</span>
                <span className="font-medium">Tk {deliveryFee}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-brand-green/20 pt-2 text-base font-semibold">
                <span>Estimated total</span>
                <span>Tk {estimatedTotal}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                disabled={isLoading}
                className="bg-red-400 hover:bg-red-500 text-white"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-green text-white hover:bg-brand-green/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
