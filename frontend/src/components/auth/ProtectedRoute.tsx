import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useShallow } from "zustand/shallow";
interface ProtectedRouteProps {
  allowedRoles: string[];
  profileMustBeComplete?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  profileMustBeComplete = false,
}) => {
  const { user, token, isLoading } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      token: state.token,
      isLoading: state.isLoading,
    }))
  );

  const isAuthenticated = !!token && !!user;
  const redirect = !isLoading && !isAuthenticated
    ? {
        to: "/login",
        message: "You must be logged in to access this page.",
        type: "error" as const,
      }
    : !isLoading && user && !allowedRoles.includes(user.role)
      ? {
          to: "/",
          message: "You do not have permission to view this page.",
          type: "error" as const,
        }
      : !isLoading && profileMustBeComplete && user && !user.isProfileComplete
        ? {
            to: "/profile",
            message: "Please complete your profile to access this feature.",
            type: "warn" as const,
          }
        : null;

  useEffect(() => {
    if (!redirect) return;

    if (redirect.type === "warn") {
      toast.warn(redirect.message);
      return;
    }

    toast.error(redirect.message);
  }, [redirect]);

  // Show a loading spinner while Zustand is rehydrating the auth state from storage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if the user's role is in the list of allowed roles
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (profileMustBeComplete && !user.isProfileComplete) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
