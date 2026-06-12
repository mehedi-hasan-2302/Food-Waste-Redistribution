import { useEffect, useMemo, useState } from "react";
import FoodCard from "@/components/food/FoodCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoSearchCircleSharp } from "react-icons/io5";
import { useDebounce } from "@/hooks/useDebounce";
import { useProcessedFoodItems } from "@/hooks/useProcessedFoodItems";
import { useAuthStore } from "@/store/authStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFoodStore } from "@/store/foodStore";
import type { FoodItem } from "@/lib/types/FoodItem";

const sortOptions: Array<{ value: string; label: string }> = [
  { value: "default", label: "Default Order" },
  { value: "expiryTime-asc", label: "Expiry: Soonest First" },
  { value: "expiryTime-desc", label: "Expiry: Latest First" },
  { value: "Price-asc", label: "Price: Low to High" },
  { value: "Price-desc", label: "Price: High to Low" },
  { value: "CookedDate-desc", label: "Cooked: Newest First" },
  { value: "CookedDate-asc", label: "Cooked: Oldest First" },
];

type ListingTypeFilter = "all" | "donations" | "sales";

const listingTypeOptions: Array<{
  value: ListingTypeFilter;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "All listings",
    description: "Browse every active listing",
  },
  {
    value: "donations",
    label: "Donations",
    description: "Best for charity claims",
  },
  {
    value: "sales",
    label: "For sale",
    description: "Best for buyer orders",
  },
];

const isActiveListing = (item: FoodItem) => {
  if (!item?.PickupWindowEnd) {
    return false;
  }

  return new Date(item.PickupWindowEnd).getTime() > Date.now();
};

const getMarketplaceGuidance = (role?: string) => {
  switch (role) {
    case "BUYER":
      return {
        title: "Buyer view",
        description:
          "Order discounted sale listings and message sellers before pickup or delivery.",
      };
    case "CHARITY_ORG":
      return {
        title: "Charity view",
        description:
          "Claim donation listings for your organization and message donors to coordinate pickup.",
      };
    case "DONOR_SELLER":
      return {
        title: "Donor and seller view",
        description:
          "Post surplus food from Manage Listings, then use messages to coordinate with buyers or charities.",
      };
    case "INDEP_DELIVERY":
    case "ORG_VOLUNTEER":
      return {
        title: "Delivery view",
        description:
          "Use listings for pickup context; assigned delivery work stays connected to orders and claims.",
      };
    default:
      return {
        title: "Marketplace view",
        description:
          "Browse active food listings. Login to order, claim donations, or message the poster.",
      };
  }
};

const FoodListPage: React.FC = () => {
    const allListings = useFoodStore((state) => state.allListings);
    const isLoading = useFoodStore((state) => state.isLoading);
    const error = useFoodStore((state) => state.error);
    const fetchAllListings = useFoodStore((state) => state.fetchAllListings);
    const userRole = useAuthStore((state) => state.user?.role);
    const isAuthenticated = useAuthStore((state) =>
      state.isAuthenticated()
    );

    const [searchQuery, setSearchQuery] = useState<string>("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [sortValue, setSortValue] = useState<string>("default");
    const [listingTypeFilter, setListingTypeFilter] =
      useState<ListingTypeFilter>("all");

    useEffect(() => {
      fetchAllListings();
    }, [fetchAllListings]);

    const activeListings = useMemo(
      () => allListings.filter(isActiveListing),
      [allListings]
    );
    const filteredListings = useMemo(() => {
      if (listingTypeFilter === "donations") {
        return activeListings.filter((item) => item.IsDonation);
      }

      if (listingTypeFilter === "sales") {
        return activeListings.filter((item) => !item.IsDonation);
      }

      return activeListings;
    }, [activeListings, listingTypeFilter]);
    const donationCount = activeListings.filter((item) => item.IsDonation).length;
    const saleCount = activeListings.length - donationCount;
    const roleGuidance = getMarketplaceGuidance(userRole);

    const processedItems = useProcessedFoodItems(
      filteredListings,
      debouncedSearchQuery,
      sortValue
    );

    if (isLoading && allListings.length === 0) {
      return (
        <div className="container mx-auto p-6 text-center min-h-screen flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
            <p className="text-xl text-dark-text">Loading food items...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="container mx-auto p-6 text-center min-h-screen flex flex-col justify-center items-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          {!isAuthenticated && (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="container mx-auto p-4 md:p-6 min-h-screen">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-dark-text mb-6 md:mb-8 text-center">
          Available Food Items
        </h1>

        <section className="max-w-5xl mx-auto mb-6 rounded-lg border border-brand-green/20 bg-brand-green/5 p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-green">
                {roleGuidance.title}
              </p>
              <p className="mt-1 text-base text-dark-text/80">
                {roleGuidance.description}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[320px]">
              <div className="rounded-md bg-white/80 p-3 shadow-sm">
                <p className="text-2xl font-bold text-dark-text">
                  {activeListings.length}
                </p>
                <p className="text-xs text-dark-text/60">Active</p>
              </div>
              <div className="rounded-md bg-white/80 p-3 shadow-sm">
                <p className="text-2xl font-bold text-dark-text">
                  {donationCount}
                </p>
                <p className="text-xs text-dark-text/60">Donations</p>
              </div>
              <div className="rounded-md bg-white/80 p-3 shadow-sm">
                <p className="text-2xl font-bold text-dark-text">
                  {saleCount}
                </p>
                <p className="text-xs text-dark-text/60">For sale</p>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto py-2 flex flex-col sm:flex-row gap-4 mb-8 md:mb-10 items-center">
          <div className="relative w-full sm:flex-grow flex items-center">
            <IoSearchCircleSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl text-brand-green/80 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              style={{ fontSize: "1.125rem" }}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-lg placeholder:text-lg pl-10 pr-3 py-2 h-10 border-input focus:ring-ring focus:border-ring"
            />
          </div>
          <Select value={sortValue} onValueChange={setSortValue}>
            <SelectTrigger className="w-full sm:w-[220px] md:w-[240px] text-lg px-3 py-2 flex items-center justify-between rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg rounded-md mt-1 w-full sm:w-[220px] md:w-[240px]">
              {sortOptions.map((option) => (
                <SelectItem
                  className="hover:bg-brand-green hover:text-white text-base cursor-pointer"
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="max-w-5xl mx-auto mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {listingTypeOptions.map((option) => {
            const isSelected = listingTypeFilter === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className="h-auto w-full flex-col items-start justify-start whitespace-normal px-4 py-3 text-left"
                onClick={() => setListingTypeFilter(option.value)}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <span className="text-xs font-normal opacity-80">
                  {option.description}
                </span>
              </Button>
            );
          })}
        </div>

       
        {activeListings.length === 0 && !isLoading && !error && (
          <div className="text-center text-dark-text/80 py-10">
            <p className="text-xl mb-2">
              No active food items are currently available.
            </p>
            <p>Please check back later!</p>
          </div>
        )}


        {activeListings.length > 0 && processedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {processedItems.map((item) => (
              <FoodCard key={item.ListingID} item={item} />
            ))}
          </div>
        ) : (
          activeListings.length > 0 &&
          !isLoading &&
          !error && ( // only if there were raw items but processing cleared them
            <div className="text-center text-dark-text/80 py-10">
              <p className="text-xl mb-2">
                No food items match your current search or filter criteria.
              </p>
              <p>Try adjusting your search or sort options.</p>
            </div>
          )
        )}
      </div>
    );
};

export default FoodListPage;
