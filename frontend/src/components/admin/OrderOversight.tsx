import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import type { AdminDonationClaim, AdminOrder } from "@/lib/types/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusClassName = (status?: string) => {
  switch (status) {
    case "COMPLETED":
    case "DELIVERED":
    case "PAID":
      return "bg-green-100 text-green-800";
    case "PENDING":
    case "SCHEDULED":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
    case "APPROVED":
    case "IN_TRANSIT":
      return "bg-blue-100 text-blue-800";
    case "CANCELLED":
    case "REJECTED":
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatMoney = (value: string | number) => {
  const amount = Number(value || 0);
  return amount > 0 ? `Tk ${amount.toFixed(2)}` : "Tk 0.00";
};

const formatPaymentMethod = (value?: string) => {
  if (value === "PAY_ON_DELIVERY") return "Pay on delivery";
  if (value === "PAY_ON_PICKUP") return "Pay at pickup";
  return "Not set";
};

const getOrderAssignee = (order: AdminOrder) =>
  order.delivery?.independentDeliveryPersonnel?.Username || "Not assigned";

const getClaimAssignee = (claim: AdminDonationClaim) =>
  claim.delivery?.organizationVolunteer?.VolunteerName ||
  claim.delivery?.organizationVolunteer?.user?.Username ||
  "Not assigned";

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => (
  <Badge className={statusClassName(status)}>{status || "UNKNOWN"}</Badge>
);

const OrderOversight: React.FC = () => {
  const { orderOversight, getOrderOversight, isLoading } = useAdminStore();

  useEffect(() => {
    getOrderOversight();
  }, [getOrderOversight]);

  if (
    isLoading &&
    orderOversight.orders.length === 0 &&
    orderOversight.donationClaims.length === 0
  ) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Sale Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orderOversight.orders.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-gray-500">
              No sale orders yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderOversight.orders.map((order) => (
                  <TableRow key={order.OrderID}>
                    <TableCell>
                      <div className="font-medium">#{order.OrderID}</div>
                      <div className="max-w-48 truncate text-sm text-gray-500">
                        {order.listing?.Title || "Food item"}
                      </div>
                      <div className="mt-1">
                        <StatusBadge status={order.OrderStatus} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>Buyer: {order.buyer?.Username || "Unknown"}</div>
                      <div className="text-sm text-gray-500">
                        Seller: {order.seller?.Username || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{formatPaymentMethod(order.PaymentMethod)}</div>
                      <div className="mt-1">
                        <StatusBadge status={order.PaymentStatus} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{order.DeliveryType}</div>
                      <div className="text-sm text-gray-500">
                        Rider: {getOrderAssignee(order)}
                      </div>
                      {order.delivery?.DeliveryStatus && (
                        <div className="mt-1">
                          <StatusBadge status={order.delivery.DeliveryStatus} />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(
                        Number(order.FinalPrice) + Number(order.DeliveryFee)
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Donation Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {orderOversight.donationClaims.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-gray-500">
              No donation claims yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Volunteer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderOversight.donationClaims.map((claim) => (
                  <TableRow key={claim.ClaimID}>
                    <TableCell>
                      <div className="font-medium">#{claim.ClaimID}</div>
                      <div className="max-w-48 truncate text-sm text-gray-500">
                        {claim.listing?.Title || "Food item"}
                      </div>
                      <div className="mt-1">
                        <StatusBadge status={claim.ClaimStatus} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>Charity: {claim.charityOrg?.Username || "Unknown"}</div>
                      <div className="text-sm text-gray-500">
                        Donor: {claim.donor?.Username || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{claim.DeliveryType}</div>
                      {claim.delivery?.DeliveryStatus && (
                        <div className="mt-1">
                          <StatusBadge status={claim.delivery.DeliveryStatus} />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getClaimAssignee(claim)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderOversight;
