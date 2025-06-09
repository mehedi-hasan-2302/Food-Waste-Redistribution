import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles: string[];
  profileMustBeComplete?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  profileMustBeComplete = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated(),
    isLoading: state.isLoading,
  }));

  // Show a loading spinner while Zustand is rehydrating the auth state from storage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    toast.error("You must be logged in to access this page.");
    return <Navigate to="/login" replace />;
  }

  // 2. Check if the user's role is in the list of allowed roles
  if (!allowedRoles.includes(user.role)) {
    toast.error("You do not have permission to view this page.");
    return <Navigate to="/" replace />;
  }

  if (profileMustBeComplete && !user.isProfileComplete) {
    toast.warn("Please complete your profile to access this feature.");
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
