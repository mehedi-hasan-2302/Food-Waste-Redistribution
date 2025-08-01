import { useState, useEffect } from "react";
import type { FoodItem, FoodItemFormData } from "@/lib/types/FoodItem"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

interface FoodItemFormProps {
  initialData?: FoodItem | null;
  onSubmit: (formData: Partial<FoodItemFormData>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const FoodItemForm: React.FC<FoodItemFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSaving,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [foodType, setFoodType] = useState("");
  const [cookedDate, setCookedDate] = useState("");
  const [pickupStart, setPickupStart] = useState("");
  const [pickupEnd, setPickupEnd] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [isDonation, setIsDonation] = useState(false);
  const [price, setPrice] = useState<number | string>("");
  const [dietaryInfo, setDietaryInfo] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isEditMode = !!initialData;

  // Helper function to convert UTC date to local datetime-local input format
  const toLocalDateTimeString = (dateString: string): string => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.Title || "");
      setDescription(initialData.Description || "");
      setQuantity(initialData.Quantity || "");
      setFoodType(initialData.FoodType || "");
      setCookedDate(
        initialData.CookedDate
          ? toLocalDateTimeString(initialData.CookedDate)
          : ""
      );
      setPickupStart(
        initialData.PickupWindowStart
          ? toLocalDateTimeString(initialData.PickupWindowStart)
          : ""
      );
      setPickupEnd(
        initialData.PickupWindowEnd
          ? toLocalDateTimeString(initialData.PickupWindowEnd)
          : ""
      );
      setPickupLocation(initialData.PickupLocation || "");
      setIsDonation(initialData.IsDonation || false);
      setPrice(initialData.IsDonation ? "" : initialData.Price);
      setDietaryInfo(initialData.DietaryInfo || "");
      setImageFile(null);
      setImagePreview(initialData.ImagePath || null);
    } else {
      setTitle("");
      setDescription("");
      setQuantity("");
      setFoodType("");
      setCookedDate("");
      setPickupStart("");
      setPickupEnd("");
      setPickupLocation("");
      setIsDonation(false);
      setPrice("");
      setDietaryInfo("");
      setImageFile(null);
      setImagePreview(null);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(initialData?.ImagePath || null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formData: Partial<FoodItemFormData> = {
      Title: title,
      Description: description,
      Quantity: quantity,
      Price: isDonation ? 0 : Number(price),
      DietaryInfo: dietaryInfo,
      imageFile: imageFile || undefined,
    };

    if (!isEditMode) {
      if (
        !foodType ||
        !cookedDate ||
        !pickupStart ||
        !pickupEnd ||
        !pickupLocation
      ) {
        toast.error("Please fill out all required fields.");
        return;
      }
      formData = {
        ...formData,
        FoodType: foodType,
        CookedDate: new Date(cookedDate).toISOString(),
        PickupWindowStart: new Date(pickupStart).toISOString(),
        PickupWindowEnd: new Date(pickupEnd).toISOString(),
        PickupLocation: pickupLocation,
        IsDonation: isDonation,
      };
    };
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 md:space-y-6 max-h-[80vh] overflow-y-auto p-1"
    >
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="quantity">Serving Quantity</Label>
        <Input
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="dietaryInfo">Dietary Info</Label>
        <Input
          id="dietaryInfo"
          value={dietaryInfo}
          onChange={(e) => setDietaryInfo(e.target.value)}
        />
      </div>

      {/* --- Fields ONLY visible when ADDING a new item --- */}
      {!isEditMode && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="foodType">Food Type</Label>
              <Input
                id="foodType"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                required
              />
      <div>
        <Label htmlFor="image">Food Image (Optional for update)</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 h-32 w-auto object-cover rounded"
          />
        )}
      </div>
            </div>
            <div>
              <Label htmlFor="pickupLocation">Pickup Location</Label>
              <Input
                id="pickupLocation"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cookedDate">Cooked Date & Time</Label>
              <Input
                id="cookedDate"
                type="datetime-local"
                value={cookedDate}
                onChange={(e) => setCookedDate(e.target.value)}
                required
                max={minDateTime}
              />
            </div>
            <div>
              <Label htmlFor="pickupStart">Pickup Window Start</Label>
              <Input
                id="pickupStart"
                type="datetime-local"
                value={pickupStart}
                onChange={(e) => setPickupStart(e.target.value)}
                required
                min={cookedDate || minDateTime}
              />
            </div>
            <div>
              <Label htmlFor="pickupEnd">Pickup Window End</Label>
              <Input
                id="pickupEnd"
                type="datetime-local"
                value={pickupEnd}
                onChange={(e) => setPickupEnd(e.target.value)}
                required
                min={pickupStart || minDateTime}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="isDonation"
              checked={isDonation}
              onCheckedChange={(checked) => setIsDonation(Boolean(checked))}
            />
            <Label htmlFor="isDonation">This is a Donation</Label>
          </div>
        </>
      )}

      {!isDonation && (
        <div>
          <Label htmlFor="price">Price (BDT)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required={!isDonation}
          />
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-highlight hover:bg-highlight/90 text-white"
          disabled={isSaving}
        >
          {isSaving
            ? isEditMode
              ? "Saving..."
              : "Adding..."
            : isEditMode
            ? "Save Changes"
            : "Add Item"}
        </Button>
      </div>
    </form>
  );
};

export default FoodItemForm;
