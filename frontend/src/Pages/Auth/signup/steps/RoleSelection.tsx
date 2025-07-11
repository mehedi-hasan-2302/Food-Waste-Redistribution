import { useState, type FormEvent } from "react"; 
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiUsers } from "react-icons/fi";
import { Loader2 } from "lucide-react";

interface FieldError {
  _errors: string[];
}

interface RoleSelectionErrors {
  role?: FieldError;
  _errors?: string[];
}

interface RoleSelectionProps {
  currentRole: string;
  errors: RoleSelectionErrors;
  handleSelectChange: (value: string) => void;
  onNext: () => void;
  isLoading?: boolean;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({
  currentRole,
  errors,
  handleSelectChange,
  onNext,
  isLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState<boolean>(false);

  const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setInternalLoading(true);
    
    onNext();
    
    setTimeout(() => {
      setInternalLoading(false);
    }, 2000);
  };

  const isCurrentlyLoading = isLoading || internalLoading;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark-text mb-4 flex items-center gap-2">
        <FiUsers className="text-brand-green" /> Select Your Role
      </h2>
      <p className="text-sm font-[Inter] text-dark-text/70 mb-6">
        Choose the role that best describes you on our platform.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 font-[Inter]">
        {" "}
        {/* Wrap in form for onSubmit */}
        <div>
          <Label htmlFor="role">Select Role</Label>
          <Select onValueChange={handleSelectChange} value={currentRole} disabled={isCurrentlyLoading}>
            <SelectTrigger
              id="role"
              className={`mt-1 ${
                errors.role?._errors?.length ? "border-red-500" : ""
              }`}
              aria-invalid={!!errors.role?._errors?.length}
              aria-describedby="role-error"
            >
              <SelectValue placeholder="Choose your role" />
            </SelectTrigger>
            <SelectContent className="z-50 font-[Inter] bg-white border border-gray-200 shadow-md rounded-md">
              <SelectItem
                value="donor"
                className="hover:bg-brand-green hover:text-white cursor-pointer transition-colors"
              >
                Donor / Seller
              </SelectItem>
              <SelectItem
                value="beneficiary"
                className="hover:bg-brand-green hover:text-white cursor-pointer transition-colors"
              >
                Beneficiary Organization
              </SelectItem>
              <SelectItem
                value="volunteer"
                className="hover:bg-brand-green hover:text-white cursor-pointer transition-colors"
              >
                Volunteer
              </SelectItem>
              <SelectItem value="org_volunteer"
                className="hover:bg-brand-green hover:text-white cursor-pointer transition-colors">
                Organization Volunteer
              </SelectItem>
              <SelectItem
                value="buyer"
                className="hover:bg-brand-green hover:text-white cursor-pointer transition-colors"
              >
                Buyer
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.role?._errors?.length && (
            <p id="role-error" className="text-xs text-red-500 mt-1">
              {errors.role._errors.join(", ")}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-brand-green hover:bg-brand-green/90 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isCurrentlyLoading}
        >
          {isCurrentlyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCurrentlyLoading ? "Processing..." : "Proceed to Email Verification"}
        </Button>
      </form>
    </div>
  );
};

export default RoleSelection;