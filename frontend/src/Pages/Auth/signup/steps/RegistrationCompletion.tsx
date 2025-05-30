import { Button } from "@/components/ui/button";
import { FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

interface RegistrationCompleteViewProps {
  firstName: string;
}

const RegistrationCompletion: React.FC<RegistrationCompleteViewProps> = ({
  firstName,
}) => {
  return (
    <div className="text-center font-[Inter]">
      <FiCheckCircle className="w-20 h-20 text-brand-green mx-auto mb-6" />
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark-text mb-4">
        Registration Complete!
      </h2>
      <p className="text-md text-dark-text/80 mb-6">
        Thank you, {firstName}! Your account has been successfully created.
      </p>
      <p className="text-sm text-dark-text/70">
        You can now proceed to log in or explore the platform.
      </p>
      <Button
        className="w-full md:w-auto mt-8 bg-brand-green hover:bg-brand-green/90 text-white px-8 cursor-pointer"
      >
        <Link to="/login">Go to Login</Link>
      </Button>
    </div>
  );
};

export default RegistrationCompletion;
