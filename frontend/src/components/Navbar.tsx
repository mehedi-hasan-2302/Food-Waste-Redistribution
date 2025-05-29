import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetOverlay,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";

const navItems = [
    { href: "#services", label: "Services" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
];

const  Navbar: React.FC = () => {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
      <header className="sticky top-0 z-50 w-full border-b border-dark-text/10 bg-highlight font-sans">
        <div className="container mx-auto flex h-16 max-w-screen-lg items-center justify-between px-4 md:px-6">
          {/* Logo and Home Link */}
          <a
            href="#home"
            className="flex items-center space-x-2 text-dark-text hover:text-brand-green transition-colors"
            onClick={() => isSheetOpen && setIsSheetOpen(false)}
          >
            {/* Will be replaced with actual logo component or SVG*/}
            <Sparkles className="h-6 w-6 text-brand-green" />
            <span className="font-serif text-xl text-white font-bold">
              YourLogo
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-white hover:text-brand-green transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Button
              asChild
              className="bg-light-beige text-dark-text hover:bg-brand-green/50 hover:text-light-beige px-5 py-2.5"
              variant={"outline"}
            >
              <a href="#login">Login</a>
            </Button>
          </nav>

          {/* Mobile Navigation Trigger */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="outline"
                size="icon"
                className="text-dark-text bg-light-beige border-dark-text/50 hover:bg-brand-green/50 hover:text-light-beige"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetOverlay className="bg-black/60 backdrop-blur-sm" />
            <SheetContent
              side="right"
              className="bg-pale-mint text-dark-text font-sans w-[280px] sm:w-[320px] p-0"
              hideCloseButton
            >
              <SheetHeader className="border-b border-dark-text/10 p-4 flex flex-row justify-between">
                <SheetTitle className="flex items-center space-x-2 text-dark-text">
                  <Sparkles className="h-5 w-5 text-brand-green" />
                  <span className="font-serif text-lg font-bold">YourLogo</span>
                </SheetTitle>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-dark-text hover:bg-dark-text/10 rounded-full"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </SheetHeader>
              <div className="flex flex-col items-center space-y-2 p-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <a
                      href={item.href}
                      className="block rounded-md px-3 py-2.5 text-base font-medium hover:bg-pale-mint hover:text-brand-green focus:bg-pale-mint"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      {item.label}
                    </a>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button
                    asChild
                    className="w-full mt-4 bg-brand-green text-pale-mint hover:bg-brand-green/90 py-3"
                  >
                    <a href="#login">Login</a>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    );
}

export default Navbar;