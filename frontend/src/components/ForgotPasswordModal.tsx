import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import{ Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FiX, FiMail, FiKey } from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { BiHide, BiShowAlt } from "react-icons/bi";

const resetPasswordFormSchema = z
  .object({
    code: z.string().length(6, "Code must be exactly 6 characters"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain an uppercase letter",
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain a lowercase letter",
      })
      .refine((val) => /\d/.test(val), {
        message: "Password must contain a number",
      })
      .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
        message: "Password must contain a special character",
      }),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ModalStep = "enterEmail" | "enterCodeAndNewPassword";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [modalStep, setModalStep] = useState<ModalStep>("enterEmail");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    form?: string;
  }>({});

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false); // For password visibility

  //Zustand store variables
  const isLoading = useAuthStore((state) => state.isLoading);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const setPasswordResetError = useAuthStore(
    (state) => state.setPasswordResetError
  );

  useEffect(() => {
    if (isOpen) {
      setModalStep("enterEmail");
      setEmail("");
      setCode("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowNewPassword(false);
      setErrors({});
      setPasswordResetError(null);
    }
  }, [isOpen, setPasswordResetError]);

  if (!isOpen) return null;

  const handleSendCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setPasswordResetError(null);

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      // ... (error handling for email schema)
      const fieldErrors: { email?: string } = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as "email"] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/request-password-reset",
        { Email: result.data.email }
      );
      if (response.data.status === "success") {
        toast.success(response.data.message || "Password reset code sent!");
        setModalStep("enterCodeAndNewPassword"); // Go to combined step
      } else {
        // ... (error handling)
        const message = response.data.message || "Failed to send reset code.";
        toast.error(message);
        setErrors({ form: message });
        setPasswordResetError(message);
      }
    } catch (error) {
      // ... (error handling)
      const message =
        axios.isAxiosError(error) && error.response
          ? error.response.data.message || "Server error."
          : "An unexpected error occurred.";
      toast.error(message);
      setErrors({ form: message });
      setPasswordResetError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setPasswordResetError(null);

    const validationResult = resetPasswordFormSchema.safeParse({
      code,
      newPassword,
      confirmNewPassword,
    });

    if (!validationResult.success) {
      const fieldErrors: any = {};
      validationResult.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("http://localhost:4000/api/auth/reset-password", {
        Email: email, // Email from the first step
        Code: validationResult.data.code,
        Password: validationResult.data.newPassword,
        ConfirmPassword: validationResult.data.confirmNewPassword,
      });
      toast.success("Password has been reset successfully! Please log in.");
      onClose();
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response
          ? error.response.data.message || "Failed to reset password."
          : "An unexpected error occurred.";
      toast.error(message);
      // Check if the error message from API indicates invalid code, and set error for 'code' field
      // This depends on your API's error response structure
      if (
        message.toLowerCase().includes("code") ||
        message.toLowerCase().includes("invalid token")
      ) {
        setErrors({ code: message, form: undefined }); // Prioritize code error
      } else {
        setErrors({ form: message });
      }
      setPasswordResetError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose} 
    >
      <div
        className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md relative"
        onClick={handleModalContentClick}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <FiX size={24} />
        </button>

        {/* Step 1: Enter Email */}
        {modalStep === "enterEmail" && (
          <>
            <h2 className="text-xl font-semibold text-dark-text mb-2">
              Forgot Password?
            </h2>
            <p className="text-sm text-dark-text/70 mb-6">
              Enter your email. We'll send a code to reset your password.
            </p>
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <Label htmlFor="reset-email" className="sr-only">
                  {" "}
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
                      // Ensure w-full
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
        )}

        {/* Step 2: Enter Code and New Password */}
        {modalStep === "enterCodeAndNewPassword" && (
          <>
            <h2 className="text-xl font-semibold text-dark-text mb-2">
              Reset Your Password
            </h2>
            <p className="text-sm text-dark-text/70 mb-6">
              A code was sent to{" "}
              <span className="font-medium text-brand-green">{email}</span>.
              Enter the code and your new password below.
            </p>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              {/* Code Field */}
              <div>
                <Label
                  htmlFor="verification-code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {" "}
                  {/* Made label visible */}
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
                  {" "}
                  New Password
                </Label>
                <div className="relative mt-1">
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
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <BiShowAlt size={20} />
                    ) : (
                      <BiHide size={20} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div>
                <Label
                  htmlFor="confirm-new-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {" "}
                  Confirm New Password
                </Label>
                <div className="relative mt-1">
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
                      errors.confirmNewPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:border-brand-green focus:ring-brand-green`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)} // Reuses the same state/handler
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    aria-label={
                      showNewPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <BiShowAlt size={20} />
                    ) : (
                      <BiHide size={20} />
                    )}
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
                className="w-full bg-brand-green hover:bg-brand-green/90 text-white" // Added text-white
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
              <Button
                variant="link"
                type="button"
                onClick={() => {
                  if (isLoading) return;
                  setModalStep("enterEmail");
                  setCode("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setErrors({});
                  setPasswordResetError(null);
                }}
                className="w-full text-brand-green text-xs hover:underline disabled:opacity-50" // Already has cursor-pointer via link variant
                disabled={isLoading}
              >
                Entered wrong email or need a new code? Start Over.
              </Button>
            </form>
          </>
        )}

        {/* General form error display */}
        {errors.form &&
          !isLoading && (
            <p className="text-red-500 text-sm mt-4 text-center">
              {errors.form}
            </p>
          )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;