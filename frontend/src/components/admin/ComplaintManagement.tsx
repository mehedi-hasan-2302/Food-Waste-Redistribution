import { useEffect } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import type { AdminComplaint } from "@/lib/types/admin";
import { Badge } from "@/components/ui/badge";
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

const statusClassName = (status: string) => {
  switch (status) {
    case "RESOLVED":
      return "bg-green-100 text-green-800";
    case "DISMISSED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const getReference = (complaint: AdminComplaint) => {
  if (complaint.order?.OrderID) return `Order #${complaint.order.OrderID}`;
  if (complaint.claim?.ClaimID) return `Claim #${complaint.claim.ClaimID}`;
  if (complaint.delivery?.DeliveryID) {
    return `Delivery #${complaint.delivery.DeliveryID}`;
  }
  return "General";
};

const ComplaintManagement: React.FC = () => {
  const { complaints, getComplaints, resolveComplaint, isLoading } =
    useAdminStore();

  useEffect(() => {
    getComplaints();
  }, [getComplaints]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Complaint Management</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && complaints.length === 0 ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
          </div>
        ) : complaints.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-sm text-gray-500">
            No complaints have been reported yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>People</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.FeedbackID}>
                  <TableCell className="max-w-md whitespace-normal">
                    <div className="font-medium">
                      Complaint #{complaint.FeedbackID}
                    </div>
                    <div className="text-sm text-gray-600">
                      {complaint.Message || "No message provided."}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      From: {complaint.submitter?.Username || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">
                      About: {complaint.regarding?.Username || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{getReference(complaint)}</div>
                    {complaint.listing?.Title && (
                      <div className="max-w-44 truncate text-sm text-gray-500">
                        {complaint.listing.Title}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusClassName(complaint.AdminActionStatus)}>
                      {complaint.AdminActionStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {complaint.AdminActionStatus === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoading}
                          onClick={() =>
                            resolveComplaint(complaint.FeedbackID, "dismiss")
                          }
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() =>
                            resolveComplaint(complaint.FeedbackID, "resolve")
                          }
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Resolve
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Closed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplaintManagement;
