import React, { useState, useEffect } from "react";
import FoodCard from "@/components/food/FoodCard";
import type { FoodItem } from "@/lib/types/FoodItem";
import sample_food_listings from "@/data/sample_food_listings.json";

const FoodListPage: React.FC = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setItems(sample_food_listings as FoodItem[]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center text-dark-text">
        Loading food items...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container mx-auto p-4 text-center text-dark-text">
        No food items available at the moment.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-dark-text mb-6 md:mb-8 text-center">
        Available Foods
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {items.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default FoodListPage;
