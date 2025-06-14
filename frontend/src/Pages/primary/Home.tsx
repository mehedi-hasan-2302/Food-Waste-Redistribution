import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShoppingCart,
  Heart,
  Recycle,
  Users,
  Handshake,
  Globe,
  Package,
  Zap,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import {FeatureCard, StatItem} from "@/components/HomeComponents";

const Home: React.FC = () => {
  return (
    <div className="bg-light-beige font-sans">
      {/* 1. Hero Section */}
      <section className="relative text-white min-h-[80vh] md:min-h-[70vh] lg:min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-brand-green">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
            alt="Delicious meal"
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
            Good Food, Great Deals, Greater Good.
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-pale-mint/90">
            Find delicious surplus meals at amazing prices, or join our
            volunteer team to help deliver food and fight hunger in your
            community.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-highlight hover:bg-white hover:text-highlight text-white text-base shadow-lg px-8 py-6"
            >
              <Link to="/foods">
                <ShoppingCart className="mr-2 h-5 w-5" /> Find a Meal
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-dark-text text-base px-8 py-6"
            >
              <Link to="/signup">
                <Heart className="mr-2 h-5 w-5" /> Volunteer to Deliver
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green">
            How We Make a Difference
          </h2>
          <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
            Our platform simplifies the process of food redistribution into
            three easy steps, making it accessible for everyone.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <FeatureCard
              icon={<Package className="h-8 w-8 text-highlight" />}
              title="1. Donors List Surplus"
              description="Restaurants, stores, and individuals list available surplus food, preventing it from going to waste."
            />

            <FeatureCard
              icon={<ShoppingCart className="h-8 w-8 text-highlight" />}
              title="2. You Claim or Buy"
              description="Charities and individuals claim free donations, while everyone can buy delicious surplus food at a discount."
            />
            <FeatureCard
              icon={<Truck className="h-8 w-8 text-highlight" />}
              title="3. We All Connect"
              description="Our network of volunteers helps deliver food to those who need it most, connecting our community."
            />
          </div>
        </div>
      </section>

      {/* 3. For Donors & Sellers Section */}
      <section className="py-16 md:py-24 bg-pale-mint">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green">
                Turn Your Surplus into an Opportunity.
              </h2>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Are you a restaurant, grocery store, or event organizer with
                leftover food? Don't let it go to waste. Listing on our platform
                is simple, free, and impactful.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <Handshake className="h-6 w-6 text-highlight mr-3 flex-shrink-0 mt-1" />
                  <span>
                    <strong className="font-semibold text-dark-text">
                      Reduce Waste & Costs:
                    </strong>{" "}
                    Lower your disposal fees and contribute to a greener planet.
                  </span>
                </li>
                <li className="flex items-start">
                  <Users className="h-6 w-6 text-highlight mr-3 flex-shrink-0 mt-1" />
                  <span>
                    <strong className="font-semibold text-dark-text">
                      Enhance Your Brand:
                    </strong>{" "}
                    Showcase your commitment to the community and
                    sustainability.
                  </span>
                </li>
                <li className="flex items-start">
                  <Recycle className="h-6 w-6 text-highlight mr-3 flex-shrink-0 mt-1" />
                  <span>
                    <strong className="font-semibold text-dark-text">
                      Reach New Customers:
                    </strong>{" "}
                    Sell surplus food at a discount and attract new patrons.
                  </span>
                </li>
              </ul>
              <Button
                asChild
                size="lg"
                className="mt-8 bg-brand-green hover:bg-highlight text-white shadow-lg"
              >
                <Link to="/manage">
                  List Your Surplus Food <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1512485800893-b08ec1ea59b1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Restaurant owner using a tablet"
                className="rounded-lg shadow-xl object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/600x400/1A3F36/E7E0D0?text=For+Donors";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Facts and Stats Section */}
      <section className="relative bg-dark-text text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-brand-green">
          <img
            src="https://images.unsplash.com/photo-1488900128323-21503983a07e?q=80&w=1974&auto=format&fit=crop"
            alt="Vegetables"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">
            The Staggering Reality of Food Waste
          </h2>
          <p className="mt-4 text-pale-mint/80 max-w-3xl mx-auto">
            Every action, big or small, contributes to a global solution. Here's
            why your help matters.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
            <StatItem
              value="1/3"
              label="Of all food produced globally is wasted each year."
            />
            <StatItem
              value="10%"
              label="Of global greenhouse gas emissions come from food waste."
            />
            <StatItem
              value="820M"
              label="People worldwide still face hunger every day."
            />
          </div>
        </div>
      </section>

      {/* 5. Core Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green">
            A Platform Built for Impact
          </h2>
          <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
            We've packed our platform with features designed to make food
            redistribution simple, efficient, and transparent.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-highlight" />}
              title="Real-Time Alerts"
              description="Instant notifications for new listings and claims."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-highlight" />}
              title="Admin Oversight"
              description="A powerful dashboard to manage users, verify new members, and ensure platform integrity."
            />
            <FeatureCard
              icon={<Package className="h-8 w-8 text-highlight" />}
              title="Expiry Tracking"
              description="Smart tracking to ensure food safety and freshness."
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8 text-highlight" />}
              title="Impact Reporting"
              description="See the tangible difference your contributions make."
            />
          </div>
        </div>
      </section>

      {/* 6. Join Section */}
      <section className="bg-pale-mint">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Recycle className="h-12 w-12 text-highlight mx-auto" />
            <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-brand-green">
              Join the Movement Today
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Be part of a community that's turning surplus into sustenance.
              Whether you're a business, a charity, or an individual, your
              participation helps build a better, less wasteful world.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-highlight hover:bg-brand-green text-white shadow-lg px-10 py-6 text-base"
            >
              <Link to="/signup">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
