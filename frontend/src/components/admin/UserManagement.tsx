import { useState, useEffect, type FC } from "react";
import { useAdminStore } from "@/store/adminStore";
import type { AdminUser } from "@/lib/types/admin";
import { UserX, UserCheck, Loader2 } from "lucide-react";
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

export const UserManagement: FC = () => {
  const { users, getAllUsers, suspendUser, reactivateUser, isLoading } =
    useAdminStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handleOpenSuspendModal = (user: AdminUser) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleConfirmSuspend = (reason: string) => {
    if (selectedUser) {
      suspendUser(selectedUser.UserID, reason).then((success) => {
        if (success) {
          setModalOpen(false);
          setSelectedUser(null);
        }
      });
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <ReasonModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSuspend}
        title={`Suspend User: ${selectedUser?.Username}`}
        description="Please provide a clear reason for suspending this user. This reason will be logged."
        confirmText="Confirm Suspension"
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && users.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-sans">User</TableHead>
                  <TableHead className="font-sans">Role</TableHead>
                  <TableHead className="font-sans">Status</TableHead>
                  <TableHead className="text-right font-sans">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-sans">
                {users.map((user: AdminUser) => (
                  <TableRow key={user.UserID}>
                    <TableCell>
                      <div className="font-medium">{user.Username}</div>
                      <div className="text-sm text-gray-500">{user.Email}</div>
                    </TableCell>
                    <TableCell>{user.Role}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.AccountStatus === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.AccountStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.AccountStatus === "ACTIVE" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOpenSuspendModal(user)}
                          disabled={isLoading}
                          className="bg-red-300 text-black hover:bg-red-500 cursor-pointer"
                        >
                          <UserX className="h-4 w-4 mr-1" /> Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-blue-300 text-black hover:bg-blue-500 cursor-pointer"
                          onClick={() => reactivateUser(user.UserID)}
                          disabled={isLoading}
                        >
                          <UserCheck className="h-4 w-4 mr-1" /> Reactivate
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

export default UserManagement;