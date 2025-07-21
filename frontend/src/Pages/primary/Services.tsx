
import { Button } from "@/components/ui/button";
import {
  Package,
  Users,
  Truck,
  Heart,
  ShoppingCart,
  Shield,
  Clock,
  CheckCircle,
  Utensils,
  HandHeart,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Star,
  Globe,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  isPrimary?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  features,
  buttonText,
  buttonLink,
  isPrimary = false,
}) => (
  <div className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isPrimary ? 'ring-2 ring-highlight' : ''}`}>
    <div className="flex items-center justify-center w-16 h-16 bg-highlight/10 rounded-full mb-6 mx-auto">
      {icon}
    </div>
    <h3 className="text-2xl font-serif font-bold text-brand-green text-center mb-4">
      {title}
    </h3>
    <p className="text-gray-600 text-center mb-6 leading-relaxed">
      {description}
    </p>
    <ul className="space-y-3 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle className="h-5 w-5 text-highlight mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 text-sm">{feature}</span>
        </li>
      ))}
    </ul>
    <Button
      asChild
      className={`w-full ${isPrimary ? 'bg-highlight hover:bg-brand-green' : 'bg-brand-green hover:bg-highlight'} text-white shadow-lg`}
    >
      <Link to={buttonLink}>
        {buttonText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  </div>
);

interface ProcessStepProps {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ step, title, description, icon }) => (
  <div className="text-center">
    <div className="relative mb-6">
      <div className="flex items-center justify-center w-20 h-20 bg-highlight rounded-full mx-auto mb-4">
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">{step}</span>
      </div>
    </div>
    <h3 className="text-xl font-serif font-bold text-brand-green mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const Services: React.FC = () => {
  const services = [
    {
      icon: <Package className="h-8 w-8 text-highlight" />,
      title: "Food Donation Platform",
      description: "Connect surplus food with those who need it most through our comprehensive donation platform.",
      features: [
        "Real-time food listing and management",
        "Automated quality and safety checks",
        "Donation tracking and analytics",
        "Tax receipt generation",
        "Bulk donation scheduling",
        "Expiry date monitoring"
      ],
      buttonText: "Start Donating",
      buttonLink: "/signup",
      isPrimary: true,
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-highlight" />,
      title: "Affordable Food Access",
      description: "Purchase quality surplus food at discounted prices while supporting sustainability.",
      features: [
        "Up to 50% off regular food prices",
        "Fresh, quality-assured products",
        "Easy online ordering system",
        "Flexible pickup scheduling",
        "Variety of food categories"
      ],
      buttonText: "Browse Foods",
      buttonLink: "/foods",
    },
    {
      icon: <Truck className="h-8 w-8 text-highlight" />,
      title: "Volunteer Delivery Network",
      description: "Join our community of volunteers making a difference through food delivery services.",
      features: [
        "Flexible scheduling options",
        "Local delivery assignments",
        "Route optimization tools",
        "Volunteer recognition program",
        "Training and support provided",
        "Community impact tracking"
      ],
      buttonText: "Join Volunteers",
      buttonLink: "/signup",
    },
    {
      icon: <Heart className="h-8 w-8 text-highlight" />,
      title: "Charity Partnership",
      description: "Partner with us to ensure consistent food access for your beneficiaries.",
      features: [
        "Priority access to donations",
        "Customized delivery schedules",
        "Dedicated support representative",
        "Impact reporting and analytics",
        "Free partnership program",
        "Community outreach assistance"
      ],
      buttonText: "Partner With Us",
      buttonLink: "/contact",
    },
  ];

  const processSteps = [
    {
      step: "1",
      title: "Register & Verify",
      description: "Sign up for free and verify your account to access our platform services.",
      icon: <Users className="h-10 w-10 text-white" />,
    },
    {
      step: "2",
      title: "List or Browse",
      description: "Donors list surplus food while buyers browse available items in their area.",
      icon: <Utensils className="h-10 w-10 text-white" />,
    },
    {
      step: "3",
      title: "Connect & Coordinate",
      description: "Our platform connects parties and coordinates pickup or delivery logistics.",
      icon: <MapPin className="h-10 w-10 text-white" />,
    },
    {
      step: "4",
      title: "Deliver & Impact",
      description: "Food reaches those who need it, creating positive community and environmental impact.",
      icon: <HandHeart className="h-10 w-10 text-white" />,
    },
  ];

  return (
    <div className="bg-light-beige text-dark-text font-sans">
      {/* Hero Section */}
      <section className="relative bg-brand-green text-white text-center py-20 md:py-32">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Our Services
          </h1>
          <p className="text-lg md:text-xl text-pale-mint max-w-3xl mx-auto leading-relaxed">
            Comprehensive solutions for food waste reduction, affordable access, and community impact.
            Join thousands making a difference every day.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-highlight hover:bg-white hover:text-highlight text-white shadow-lg px-8 py-6"
            >
              <Link to="/signup">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-brand-green px-8 py-6"
            >
              <Link to="/contact">
                Contact Us
                <Phone className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green mb-4">
              What We Offer
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
              From food donation to volunteer delivery, we provide end-to-end solutions 
              that connect communities and reduce waste.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green mb-4">
              How Our Platform Works
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Our streamlined process makes food redistribution simple, efficient, and impactful.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <ProcessStep key={index} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-green/5 to-highlight/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green mb-4">
              Why Choose Our Platform
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Built with security, efficiency, and community impact at its core.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Shield className="h-12 w-12 text-highlight mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-brand-green mb-3">
                Safe & Secure
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                End-to-end encryption, verified users, and strict food safety protocols ensure secure transactions.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Clock className="h-12 w-12 text-highlight mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-brand-green mb-3">
                Real-Time Updates
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Live inventory tracking, instant notifications, and real-time coordination for maximum efficiency.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Smartphone className="h-12 w-12 text-highlight mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-brand-green mb-3">
                Mobile Optimized
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Access our platform anywhere with our responsive design and upcoming mobile application.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Globe className="h-12 w-12 text-highlight mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-brand-green mb-3">
                Community Focused
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Local connections, community partnerships, and neighborhood-based food redistribution networks.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Star className="h-12 w-12 text-highlight mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-brand-green mb-3">
                Quality Assured
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Rigorous quality checks, freshness guarantees, and satisfaction policies for peace of mind.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <CheckCircle className="h-12 w-12 text-highlight mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-brand-green mb-3">
                Impact Tracking
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Monitor your environmental and social impact with detailed analytics and reporting tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green mb-4">
              Get Support & Assistance
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Our dedicated support team is here to help you make the most of our platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-highlight/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-highlight" />
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-green mb-3">
                24/7 Support
              </h3>
              <p className="text-gray-600 mb-4">
                Round-the-clock assistance for urgent issues and general inquiries.
              </p>
              <Button variant="outline" size="sm" className="border-highlight text-highlight hover:bg-highlight/10">
                Call Support
              </Button>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-highlight/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-highlight" />
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-green mb-3">
                Email Support
              </h3>
              <p className="text-gray-600 mb-4">
                Detailed assistance and step-by-step guidance via email support.
              </p>
              <Button variant="outline" size="sm" className="border-highlight text-highlight hover:bg-highlight/10">
                Email Us
              </Button>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-highlight/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-highlight" />
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-green mb-3">
                Community Forum
              </h3>
              <p className="text-gray-600 mb-4">
                Connect with other users, share experiences, and get peer support.
              </p>
              <Button variant="outline" size="sm" className="border-highlight text-highlight hover:bg-highlight/10">
                Join Forum
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-brand-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-pale-mint mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who are already making a positive impact in their communities. 
            Start your journey towards reducing food waste and fighting hunger today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-highlight hover:bg-white hover:text-highlight text-white shadow-lg px-8 py-6"
            >
              <Link to="/signup">
                <Users className="mr-2 h-5 w-5" />
                Join Our Platform
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-brand-green px-8 py-6"
            >
              <Link to="/about">
                <Heart className="mr-2 h-5 w-5" />
                Learn Our Story
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;