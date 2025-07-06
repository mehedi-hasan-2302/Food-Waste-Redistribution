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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Loader2 } from "lucide-react";
import { useFoodStore } from "@/store/foodStore";
import { useAuthStore } from "@/store/authStore";


const FoodManagementPage: React.FC = () => {

  // zustand state attributes
  const myListings = useFoodStore((state) => state.myListings);
  const isLoading = useFoodStore((state) => state.isLoading);
  const fetchMyListings = useFoodStore((state) => state.fetchMyListings);
  const createListing = useFoodStore((state) => state.createListing);
  const updateListing = useFoodStore((state) => state.updateListing);
  const deleteListing = useFoodStore((state) => state.deleteListing);
  const token = useAuthStore((state) => state.token);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  useEffect(() => {
    // Fetch items only if a token is available
    if (token) {
      fetchMyListings(token);
    }
  }, [token, fetchMyListings]);

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
    const itemToDelete = myListings.find((item) => String(item.ListingID) === itemId);
    if (itemToDelete?.isOrdered) {
      alert("This item has been ordered and cannot be deleted.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete "${itemToDelete?.Title}"?`
      )
    ) {
      await deleteListing(token!, itemId);
    }
  };

  const handleFormSubmit = async (formData: Partial<FoodItemFormData>) => {
    let success = false;
    if (editingItem) {
      const updatedItem = await updateListing(
        token!,
        String(editingItem.ListingID),
        formData
      );
      success = !!updatedItem;
    } else {
      const newItem = await createListing(token!, formData);
      success = !!newItem;
    }

    if (success) {
      setIsFormModalOpen(false);
      setEditingItem(null);
    }
  };

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
              isSaving={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && myListings.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-dark-text" />
        </div>
      ) : myListings.length === 0 ? (
        <div className="text-center text-dark-text/70 py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-xl font-semibold">
            You haven't added any food items yet.
          </p>
          <p className="mt-2">Click "Add New Food Item" to get started!</p>
        </div>
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
            {myListings.map((item) => (
              <FoodItemRow
                key={item.ListingID}
                item={item}
                onEdit={handleEditItem}
                onDelete={() => handleDeleteItem(String(item.ListingID))}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default FoodManagementPage;
