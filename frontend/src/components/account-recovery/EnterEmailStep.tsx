import type { EnterEmailStepProps } from "@/lib/types/account-recovery";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FiMail } from "react-icons/fi";
import { Loader2 } from "lucide-react";

export const EnterEmailStep: React.FC<EnterEmailStepProps> = ({
  email,
  setEmail,
  errors,
  setErrors,
  setPasswordResetError,
  onSubmit,
  isLoading,
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold text-dark-text mb-2">
        Forgot Password?
      </h2>
      <p className="text-sm text-dark-text/70 mb-6">
        Enter your email. We'll send a code to reset your password.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="reset-email" className="sr-only">
            Email Address
          </Label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email || errors.form)
                  setErrors((prev) => ({
                    ...prev,
                    email: undefined,
                    form: undefined,
                  }));
                setPasswordResetError(null);
              }}
              className={`pl-10 w-full ${
                errors.email || errors.form
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:border-brand-green focus:ring-brand-green`}
              required
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Verification Code
        </Button>
      </form>
    </>
  );
};
