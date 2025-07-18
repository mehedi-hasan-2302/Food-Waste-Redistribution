import ExpiryCountdown from "./ExpiryCountDown";
import DetailItem from "./DetailItem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FoodItem } from "@/lib/types/FoodItem";
import { formatCookedDate } from "@/lib/fooddataFormatter";
import OrderModal from "@/components/OrderModal";
import { useAuthStore } from "@/store/authStore";
import { Heart, MapPin, Clock, User, Calendar, Utensils, Info } from "lucide-react";

interface FoodItemDetailProps {
    item: FoodItem;
}

const FoodItemDetail: React.FC<FoodItemDetailProps> = ({ item }) => {
    const placeholderImage = "https://placehold.co/600x450/D9E3DF/1A3F36?text=Food+Image";
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
        return `${days} days ${hours % 24} hours remaining`;
      } else if (hours > 0) {
        return `${hours} hours ${minutes} minutes remaining`;
      } else {
        return `${minutes} minutes remaining`;
      }
    };

    // pickup window with proper timezone
    const formatPickupWindow = () => {
      try {
        const start = new Date(item.PickupWindowStart);
        const end = new Date(item.PickupWindowEnd);
        
        const startTime = start.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Dhaka"
        });
        
        const endTime = end.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Dhaka"
        });
        
        const startDate = start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Dhaka"
        });

        const endDate = end.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Dhaka"
        });

        if (startDate === endDate) {
          return `${startDate} from ${startTime} to ${endTime}`;
        }
        
        return `${startDate} from ${startTime} to ${endDate} ${endTime}`;
      } catch {
        return "Time not specified";
      }
    };

    return (
      <div className="mx-auto w-full max-w-6xl lg:max-w-7xl font-sans bg-white rounded-xl shadow-xl my-6 md:my-8 p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-6 lg:gap-8">
          {/* --- Column 1: Picture --- */}
          <div className="md:col-span-5">
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 w-full md:aspect-w-auto md:aspect-h-auto md:h-full">
                <img
                  src={
                    item.ImagePath === "imagepath" || !item.ImagePath
                      ? placeholderImage
                      : item.ImagePath
                  }
                  alt={item.Title}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
              </div>
              
              {/* Status badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isDonation ? (
                  <Badge className="bg-green-500 text-white shadow-lg">
                    <Heart className="w-4 h-4 mr-1" />
                    Donation
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500 text-white shadow-lg">
                    For Sale
                  </Badge>
                )}
                
                {item.discountApplied && item.discountApplied > 0 && (
                  <Badge className="bg-red-500 text-white shadow-lg animate-pulse">
                    {item.discountApplied}% OFF
                  </Badge>
                )}
              </div>

              {/* Time remaining overlay */}
              {!isItemExpired && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black/70 text-white shadow-lg">
                    <Clock className="w-4 h-4 mr-1" />
                    {timeRemaining()}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* --- Column 2: Details --- */}
          <div className="md:col-span-7 flex flex-col space-y-4 md:space-y-5 pt-4 md:pt-0">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-dark-text leading-tight">
              {item.Title}
            </h1>

            {/* Seller Information */}
            {item.donor && (
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-5 h-5" />
                <span className="font-medium">
                  By {item.donor.donorSeller?.BusinessName || item.donor.Username}
                </span>
              </div>
            )}

            {/* Price Section */}
            <div className="flex items-center space-x-4">
              {isDonation ? (
                <div className="text-3xl font-bold text-green-600">Free</div>
              ) : (
                <div className="flex items-center space-x-3">
                  {item.currentPrice && item.currentPrice !== item.Price ? (
                    <>
                      <span className="text-3xl font-bold text-red-600">
                        ৳{item.currentPrice}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        ৳{item.originalPrice || item.Price}
                      </span>
                      <Badge className="bg-red-100 text-red-700">
                        Save ৳{((item.originalPrice || item.Price) - item.currentPrice).toFixed(2)}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-dark-text">
                      ৳{item.Price}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {item.Description && (
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-highlight">
                <h3 className="font-semibold text-dark-text mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Description
                </h3>
                <p className="text-dark-text/85 text-base leading-relaxed">
                  {item.Description}
                </p>
              </div>
            )}

            {/* Countdown */}
            <div className="w-full">
              <ExpiryCountdown expiryTimestamp={item.PickupWindowEnd} />
            </div>

            {/* Action Button */}
            <div className="w-full sm:max-w-xs">
              {!isItemExpired ? (
                !isAuthenticated ? (
                  <Button
                    asChild
                    size="lg"
                    className="bg-brand-green text-white hover:bg-brand-green/90 w-full py-3 text-base shadow-lg"
                  >
                    <a href="/login">
                      Login to {isDonation ? "Claim" : "Order"}
                    </a>
                  </Button>
                ) : canTakeAction ? (
                  <OrderModal
                    listingId={item.ListingID}
                    listingPrice={item.currentPrice || item.Price}
                    isDonation={item.IsDonation}
                    listingTitle={item.Title}
                  >
                    <Button
                      size="lg"
                      className="bg-brand-green text-white hover:bg-brand-green/90 w-full py-3 text-base cursor-pointer shadow-lg"
                    >
                      {isDonation ? "Claim Donation" : "Order Now"}
                    </Button>
                  </OrderModal>
                ) : (
                  <Button
                    className="bg-gray-300 text-gray-500 w-full cursor-not-allowed py-3 text-base"
                    disabled
                  >
                    {isDonation ? "For Charities Only" : "For Buyers Only"}
                  </Button>
                )
              ) : (
                <Button
                  className="bg-gray-300 text-gray-500 w-full cursor-not-allowed py-3 text-base"
                  disabled
                >
                  Unavailable
                </Button>
              )}
            </div>

            {/* Quantity Badge */}
            {item.Quantity && (
              <div className="inline-block">
                <Badge variant="outline" className="px-3 py-2 text-base font-medium border-highlight text-highlight">
                  <Utensils className="w-4 h-4 mr-2" />
                  Serves {item.Quantity}
                </Badge>
              </div>
            )}

            {/* Detailed Information */}
            <div className="pt-4 space-y-3 text-base text-dark-text/90 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-dark-text mb-3">Food Details</h3>
              
              <DetailItem 
                label="Pickup Location" 
                value={item.PickupLocation || "Location not specified"} 
                icon={<MapPin className="w-4 h-4" />}
              />
              
              <DetailItem
                label="Cooked On"
                value={formatCookedDate(item.CookedDate)}
                icon={<Calendar className="w-4 h-4" />}
              />
              
              <DetailItem
                label="Pickup Window"
                value={formatPickupWindow()}
                icon={<Clock className="w-4 h-4" />}
              />
              
              <DetailItem 
                label="Food Type" 
                value={item.FoodType || "Not specified"} 
                icon={<Utensils className="w-4 h-4" />}
              />
              
              {item.DietaryInfo && (
                <DetailItem 
                  label="Dietary Info" 
                  value={item.DietaryInfo} 
                  icon={<Info className="w-4 h-4" />}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
};

export default FoodItemDetail;
