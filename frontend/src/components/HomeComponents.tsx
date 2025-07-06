
export const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-4xl md:text-5xl font-bold font-serif text-white">
      {value}
    </p>
    <p className="mt-2 text-sm md:text-base text-pale-mint/80">{label}</p>
  </div>
);

export const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-2 text-center">
    <div className="inline-block bg-highlight/10 p-4 rounded-full">{icon}</div>
    <h3 className="mt-4 text-xl font-serif font-bold text-brand-green">
      {title}
    </h3>
    <p className="mt-2 text-gray-600 text-sm">{description}</p>
  </div>
);