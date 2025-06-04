import { useState, useEffect } from "react";
import type { FoodItem, FoodItemFormData } from "@/lib/types/FoodItem"; // Adjust path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FoodItemFormProps {
  initialData?: FoodItem | null;
  onSubmit: (formData: FoodItemFormData) => void;
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

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.Title);
      setDescription(initialData.Description);
      setQuantity(initialData.Quantity);
      setFoodType(initialData.FoodType || ""); 
      setCookedDate(
        initialData.CookedDate
          ? new Date(initialData.CookedDate).toISOString().slice(0, 16)
          : ""
      );
      setPickupStart(
        initialData.PickupWindowStart
          ? new Date(initialData.PickupWindowStart).toISOString().slice(0, 16)
          : ""
      );
      setPickupEnd(
        initialData.PickupWindowEnd
          ? new Date(initialData.PickupWindowEnd).toISOString().slice(0, 16)
          : ""
      );
      setPickupLocation(initialData.PickupLocation);
      setIsDonation(initialData.IsDonation);
      setPrice(initialData.IsDonation ? "" : initialData.Price);
      setDietaryInfo(initialData.DietaryInfo || "");
      setImageFile(null);
      setImagePreview(initialData.image || null);
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
      setImagePreview(initialData?.image || null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData: FoodItemFormData = {
      Title: title,
      Description: description,
      Quantity: quantity,
      FoodType: foodType,
      CookedDate: new Date(cookedDate).toISOString(),
      PickupWindowStart: new Date(pickupStart).toISOString(),
      PickupWindowEnd: new Date(pickupEnd).toISOString(),
      PickupLocation: pickupLocation,
      IsDonation: isDonation,
      Price: isDonation ? 0 : Number(price),
      DietaryInfo: dietaryInfo,
      imageFile: imageFile || undefined,
    };
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 md:space-y-6 max-h-[80vh] overflow-y-auto p-1"
    >
      <div>
        <Label htmlFor="title" className="text-brand-green font-medium">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description" className="text-brand-green font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity" className="text-brand-green font-medium">
            Serving Quantity (e.g., "Serves 2-3")
          </Label>
          <Input
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="foodType" className="text-brand-green font-medium">
            Food Type (e.g., Italian, Bakery)
          </Label>
          <Input
            id="foodType"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image" className="text-brand-green font-medium">
          Food Image
        </Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pale-mint file:text-brand-green hover:file:bg-brand-green/20"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 h-32 w-auto object-cover rounded"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="cookedDate" className="text-brand-green font-medium">
            Cooked Date & Time
          </Label>
          <Input
            id="cookedDate"
            type="datetime-local"
            value={cookedDate}
            onChange={(e) => setCookedDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="pickupStart" className="text-brand-green font-medium">
            Pickup Window Start
          </Label>
          <Input
            id="pickupStart"
            type="datetime-local"
            value={pickupStart}
            onChange={(e) => setPickupStart(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="pickupEnd" className="text-brand-green font-medium">
            Pickup Window End
          </Label>
          <Input
            id="pickupEnd"
            type="datetime-local"
            value={pickupEnd}
            onChange={(e) => setPickupEnd(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="pickupLocation"
          className="text-brand-green font-medium"
        >
          Pickup Location
        </Label>
        <Input
          id="pickupLocation"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="isDonation"
            checked={isDonation}
            onCheckedChange={(checked) => setIsDonation(Boolean(checked))}
          />
          <Label htmlFor="isDonation" className="text-brand-green font-medium">
            This is a Donation
          </Label>
        </div>
        {!isDonation && (
          <div>
            <Label htmlFor="price" className="text-brand-green font-medium">
              Price (BDT)
            </Label>
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
      </div>

      <div>
        <Label htmlFor="dietaryInfo" className="text-brand-green font-medium">
          Dietary Info (e.g., Contains nuts, Vegan)
        </Label>
        <Input
          id="dietaryInfo"
          value={dietaryInfo}
          onChange={(e) => setDietaryInfo(e.target.value)}
        />
      </div>

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
            ? initialData
              ? "Saving..."
              : "Adding..."
            : initialData
            ? "Save Changes"
            : "Add Item"}
        </Button>
      </div>
    </form>
  );
};

export default FoodItemForm;
