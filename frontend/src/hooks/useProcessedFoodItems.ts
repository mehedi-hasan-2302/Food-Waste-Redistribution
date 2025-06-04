import { useMemo } from "react";
import type { FoodItem } from "@/lib/types/FoodItem"; 

export function useProcessedFoodItems(
  initialItems: FoodItem[],
  searchQuery: string,
  sortValue: string
): FoodItem[] {
  return useMemo(() => {
    const now = new Date();

    let processed = initialItems.filter((item) => {
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
        let valA: number;
        let valB: number;

        switch (sortKey) {
          case "expiryTime":
            valA = new Date(a.PickupWindowEnd).getTime();
            valB = new Date(b.PickupWindowEnd).getTime();
            break;
          case "Price":
            valA = a.IsDonation ? 0 : a.Price;
            valB = b.IsDonation ? 0 : b.Price;
            break;
          case "CookedDate":
            valA = new Date(a.CookedDate).getTime();
            valB = new Date(b.CookedDate).getTime();
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
      return itemsToSort;
    }

    return processed;
  }, [initialItems, searchQuery, sortValue]);
}
