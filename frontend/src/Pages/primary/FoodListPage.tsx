import { useState } from "react";
import FoodCard from "@/components/food/FoodCard";
import type { FoodItem } from "@/lib/types/FoodItem";
import sample_food_listings from "@/data/sample_food_listings.json";
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
    const [searchQuery, setSearchQuery] = useState<string>("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [sortValue, setSortValue] = useState<string>("default");

    const processedItems = useProcessedFoodItems(
      sample_food_listings as FoodItem[],
      debouncedSearchQuery,
      sortValue
    );

    return (
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-dark-text mb-6 md:mb-8 text-center">
          Available Food Items
        </h1>

        <div className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto py-2 flex flex-col sm:flex-row gap-4 mb-8 md:mb-10 items-center">
          <div className="relative w-full sm:flex-grow flex items-center">
            <IoSearchCircleSharp
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl text-brand-green/80 pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              style={{ fontSize: "1.125rem" }}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-lg placeholder:text-lg pl-10 pr-3 py-2 h-10 border-input focus:ring-ring focus:border-ring" // Adjust pl-10 based on icon size, added h-10 for explicit height
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

        {processedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {processedItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center text-dark-text/80 py-10">
            <p className="text-xl mb-2">No food items match your criteria.</p>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    );
};

export default FoodListPage;
