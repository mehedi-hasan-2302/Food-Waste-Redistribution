import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer: React.FC = () => {
  const socialLinks = [
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, href: "#" },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, href: "#" },
    { name: "X", icon: <XIcon className="h-5 w-5" />, href: "#" },
    { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "#" },
  ];

  const quickLinks = [
    { label: "Services", path: "/services" },
    { label: "Foods", path: "/foods" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  return (
    <footer className="bg-brand-green text-pale-mint font-sans">
      <div className="container mx-auto max-w-screen-lg px-4 pt-16 pb-8 sm:px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Column 1: Logo and Motto */}
          <div className="md:col-span-1">
            <a href="/" className="inline-flex items-center space-x-2">
              <img
                src="/assets/FWR_Logo.png"
                alt="FWR Logo"
                className="h-16 w-auto"
              />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-pale-mint/80">
              Giving surplus food a second chance. We connect communities to
              reduce waste and fight hunger.
            </p>
          </div>

          {/* Column 2 & 3: Links */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="font-serif font-semibold text-white">Quick Links</p>
              <ul className="mt-4 space-y-2">
                {quickLinks.slice(0, 2).map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.path}
                      className="text-sm text-pale-mint/80 transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-serif font-semibold text-white">Company</p>
              <ul className="mt-4 space-y-2">
                {quickLinks.slice(2, 4).map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.path}
                      className="text-sm text-pale-mint/80 transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-serif font-semibold text-white">Follow Us</p>
              <div className="mt-4 flex space-x-2">
                {socialLinks.map((social) => (
                  <Button
                    key={social.name}
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-pale-mint/80 hover:bg-white/10 hover:text-white"
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sr-only">{social.name}</span>
                      {social.icon}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-pale-mint/20 pt-8 text-center sm:text-left">
          <div className="flex flex-col items-center justify-between sm:justify-center sm:flex-row">
            <p className="text-xs text-pale-mint/60">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
