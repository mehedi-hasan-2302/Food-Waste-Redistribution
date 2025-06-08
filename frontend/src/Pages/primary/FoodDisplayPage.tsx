import FoodItemDetail from "@/components/food/FoodItemDetail";
import { useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useFoodStore } from "@/store/foodStore";

const FoodDisplayPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const token = useAuthStore((state) => state.token);
  const selectedItem = useFoodStore((state) => state.selectedItem);
  const isLoading = useFoodStore((state) => state.isLoading);
  const error = useFoodStore((state) => state.error);
  const fetchListingById = useFoodStore((state) => state.fetchListingById);
  const clearSelectedItem = useFoodStore((state) => state.clearSelectedItem);

  useEffect(() => {
    if (itemId && token) {
      // Simulate fetching item by ID
      fetchListingById(token, itemId);
    }
    return () => {
      clearSelectedItem();
    }
  }, [itemId, token, fetchListingById, clearSelectedItem]);

  if (isLoading || selectedItem === undefined) {
    return (
      <div className="container mx-auto p-4 text-center text-dark-text">
        Loading item details...
      </div>
    );
  }

  if (error || !selectedItem) {
    return (
      <div className="container mx-auto p-4 text-center text-dark-text">
        <h2 className="font-serif text-2xl text-red-600 mb-4">
          Food Item Not Found
        </h2>
        <p>
          The food item you are looking for does not exist or may have been
          removed.
        </p>
        <RouterLink
          to="/foods"
          className="mt-4 inline-block text-highlight hover:underline"
        >
          Back to Food List
        </RouterLink>
      </div>
    );
  }

  return (
    <div className="bg-pale-mint min-h-screen py-24">
      <FoodItemDetail item={selectedItem} />
    </div>
  );
};

export default FoodDisplayPage;
