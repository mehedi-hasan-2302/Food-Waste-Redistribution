import { useState, useEffect } from "react";
import { useAdminStore } from "@/store/adminStore";
import type { FoodListing } from "@/lib/types/admin";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ReasonModal from "./ReasonModal";

const ListingManagement: React.FC = () => {
  const { foodListings, getAllFoodListings, removeFoodListing, isLoading } =
    useAdminStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(
    null
  );

  useEffect(() => {
    getAllFoodListings();
  }, [getAllFoodListings]);

  const handleOpenRemoveModal = (listing: FoodListing) => {
    setSelectedListing(listing);
    setModalOpen(true);
  };

  const handleConfirmRemove = (reason: string) => {
    if (selectedListing) {
      removeFoodListing(selectedListing.ListingID, reason).then((success) => {
        if (success) setModalOpen(false);
      });
    }
  };

  return (
    <>
      <ReasonModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmRemove}
        title={`Remove Listing: "${selectedListing?.Title}"`}
        description="Please provide a clear reason for removing this food listing. This action cannot be undone."
        confirmText="Confirm Removal"
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Food Listing Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && foodListings.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-sans">Title</TableHead>
                  <TableHead className="font-sans">Donor</TableHead>
                  <TableHead className="font-sans">Type</TableHead>
                  <TableHead className="font-sans">Status</TableHead>
                  <TableHead className="text-right font-sans">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-sans">
                {foodListings.map((listing: FoodListing) => (
                  <TableRow key={listing.ListingID}>
                    <TableCell className="font-medium">
                      {listing.Title}
                    </TableCell>
                    <TableCell>{listing.donor.Username}</TableCell>
                    <TableCell>
                      {listing.IsDonation ? "Donation" : "Sale"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          listing.ListingStatus === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {listing.ListingStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {listing.ListingStatus !== "REMOVED" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOpenRemoveModal(listing)}
                          disabled={isLoading}
                          className="bg-red-300 text-black hover:bg-red-500 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ListingManagement;
