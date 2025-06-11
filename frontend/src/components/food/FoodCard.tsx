import type { FoodItem } from "@/lib/types/FoodItem"; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ExpiryCountdown from "@/components/food/ExpiryCountDown";
import OrderModal from "@/components/OrderModal";
import { useAuthStore } from "@/store/authStore";

interface FoodCardProps {
  item: FoodItem;
}

const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const placeholderImage =
    "https://placehold.co/400x300/D9E3DF/1A3F36?text=Food";
  const isItemExpired = +new Date(item.PickupWindowEnd) <= +new Date();
  const isDonation = item.IsDonation;
  const userRole = useAuthStore((state) => state.user?.role);

  const canTakeAction =
    (userRole === "BUYER" && !isDonation) ||
    (userRole === "CHARITY_ORG" && isDonation);

  return (
    <div className="block hover:no-underline group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-xl group-focus-within:shadow-xl focus-within:ring-2 focus-within:ring-highlight focus-within:ring-offset-2 border border-pale-mint group-hover:border-highlight pt-0">
        {" "}
        <Link to={`/food/${item.ListingID}`} className="w-full h-full">
        <div className="aspect-w-4 aspect-h-3 w-full">
          <img
            src={
              item.ImagePath && item.ImagePath !== "imagepath"
                ? item.ImagePath
                : placeholderImage
            }
            alt={item.Title}
            className="w-full h-full object-cover"
          />
        </div>
        </Link>
        {/* Card Header - Title and Status Badge */}
        {/* Content Section - All elements centered */}
        <CardContent className="flex-grow flex flex-col items-center text-center p-3 space-y-1.5">
          {" "}
          {/* Reduced padding & space */}
          {/* Title */}
          
          <h3 className="font-serif text-xl font-semibold text-dark-text leading-tight line-clamp-2 group-hover:text-highlight transition-colors mt-1 w-full">
            {item.Title}
          </h3>
          {/* Price - Plain text, larger */}
          <p className="text-2xl text-dark-text font-medium mt-0.5">
            {" "}
            {/* Increased size to text-base, adjusted margin */}
            {item.IsDonation ? "Donation" : `৳ ${item.Price}`}
          </p>
          {/* Conditional "Add to Cart" or "Unavailable" Button */}
          <div className="w-full pt-1">
            {isItemExpired ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-dark-text/60 border-dark-text/30 cursor-not-allowed"
                disabled
              >
                Unavailable
              </Button>
            ) : canTakeAction && (
              <OrderModal
                listingId={item.ListingID}
                listingTitle={item.Title}
                isDonation={isDonation}
                listingPrice={item.Price}
              >
              <Button
                size="lg"
                className="w-full bg-brand-green text-lg text-pale-mint hover:bg-brand-green/90 mb-1 cursor-pointer"
              >
                {isDonation ? "Claim Donation" : "Order"}
              </Button>
              </OrderModal>
            )}
          </div>
          {/* Expiry Countdown */}
          {!isItemExpired && (
            <div className="w-full max-w-[160px]">
              {" "}
              {/* Adjusted max-width slightly */}
              <ExpiryCountdown expiryTimestamp={item.PickupWindowEnd} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodCard;
