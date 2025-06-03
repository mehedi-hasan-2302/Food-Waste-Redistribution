import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VerifyEmailFormProps {
  email: string;
  verificationCode: string;
  setVerificationCode: (value: string) => void; 
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const VerifyEmail: React.FC<VerifyEmailFormProps> = ({
  email,
  verificationCode,
  setVerificationCode,
  onSubmit,
}) => {
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
      <form onSubmit={onSubmit} className="space-y-4 font-[Inter]">
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
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-brand-green hover:bg-brand-green/90 text-white cursor-pointer"
        >
          Verify Code
        </Button>
      </form>
    </div>
  );
};

export default VerifyEmail;
