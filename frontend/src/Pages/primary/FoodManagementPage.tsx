import { useState, useEffect } from "react";
import type { FoodItem, FoodItemFormData } from "@/lib/types/FoodItem"; 
import FoodItemForm from "@/components/food-management/FoodItemForm"; 
import FoodItemRow from "@/components/food-management/FoodItemRow"; 
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  //   DialogFooter, // Optional
  //   DialogClose, // Optional
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

// --- Mock API Call Placeholders ---
let MOCK_DB_ITEMS: FoodItem[] = [
  // Initial mock data for the logged-in donor
  {
    id: "food1",
    Title: "Delicious Pasta",
    Description: "...",
    Quantity: "Serves 2",
    FoodType: "Italian",
    CookedDate: new Date(Date.now() - 86400000).toISOString(),
    PickupWindowStart: new Date().toISOString(),
    PickupWindowEnd: new Date(Date.now() + 86400000 * 2).toISOString(),
    PickupLocation: "Main St",
    IsDonation: false,
    Price: 200,
    DietaryInfo: "Contains gluten",
    image: "https://placehold.co/100x75/D9E3DF/1A3F36?text=Pasta",
    isOrdered: false,
  },
  {
    id: "food2",
    Title: "Charity Soup Kitchen",
    Description: "...",
    Quantity: "Serves 10",
    FoodType: "Soup",
    CookedDate: new Date().toISOString(),
    PickupWindowStart: new Date().toISOString(),
    PickupWindowEnd: new Date(Date.now() + 86400000 * 3).toISOString(),
    PickupLocation: "Community Hall",
    IsDonation: true,
    Price: 0,
    DietaryInfo: "Vegan",
    image: "https://placehold.co/100x75/D9E3DF/1A3F36?text=Soup",
    isOrdered: true,
  },
];

const fetchMyFoodItemsAPI = async (): Promise<FoodItem[]> => {
  console.log("API: Fetching my food items...");
  return new Promise((resolve) =>
    setTimeout(() => resolve([...MOCK_DB_ITEMS]), 500)
  );
};

const addFoodItemAPI = async (data: FoodItemFormData): Promise<FoodItem> => {
  console.log("API: Adding food item...", data);
  const newItem: FoodItem = {
    ...data,
    id: `food${Date.now()}`, // Generate simple unique ID
    image: data.imageFile
      ? URL.createObjectURL(data.imageFile)
      : "https://placehold.co/100x75/D9E3DF/1A3F36?text=New",
    isOrdered: false,
  };
  MOCK_DB_ITEMS.push(newItem);
  return new Promise((resolve) => setTimeout(() => resolve(newItem), 500));
};

const updateFoodItemAPI = async (
  itemId: string,
  data: FoodItemFormData
): Promise<FoodItem> => {
  console.log(`API: Updating food item ${itemId}...`, data);
  const itemIndex = MOCK_DB_ITEMS.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) throw new Error("Item not found");
  const updatedItem = {
    ...MOCK_DB_ITEMS[itemIndex],
    ...data,
    image: data.imageFile
      ? URL.createObjectURL(data.imageFile)
      : MOCK_DB_ITEMS[itemIndex].image,
  };
  MOCK_DB_ITEMS[itemIndex] = updatedItem;
  return new Promise((resolve) => setTimeout(() => resolve(updatedItem), 500));
};

const deleteFoodItemAPI = async (
  itemId: string
): Promise<{ success: boolean }> => {
  console.log(`API: Deleting food item ${itemId}...`);
  MOCK_DB_ITEMS = MOCK_DB_ITEMS.filter((item) => item.id !== itemId);
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 500)
  );
};
// --- End Mock API Call Placeholders ---

const FoodManagementPage: React.FC = () => {
  const [myFoodItems, setMyFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        const items = await fetchMyFoodItemsAPI();
        setMyFoodItems(items);
      } catch (error) {
        console.error("Failed to fetch food items:", error);
      }
      setIsLoading(false);
    };
    loadItems();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleEditItem = (item: FoodItem) => {
    if (item.isOrdered) {
      alert("This item has been ordered and cannot be edited.");
      return;
    }
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    const itemToDelete = myFoodItems.find((item) => item.id === itemId);
    if (itemToDelete?.isOrdered) {
      alert("This item has been ordered and cannot be deleted.");
      return;
    }

    setIsSaving(true);
    try {
      await deleteFoodItemAPI(itemId);
      setMyFoodItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
    setIsSaving(false);
  };

  const handleFormSubmit = async (formData: FoodItemFormData) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        // Editing existing item
        const updatedItem = await updateFoodItemAPI(editingItem.id, formData);
        setMyFoodItems((prevItems) =>
          prevItems.map((item) =>
            item.id === editingItem.id ? updatedItem : item
          )
        );
      } else {
        // Adding new item
        const newItem = await addFoodItemAPI(formData);
        setMyFoodItems((prevItems) => [newItem, ...prevItems]);
      }
      setIsFormModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save item:", error);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        Loading your food items...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-20 md:mt-24 md:p-6 font-sans">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-dark-text">
          Manage Your Food Items
        </h1>
        <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenAddModal}
              className="bg-highlight hover:bg-highlight/90 text-white"
            >
              <PlusCircle size={20} className="mr-2" /> Add New Food Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] md:max-w-[700px] bg-white lg:max-w-[800px]">
            {" "}
            {/* Wider modal */}
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-dark-text">
                {editingItem ? "Edit Food Item" : "Add New Food Item"}
              </DialogTitle>
            </DialogHeader>
            <FoodItemForm
              initialData={editingItem}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormModalOpen(false)}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>
      </div>

      {myFoodItems.length === 0 ? (
        <p className="text-center text-dark-text/70 py-10">
          You haven't added any food items yet.
        </p>
      ) : (
        <Table>
          <TableCaption className="mt-4">
            A list of your food items.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price/Type</TableHead>
              <TableHead>Pickup End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myFoodItems.map((item) => (
              <FoodItemRow
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default FoodManagementPage;
