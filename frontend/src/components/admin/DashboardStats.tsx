import { useEffect } from "react";
import {
  ClipboardList,
  FileCheck,
  FileX,
  Loader2,
  PackageCheck,
  Truck,
  Users,
} from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import StatCard from "@/components/admin/StatCard";

export const DashboardStats: React.FC = () => {
  const { dashboardStats, getDashboardStats, isLoading } = useAdminStore();

  useEffect(() => {
      getDashboardStats();
  }, [getDashboardStats]);

  if (isLoading && !dashboardStats) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Users className="h-5 w-5" />}
        title="Total Users"
        value={dashboardStats?.totalUsers || 0}
        color="text-blue-500"
      />
      <StatCard
        icon={<FileCheck className="h-5 w-5" />}
        title="Pending Charity Verifications"
        value={dashboardStats?.pendingCharityVerifications || 0}
        color="text-yellow-500"
      />
      <StatCard
        icon={<FileX className="h-5 w-5" />}
        title="Pending Delivery Verifications"
        value={dashboardStats?.pendingDeliveryVerifications || 0}
        color="text-orange-500"
      />
      <StatCard
        icon={<PackageCheck className="h-5 w-5" />}
        title="Active Food Listings"
        value={dashboardStats?.activeFoodListings || 0}
        color="text-green-500"
      />
      <StatCard
        icon={<ClipboardList className="h-5 w-5" />}
        title="Pending Orders"
        value={dashboardStats?.pendingOrders || 0}
        color="text-blue-500"
      />
      <StatCard
        icon={<PackageCheck className="h-5 w-5" />}
        title="Pending Donation Claims"
        value={dashboardStats?.pendingDonationClaims || 0}
        color="text-teal-500"
      />
      <StatCard
        icon={<Truck className="h-5 w-5" />}
        title="Active Deliveries"
        value={dashboardStats?.activeDeliveries || 0}
        color="text-emerald-500"
      />
    </div>
  );
};
