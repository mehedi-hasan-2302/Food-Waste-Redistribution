import ExpiryCountdown from "./ExpiryCountDown";
import DetailItem from "./DetailItem";
import { Button } from "@/components/ui/button";
import type { FoodItem } from "@/lib/types/FoodItem";
import { formatCookedDate } from "@/lib/fooddataFormatter";
import OrderModal from "@/components/OrderModal";
import { useAuthStore } from "@/store/authStore";

interface FoodItemDetailProps {
    item: FoodItem;
}

const FoodItemDetail: React.FC<FoodItemDetailProps> = ({ item }) => {
    const placeholderImage =
        "https://placehold.co/600x450/D9E3DF/1A3F36?text=Food+Image";
    const isItemExpired = +new Date(item.PickupWindowEnd) <= +new Date();

    const isDonation = item.IsDonation;
    const userRole = useAuthStore((state) => state.user?.role);
    const canTakeAction =
      (userRole === "BUYER" && !isDonation) ||
      (userRole === "CHARITY_ORG" && isDonation);

    return (
      <div className="mx-auto w-full max-w-6xl lg:max-w-7xl font-sans bg-white rounded-xl shadow-xl my-6 md:my-8 p-4 sm:p-6 md:p-8">
        {/* 2. Bigger gap between columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-6 lg:gap-8">
          {/* --- Column 1: Picture --- */}
          <div className="md:col-span-5">
            <div className="aspect-w-4 aspect-h-3 w-full md:aspect-w-auto md:aspect-h-auto md:h-full">
              <img
                src={
                  item.ImagePath === "imagepath" || !item.ImagePath
                    ? placeholderImage
                    : item.ImagePath
                }
                alt={item.Title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          {/* --- Column 2: Details --- */}
          <div className="md:col-span-7 flex flex-col space-y-3 md:space-y-4 pt-4 md:pt-0">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-dark-text leading-tight">
              {item.Title}
            </h1>

            <p className="text-dark-text/85 text-sm sm:text-xl leading-relaxed">
              {item.Description}
            </p>

            {/* Row for Price/Donation and Expiry Countdown */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Price/Donation Badge */}
              <div
                className={`inline-block px-3 py-1.5 rounded-md sm:text-2xl font-semibold text-dark-text w-fit`}
              >
                {item.IsDonation ? "Donation" : `৳ ${item.Price} Tk`}
              </div>

              <div className="w-full sm:w-auto sm:min-w-[160px] md:min-w-[180px]">
                <ExpiryCountdown expiryTimestamp={item.PickupWindowEnd} />
              </div>
            </div>

            {/* Add to Cart Button / Unavailable */}
            <div className="w-full sm:max-w-xs">
              {!isItemExpired ? (
                canTakeAction && (
                  <OrderModal
                    listingId={item.ListingID}
                    listingPrice={item.Price}
                    isDonation={item.IsDonation}
                    listingTitle={item.Title}
                  >
                    <Button
                      size={"lg"}
                      className="bg-brand-green text-white hover:bg-brand-green/90 w-full py-2.5 text-base cursor-pointer"
                    >
                      {isDonation ? "Claim Donation" : "Order Now"}
                    </Button>
                  </OrderModal>
                )
              ) : (
                <Button
                  className="bg-gray-300 text-gray-500 w-full cursor-not-allowed py-2.5 text-base"
                  disabled
                >
                  Unavailable
                </Button>
              )}
            </div>

            {/* Quantity Badge */}
            <div className="inline-block px-3 py-1.5 rounded-md text-sm sm:text-lg font-medium border border-highlight text-highlight w-fit">
              {`Serves ${item.Quantity}`}
            </div>

            {/* Textual Details */}
            <div className="pt-2 space-y-1.5 text-sm text-dark-text/90">
              <DetailItem label="Available At" value={item.PickupLocation} />
              <DetailItem
                label="Cooked On"
                value={formatCookedDate(item.CookedDate)}
              />
              <DetailItem label="Food Type" value={item.FoodType} />
              <DetailItem label="Dietary Info" value={item.DietaryInfo} />
            </div>
          </div>
        </div>
      </div>
    );
};

export default FoodItemDetail;
