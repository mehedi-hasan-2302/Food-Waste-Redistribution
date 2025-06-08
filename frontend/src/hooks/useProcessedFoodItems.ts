import { useMemo } from "react";
import type { FoodItem } from "@/lib/types/FoodItem"; 

export function useProcessedFoodItems(
  initialItems: FoodItem[] | null | undefined,
  searchQuery: string,
  sortValue: string
): FoodItem[] {
  return useMemo(() => {
    if(!Array.isArray(initialItems)){
      return [];
    }
    const now = new Date();

    let processed = initialItems.filter((item) => {
      if (!item || !item.PickupWindowEnd) {
        return false; // Or handle as per your logic for items with missing expiry
      }
      const expiryDate = new Date(item.PickupWindowEnd);
      return expiryDate > now;
    });

    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      processed = processed.filter(
        (item) =>
          item.Title.toLowerCase().includes(lowerCaseQuery) ||
          item.Description.toLowerCase().includes(lowerCaseQuery) ||
          item.FoodType.toLowerCase().includes(lowerCaseQuery) ||
          item.PickupLocation.toLowerCase().includes(lowerCaseQuery) ||
          item.DietaryInfo.toLowerCase().includes(lowerCaseQuery) ||
          String(item.Price).toLowerCase().includes(lowerCaseQuery) // Allow searching by price string
      );
    }

    const [sortKey, sortOrder] = sortValue.split("-");

    if (
      sortKey &&
      sortKey !== "default" &&
      (sortOrder === "asc" || sortOrder === "desc")
    ) {
      const itemsToSort = [...processed];

      itemsToSort.sort((a, b) => {
        let valA: number | undefined;
        let valB: number | undefined;

        switch (sortKey) {
          case "expiryTime":
            valA = new Date(a.PickupWindowEnd).getTime();
            valB = new Date(b.PickupWindowEnd).getTime();
            break;
          case "Price":
            valA = a.IsDonation ? 0 : a.Price ?? Infinity; // Default to Infinity if undefined for sorting
            valB = b.IsDonation ? 0 : b.Price ?? Infinity;
            break;
          case "CookedDate":
            valA = a.CookedDate ? new Date(a.CookedDate).getTime() : undefined;
            valB = b.CookedDate ? new Date(b.CookedDate).getTime() : undefined;
            break;
          default:
            return 0;
        }
        // Handle cases where valA or valB might be undefined after attempting to access properties
        if (valA === undefined && valB === undefined) return 0;
        if (valA === undefined) return sortOrder === "asc" ? 1 : -1; // Undefined items go to the end/start
        if (valB === undefined) return sortOrder === "asc" ? -1 : 1;

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
      return itemsToSort;
    }

    return processed;
  }, [initialItems, searchQuery, sortValue]);
}
