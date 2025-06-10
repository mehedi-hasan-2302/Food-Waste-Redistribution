// src/components/auth/UserAvatarDropdown.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, LayoutDashboard } from "lucide-react";

interface UserAvatarDropdownProps {
  onLogout: () => void; // Pass the logout handler from the Navbar
}

const UserAvatarDropdown: React.FC<UserAvatarDropdownProps> = ({
  onLogout,
}) => {
  const user = useAuthStore((state) => state.user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full text-white hover:text-white hover:bg-white/20"
        >
          <User className="h-5 w-5" />
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        {user?.role === "DONOR_SELLER" && (
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/manage">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Manage Food</span>
          </Link>
        </DropdownMenuItem>
         )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatarDropdown;
