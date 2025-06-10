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
import type { CreateOrderPayload } from "@/lib/types/order";
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
  children: React.ReactNode;
}

const OrderModal: React.FC<OrderModalProps> = ({
    listingId,
    listingPrice,
    listingTitle,
    children,
}) => {
  const { createOrder, isLoading } = useOrderStore();
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<
    "HOME_DELIVERY" | "SELF_PICKUP"
  >("HOME_DELIVERY");
  const [deliveryAddress, setDeliveryAddress] = useState(""); 
  const [orderNotes, setOrderNotes] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("You must be logged in to place an order.");
      return;
    }

    const orderDetails: CreateOrderPayload = {
      deliveryType,
      deliveryAddress:
        deliveryType === "HOME_DELIVERY" ? deliveryAddress : "SELF_PICKUP",
      proposedPrice: listingPrice,
      orderNotes,
    };

    const newOrder = await createOrder(listingId, orderDetails, token);

    if (newOrder) {
      setIsOpen(false);
      navigate("/my-orders");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Your Order</DialogTitle>
          <DialogDescription>
            You are placing an order for:{" "}
            <span className="font-semibold">{listingTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label className="font-semibold">Delivery Option</Label>
            <RadioGroup
              value={deliveryType}
              onValueChange={(value) => setDeliveryType(value as any)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="HOME_DELIVERY" id="home_delivery" />
                <Label htmlFor="home_delivery">Home Delivery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SELF_PICKUP" id="self_pickup" />
                <Label htmlFor="self_pickup">Self Pickup</Label>
              </div>
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

          <div>
            <Label htmlFor="orderNotes" className="font-semibold">
              Order Notes (Optional)
            </Label>
            <Textarea
              id="orderNotes"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isLoading} className="bg-red-400 hover:bg-red-500 text-white">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading} className="bg-brand-green text-white hover:bg-brand-green/90">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Place Order for ${listingPrice}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
