import { Button } from "@/components/ui/button";
import { Recycle } from "lucide-react";

const About: React.FC = () => {

  return (
    <div className="bg-light-beige text-dark-text font-sans">
      {/* Hero Section */}
      <section className="relative bg-brand-green text-white text-center py-20 md:py-32">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 relative">
          <h1 className="text-4xl md:text-6xl font-serif font-bold">
            Our Story
          </h1>
          <p className="mt-4 text-lg md:text-xl text-pale-mint max-w-3xl mx-auto">
            Fighting food waste and hunger by connecting communities..
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-green">
                A Dual Challenge, A Singular Mission
              </h2>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Food waste is a staggering global issue. Every day, restaurants,
                grocery stores, and event organizers dispose of perfectly good
                surplus food. At the same time, countless individuals and
                charities face the daily struggle of food insecurity.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Our mission is to bridge this gap. We created this platform to
                build a sustainable and compassionate solution that transforms
                surplus into sustenance, ensuring that good food nourishes
                people, not landfills.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop"
                alt="Volunteers sorting food donations"
                className="rounded-lg shadow-xl object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/600x400/D9E3DF/1A3F36?text=Community";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Recycle className="h-12 w-12 text-highlight mx-auto" />
          <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-brand-green">
            Join Our Movement
          </h2>
          <p className="mt-4 text-lg text-gray-700 max-w-xl mx-auto">
            Whether you're a donor with surplus food, a charity in need, or a
            volunteer with time to give, you can make a real impact.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-highlight hover:bg-brand-green text-white shadow-lg"
            >
              <a href="/signup">Become a Donor</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-highlight text-highlight hover:bg-highlight/10"
            >
              <a href="/signup">Volunteer</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
