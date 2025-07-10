import { Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify"
import { useNotificationStore } from "@/store/notificationStore";
import NotificationBell from "./NotificationBell";
import UserAvatarDropdown from "./UserAvatarDropDown";

const navItems = [
  { path: "/services", label: "Services" },
  { path: "/foods", label: "Foods" },
  { path: "/contact", label: "Contact" },
];

const Navbar: React.FC = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // If the user is logged in, start fetching notifications
    if (isLoggedIn && token) {
    // Fetch immediately on load
    fetchNotifications(token);

    // Then fetch every 15 seconds
    intervalId = setInterval(() => {
      fetchNotifications(token);
    }, 15000); // 15 seconds
    }
    return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    };
  }, [isLoggedIn, token, fetchNotifications]);

  const handleLogout = () => {
    logout();
    toast.info("You have been logged out");
    navigate("/");
    if (isSheetOpen) {
      setIsSheetOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-text/10 bg-highlight shadow-sm backdrop-blur-md font-sans">
    <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Logo and Home Link */}
      <Link
      to="/"
      className="flex items-center space-x-2 text-dark-text hover:text-brand-green transition-all duration-200"
      >
      <div className="flex items-center pr-2">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white">
          <img
            src="/assets/FWR_Logo.png"
            alt="FWR Logo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
     
      </Link>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:flex items-center space-x-8">
      {navItems.map((item) => (
        <Link
        key={item.label}
        to={item.path}
        className="relative text-sm font-medium text-white hover:text-brand-green transition-all duration-200 group py-2"
        >
        {item.label}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-green transition-all duration-200 group-hover:w-full"></span>
        </Link>
      ))}
      </nav>

      {/* Desktop Auth Section */}
      <div className="hidden lg:flex items-center gap-3">
      {isLoggedIn ? (
        <div className="flex items-center gap-3">
        <NotificationBell />
        <UserAvatarDropdown onLogout={handleLogout} />
        </div>
      ) : (
        <Button
        asChild
        className="bg-light-beige text-dark-text hover:bg-brand-green hover:text-white transition-all duration-200 font-medium px-6 py-2 rounded-lg shadow-sm hover:shadow-md"
        >
        <Link to="/login">Login</Link>
        </Button>
      )}
      </div>

      {/* Mobile Navigation Section */}
      <div className="lg:hidden flex items-center gap-3">
      {isLoggedIn && (
        <div className="flex items-center gap-2">
        <NotificationBell />
        <UserAvatarDropdown onLogout={handleLogout} />
        </div>
      )}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-dark-text bg-light-beige/90 border-dark-text/20 hover:bg-brand-green hover:text-white transition-all duration-200 shadow-sm"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
        </SheetTrigger>
        <SheetOverlay className="bg-black/50 backdrop-blur-sm" />
        <SheetContent
        side="right"
        className="bg-pale-mint text-dark-text font-sans w-[300px] sm:w-[350px] p-0 border-l border-dark-text/10"
        hideCloseButton
        >
        <SheetHeader className="border-b border-dark-text/10 p-6 flex flex-row justify-between items-center">
          <SheetClose asChild>
          <Link to="/" className="flex items-center space-x-2">
            <SheetTitle className="flex items-center space-x-2 text-dark-text">
            <Sparkles className="h-5 w-5 text-brand-green" />
            <span className="font-serif text-lg font-bold">
              FoodWaste
            </span>
            </SheetTitle>
          </Link>
          </SheetClose>
          <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-dark-text hover:bg-dark-text/10 rounded-full transition-all duration-200"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
          </SheetClose>
        </SheetHeader>
        
        <div className="flex flex-col p-6 space-y-1">
          <SheetClose asChild>
          <Link
            to="/"
            className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-dark-text hover:bg-brand-green/10 hover:text-brand-green transition-all duration-200"
          >
            Home
          </Link>
          </SheetClose>
          
          {navItems.map((item) => (
          <SheetClose asChild key={item.label}>
            <Link
            to={item.path}
            className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-dark-text hover:bg-brand-green/10 hover:text-brand-green transition-all duration-200"
            onClick={() => setIsSheetOpen(false)}
            >
            {item.label}
            </Link>
          </SheetClose>
          ))}
          
          <div className="pt-6 mt-6 border-t border-dark-text/10">
          {isLoggedIn ? (
            <SheetClose asChild>
            <Button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 rounded-lg py-3 font-medium shadow-sm"
              variant="destructive"
            >
              Logout
            </Button>
            </SheetClose>
          ) : (
            <SheetClose asChild>
            <Button
              asChild
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white transition-all duration-200 rounded-lg py-3 font-medium shadow-sm"
            >
              <Link to="/login">Login</Link>
            </Button>
            </SheetClose>
          )}
          </div>
        </div>
        </SheetContent>
      </Sheet>
      </div>
    </div>
    </header>
  );
}

export default Navbar;