import type { FoodItem } from "@/lib/types/FoodItem";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FoodItemRowProps {
  item: FoodItem;
  onEdit: (item: FoodItem) => void;
  onDelete: (itemId: string) => void;
}

const FoodItemRow: React.FC<FoodItemRowProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const isActionDisabled =
    item.ListingStatus === "ORDERED" || item.ListingStatus === "COMPLETED"; 
  const isExpired = new Date(item.PickupWindowEnd) < new Date();

  let statusBadge;
  if (isExpired && item.ListingStatus !== 'COMPLETED') {
    statusBadge = <Badge variant="destructive">Expired</Badge>;
  } else {
    switch (item.ListingStatus) {
      case 'ACTIVE':
        statusBadge = <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100">Available</Badge>;
        break;
      case 'ORDERED':
        statusBadge = <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">Ordered</Badge>;
        break;
      case 'COMPLETED':
         statusBadge = <Badge variant="secondary" className="bg-gray-200 text-gray-800 border-gray-300">Completed</Badge>;
        break;
      default:
        statusBadge = <Badge variant="outline">{item.ListingStatus}</Badge>;
    }
  }

  return (
    <TableRow key={item.ListingID}>
      <TableCell>
        <img
          src={item.ImagePath || "https://placehold.co/100x75/D9E3DF/1A3F36?text=Food"}
          alt={item.Title}
          className="h-16 w-24 object-cover rounded-md"
        />
      </TableCell>
      <TableCell className="font-medium text-dark-text">{item.Title}</TableCell>
      <TableCell className="text-dark-text/80">
        {item.IsDonation ? (
          <Badge variant="outline" className="border-highlight text-highlight">
            Donation
          </Badge>
        ) : (
          `${item.Price} BDT`
        )}
      </TableCell>
      <TableCell className="text-dark-text/80">
        {new Date(item.PickupWindowEnd).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}{" "}
        {new Date(item.PickupWindowEnd).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </TableCell>
      <TableCell>
        {statusBadge}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[160px] bg-popover text-popover-foreground"
          >
            <DropdownMenuItem
              onClick={() => onEdit(item)}
              disabled={isActionDisabled}
              className={isActionDisabled ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer"}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(String(item.ListingID))}
              disabled={isActionDisabled}
              className={`text-red-600 focus:text-red-600 focus:bg-red-50 ${
                isActionDisabled ? "cursor-not-allowed !text-muted-foreground" : "cursor-pointer"
              }`}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default FoodItemRow;
