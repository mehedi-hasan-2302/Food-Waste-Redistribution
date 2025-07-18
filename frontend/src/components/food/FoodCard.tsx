import type { FoodItem } from "@/lib/types/FoodItem"; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import OrderModal from "@/components/OrderModal";
import { useAuthStore } from "@/store/authStore";
import { Clock, MapPin, ShoppingCart, Heart, User } from "lucide-react";
import { formatCookedDate } from "@/lib/fooddataFormatter";

interface FoodCardProps {
  item: FoodItem;
}

const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const placeholderImage = "https://placehold.co/400x300/D9E3DF/1A3F36?text=Food";
  const isItemExpired = +new Date(item.PickupWindowEnd) <= +new Date();
  const isDonation = item.IsDonation;
  const userRole = useAuthStore((state) => state.user?.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const canTakeAction =
    isAuthenticated &&
    ((userRole === "BUYER" && !isDonation) ||
    (userRole === "CHARITY_ORG" && isDonation));

  // time remaining 
  const timeRemaining = () => {
    if (isItemExpired) return "Expired";
    const now = new Date().getTime();
    const expiry = new Date(item.PickupWindowEnd).getTime();
    const diff = expiry - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] border border-gray-200 hover:border-highlight group bg-white">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] w-full">
          <img
            src={
              item.ImagePath && item.ImagePath !== "imagepath"
                ? item.ImagePath
                : placeholderImage
            }
            alt={item.Title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isDonation ? (
            <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
              <Heart className="w-3 h-3 mr-1" />
              Donation
            </Badge>
          ) : (
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
              For Sale
            </Badge>
          )}
          {item.discountApplied && item.discountApplied > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse">
              {item.discountApplied}% OFF
            </Badge>
          )}
        </div>

        {/* Time Remaining Overlay */}
        {!isItemExpired && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-black/70 text-white hover:bg-black/80 shadow-lg">
              <Clock className="w-3 h-3 mr-1" />
              {timeRemaining()}
            </Badge>
          </div>
        )}

      
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content Section */}
      <CardContent className="flex-grow flex flex-col p-4 space-y-3">
        {/* Title */}
        <h3 className="font-serif text-lg font-semibold text-dark-text leading-tight line-clamp-2 group-hover:text-highlight transition-colors min-h-[3rem]">
          {item.Title}
        </h3>

        {/* Seller Info */}
        {item.donor && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-1" />
            <span className="truncate font-medium">
              {item.donor.donorSeller?.BusinessName || item.donor.Username}
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {isDonation ? (
              <span className="text-xl font-bold text-green-600">Free</span>
            ) : (
              <div className="flex items-center gap-2">
                {item.currentPrice && item.currentPrice !== item.Price ? (
                  <>
                    <span className="text-xl font-bold text-red-600">
                      ৳{item.currentPrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ৳{item.originalPrice || item.Price}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-dark-text">
                    ৳{item.Price}
                  </span>
                )}
              </div>
            )}
            
            {/* Quantity info */}
            {item.Quantity && (
              <span className="text-xs text-gray-500">Serves {item.Quantity}</span>
            )}
          </div>
        </div>

        {/* Cooked Date & Location in single line */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Cooked: {formatCookedDate(item.CookedDate)}</span>
          {item.PickupLocation && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate max-w-[120px]">{item.PickupLocation}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto pt-2">
          {/* View Details Link */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 text-xs hover:bg-highlight hover:text-white transition-colors"
          >
            <Link to={`/food/${item.ListingID}`}>
              View Details
            </Link>
          </Button>

          {/* Main Action Button */}
          {isItemExpired ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-gray-500 border-gray-300 cursor-not-allowed bg-gray-50"
              disabled
            >
              Unavailable
            </Button>
          ) : !isAuthenticated ? (
            <Button
              asChild
              size="sm"
              className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Link to="/login">
                Login to {isDonation ? "Claim" : "Order"}
              </Link>
            </Button>
          ) : canTakeAction ? (
            <OrderModal
              listingId={item.ListingID}
              listingTitle={item.Title}
              isDonation={isDonation}
              listingPrice={item.currentPrice || item.Price}
            >
              <Button
                size="sm"
                className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white shadow-md hover:shadow-lg transition-all"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                {isDonation ? "Claim" : "Order"}
              </Button>
            </OrderModal>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-gray-500 border-gray-300 cursor-not-allowed bg-gray-50"
              disabled
            >
              {isDonation ? "For Charities Only" : "For Buyers Only"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodCard;
