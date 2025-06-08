import { useEffect, useState } from "react";
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

const sortOptions: Array<{ value: string; label: string }> = [
  { value: "default", label: "Default Order" },
  { value: "expiryTime-asc", label: "Expiry: Soonest First" },
  { value: "expiryTime-desc", label: "Expiry: Latest First" },
  { value: "Price-asc", label: "Price: Low to High" },
  { value: "Price-desc", label: "Price: High to Low" },
  { value: "CookedDate-desc", label: "Cooked: Newest First" },
  { value: "CookedDate-asc", label: "Cooked: Oldest First" },
];

const FoodListPage: React.FC = () => {
    const allListings = useFoodStore((state) => state.allListings);
    const isLoading = useFoodStore((state) => state.isLoading);
    const error = useFoodStore((state) => state.error);
    const fetchAllListings = useFoodStore((state) => state.fetchAllListings);
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) =>
      state.isAuthenticated()
    );

    const [searchQuery, setSearchQuery] = useState<string>("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [sortValue, setSortValue] = useState<string>("default");

    useEffect(() => {
      if (token) {
        fetchAllListings(token);
      }
    }, [token, fetchAllListings]);

    const processedItems = useProcessedFoodItems(
      allListings,
      debouncedSearchQuery,
      sortValue
    );

    if (isLoading && allListings.length === 0) {
      return (
        <div className="container mx-auto p-6 text-center min-h-screen flex justify-center items-center">
          <p className="text-xl text-dark-text">Loading food items...</p>
          {/* You can add a spinner here */}
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

        {/* Display based on raw API data before client-side processing for initial "no items" message */}
        {allListings.length === 0 && !isLoading && !error && (
          <div className="text-center text-dark-text/80 py-10">
            <p className="text-xl mb-2">
              No food items are currently available.
            </p>
            <p>Please check back later!</p>
          </div>
        )}

        {/* Display processed items or message if filtering results in no matches */}
        {allListings.length > 0 && processedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {processedItems.map((item) => (
              <FoodCard key={item.ListingID} item={item} />
            ))}
          </div>
        ) : (
          allListings.length > 0 &&
          !isLoading &&
          !error && ( // Show this only if there were raw items but processing cleared them
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
