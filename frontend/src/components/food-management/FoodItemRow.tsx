import type { FoodItem } from "@/lib/types/FoodItem";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";

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
  const isActionDisabled = item.isOrdered; 
  const isExpired = new Date(item.PickupWindowEnd) < new Date();

  return (
    <TableRow>
      <TableCell>
        <img
          src={
            item.image && item.image !== "imagepath"
              ? item.image
              : "https://placehold.co/100x75/D9E3DF/1A3F36?text=Food"
          }
          alt={item.Title}
          className="h-16 w-24 object-cover rounded"
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
        {new Date(item.PickupWindowEnd).toLocaleDateString()}{" "}
        {new Date(item.PickupWindowEnd).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </TableCell>
      <TableCell>
        {isExpired ? (
          <Badge variant="destructive">Expired</Badge>
        ) : item.isOrdered ? (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 border-blue-300"
          >
            Ordered
          </Badge>
        ) : (
          <Badge
            variant="default"
            className="bg-green-100 text-green-700 border-green-300"
          >
            Available
          </Badge>
        )}
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
              className={
                isActionDisabled
                  ? "cursor-not-allowed text-muted-foreground"
                  : ""
              }
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to delete "${item.Title}"?`
                  )
                ) {
                  onDelete(item.id);
                }
              }}
              disabled={isActionDisabled}
              className={`text-red-600 hover:!text-red-600 hover:!bg-red-50 ${
                isActionDisabled
                  ? "cursor-not-allowed !text-muted-foreground hover:!text-muted-foreground"
                  : ""
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
