import type { EnterCodeAndPasswordStepProps } from "@/lib/types/account-recovery";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FiKey } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { BiHide, BiShowAlt } from "react-icons/bi";

export const EnterCodeAndPasswordStep: React.FC<
  EnterCodeAndPasswordStepProps
> = ({
  emailToDisplay,
  code,
  setCode,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  showNewPassword,
  setShowNewPassword,
  errors,
  setErrors,
  setPasswordResetError,
  onSubmit,
  onGoBackToEnterEmail,
  isLoading,
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold text-dark-text mb-2">
        Reset Your Password
      </h2>
      <p className="text-sm text-dark-text/70 mb-6">
        A code was sent to{" "}
        <span className="font-medium text-brand-green">{emailToDisplay}</span>.
        Enter the code and your new password below.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Code Field */}
        <div>
          <Label
            htmlFor="verification-code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Verification Code
          </Label>
          <div className="relative">
            <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              id="verification-code"
              type="text"
              placeholder="_ _ _ _ _ _"
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 6) setCode(val);
                if (errors.code || errors.form)
                  setErrors((prev) => ({
                    ...prev,
                    code: undefined,
                    form: undefined,
                  }));
                setPasswordResetError(null);
              }}
              maxLength={6}
              className={`pl-10 tracking-[0.3em] text-center w-full ${
                errors.code ? "border-red-500" : "border-gray-300"
              } focus:border-brand-green focus:ring-brand-green`}
              required
              disabled={isLoading}
            />
          </div>
          {errors.code && (
            <p className="text-red-500 text-xs mt-1">{errors.code}</p>
          )}
        </div>

        {/* New Password Field */}
        <div>
          <Label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </Label>
          <div className="relative mt-1">
            {" "}
            <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword || errors.form)
                  setErrors((prev) => ({
                    ...prev,
                    newPassword: undefined,
                    form: undefined,
                  }));
                setPasswordResetError(null);
              }}
              className={`pl-10 w-full ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              } focus:border-brand-green focus:ring-brand-green`}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              disabled={isLoading}
            >
              {showNewPassword ? <BiShowAlt size={20} /> : <BiHide size={20} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div>
          <Label
            htmlFor="confirm-new-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm New Password
          </Label>
          <div className="relative mt-1">
            {" "}
            {/* Corrected */}
            <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              id="confirm-new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmNewPassword}
              onChange={(e) => {
                setConfirmNewPassword(e.target.value);
                if (errors.confirmNewPassword || errors.form)
                  setErrors((prev) => ({
                    ...prev,
                    confirmNewPassword: undefined,
                    form: undefined,
                  }));
                setPasswordResetError(null);
              }}
              className={`pl-10 w-full ${
                errors.confirmNewPassword ? "border-red-500" : "border-gray-300"
              } focus:border-brand-green focus:ring-brand-green`}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              aria-label={
                showNewPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              disabled={isLoading}
            >
              {showNewPassword ? <BiShowAlt size={20} /> : <BiHide size={20} />}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmNewPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>
        <Button
          variant="link"
          type="button"
          onClick={onGoBackToEnterEmail}
          className="w-full text-brand-green text-xs hover:underline disabled:opacity-50"
          disabled={isLoading}
        >
          Entered wrong email or need a new code? Start Over.
        </Button>
      </form>
    </>
  );
};
