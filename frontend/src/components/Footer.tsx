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
      <div className="container mx-auto max-w-screen-xl px-6 pt-20 pb-12 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-4 md:grid-cols-3">
          {/* Column 1: Logo and Motto */}
          <div className="lg:col-span-2 md:col-span-1">
            <a href="/" className="inline-flex items-center space-x-3">
              <img
                src="/assets/FWR_Logo.png"
                alt="FWR Logo"
                className="h-20 w-20 rounded-full object-cover"
              />
            </a>
            <p className="mt-6 text-base leading-relaxed text-pale-mint/90 max-w-md">
              Transforming surplus food into opportunity. We bridge communities 
              to reduce waste, combat hunger, and build a sustainable future together.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-serif font-semibold text-lg text-white mb-6">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {quickLinks.slice(0, 2).map((link) => (
                <li key={link.label}>
                  <a
                    href={link.path}
                    className="text-pale-mint/90 transition-colors duration-300 hover:text-white hover:underline underline-offset-4"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="font-serif font-semibold text-lg text-white mb-6">
              Company
            </h3>
            <ul className="space-y-4">
              {quickLinks.slice(2, 4).map((link) => (
                <li key={link.label}>
                  <a
                    href={link.path}
                    className="text-pale-mint/90 transition-colors duration-300 hover:text-white hover:underline underline-offset-4"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="mt-16 pt-8 border-t border-pale-mint/20">
          <div className="flex flex-col items-center space-y-6 md:flex-row md:justify-between md:space-y-0">
            <div>
              <h4 className="font-serif font-medium text-white mb-4 text-center md:text-left">
                Connect With Us
              </h4>
              <div className="flex space-x-3 justify-center md:justify-start">
                {socialLinks.map((social) => (
                  <Button
                    key={social.name}
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-pale-mint/80 hover:bg-white/15 hover:text-white transition-all duration-300 rounded-full border border-pale-mint/30 hover:border-white/50"
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
            
            <div className="text-center md:text-right">
              <p className="text-sm text-pale-mint/70 leading-relaxed">
                &copy; {new Date().getFullYear()} Food Waste Redistribution. All rights reserved.
              </p>
              <p className="text-xs text-pale-mint/60 mt-1">
                Building sustainable communities through food redistribution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
