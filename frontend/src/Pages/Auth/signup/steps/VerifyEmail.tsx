import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface VerifyEmailFormProps {
  email: string;
  verificationCode: string;
  setVerificationCode: (value: string) => void; 
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
}

const VerifyEmail: React.FC<VerifyEmailFormProps> = ({
  email,
  verificationCode,
  setVerificationCode,
  onSubmit,
  isLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInternalLoading(true);
    
    
    onSubmit(e);
    
    setTimeout(() => {
      setInternalLoading(false);
    }, 2000);
  };

  const isCurrentlyLoading = isLoading || internalLoading;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark-text mb-4">
        Verify Email
      </h2>
      <p className="text-sm font-[Inter] text-dark-text/70 mb-6">
        A verification code has been sent to{" "}
        <span className="font-semibold">{email}</span>. Please enter the code
        below. (Hint: try 123456)
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 font-[Inter]">
        <div>
          <Label htmlFor="verificationCode">Verification Code</Label>
          <Input
            id="verificationCode"
            type="text"
            placeholder="Enter 6-digit code"
            className="mt-1"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            required
            disabled={isCurrentlyLoading}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-brand-green hover:bg-brand-green/90 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isCurrentlyLoading}
        >
          {isCurrentlyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCurrentlyLoading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>
    </div>
  );
};

export default VerifyEmail;