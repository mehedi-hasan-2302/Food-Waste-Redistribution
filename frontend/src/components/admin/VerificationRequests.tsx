import { useEffect } from "react";
import { useAdminStore } from "../../store/adminStore";
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";
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

const VerificationRequests: React.FC = () => {
  const {
    pendingCharities,
    pendingDelivery,
    getPendingVerifications,
    processVerification,
    isLoading,
  } = useAdminStore();

  useEffect(() => {
    getPendingVerifications();
  }, [getPendingVerifications]);

  const handleProcess = (
    userId: number,
    type: "charity" | "delivery",
    status: "approve" | "reject"
  ) => {
    processVerification({
      userId,
      type,
      status,
      reason: status === "reject" ? "Rejected by admin" : "Approved by admin",
    });
  };

  const charities = (pendingCharities || []).map((c) => ({
    ...c,
    type: "charity" as const,
  }));
  const deliveries = (pendingDelivery || []).map((d) => ({
    ...d,
    type: "delivery" as const,
  }));
  const verifications = [...charities, ...deliveries];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">
          Pending Verification Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && verifications.length === 0 ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
          </div>
        ) : verifications.length === 0 ? (
          <p className="text-center text-gray-500 py-4 font-sans">
            No pending verifications.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-sans">User</TableHead>
                <TableHead className="font-sans">Type</TableHead>
                <TableHead className="font-sans">Document</TableHead>
                <TableHead className="text-right font-sans">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-sans">
              {verifications.map((v) => (
                <TableRow key={v.ProfileID}>
                  <TableCell>
                    <div className="font-medium">
                      {v.type === "charity" ? v.OrganizationName : v.FullName}
                    </div>
                    <div className="text-sm text-gray-500">{v.user.Email}</div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        v.type === "charity"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {v.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={
                        v.type === "charity"
                          ? v.GovRegistrationDocPath
                          : v.NIDPath
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-highlight hover:underline"
                    >
                      View Document
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mr-2 text-green-600 hover:bg-green-100 cursor-pointer"
                      onClick={() =>
                        handleProcess(v.user.UserID, v.type, "approve")
                      }
                      disabled={isLoading}
                    >
                      <ShieldCheck className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-100 cursor-pointer"
                      onClick={() =>
                        handleProcess(v.user.UserID, v.type, "reject")
                      }
                      disabled={isLoading}
                    >
                      <ShieldX className="h-4 w-4 mr-1" /> Reject
                    </Button>
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

export default VerificationRequests;
