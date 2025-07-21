import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { FiX } from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { toast } from "react-toastify";
import type { ForgotPasswordModalErrors } from "@/lib/types/account-recovery";
import { EnterCodeAndPasswordStep } from "./account-recovery/EnterCodeAndPasswordStep";
import { EnterEmailStep } from "./account-recovery/EnterEmailStep";
import { API_CONFIG } from "@/config/api";

// Zod Schemas 
const resetPasswordFormSchema = z.object({
  code: z.string().min(6).max(6).regex(/^\d{6}$/, "Invalid code"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmNewPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
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

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [modalStep, setModalStep] = useState<ModalStep>("enterEmail");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errors, setErrors] = useState<ForgotPasswordModalErrors>({}); 

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
        `${API_CONFIG.baseURL}/api/auth/request-password-reset`,
        { Email: result.data.email }
      );
      if (response.data.status === "success") {
        toast.success(response.data.message || "Password reset code sent!");
        setModalStep("enterCodeAndNewPassword");
      } else {
        const message = response.data.message || "Failed to send reset code.";
        toast.error(message);
        setErrors({ form: message });
        setPasswordResetError(message);
      }
    } catch (error) {
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
      await axios.post(`${API_CONFIG.baseURL}/api/auth/reset-password`, {
        Email: email,
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
      if (
        message.toLowerCase().includes("code") ||
        message.toLowerCase().includes("invalid token")
      ) {
        setErrors({ code: message, form: undefined });
      } else {
        setErrors({ form: message });
      }
      setPasswordResetError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToEnterEmailHandler = () => {
    if (isLoading) return;
    setModalStep("enterEmail");
    setCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrors({});
    setPasswordResetError(null);
  };

  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

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

        {modalStep === "enterEmail" && (
          <EnterEmailStep
            email={email}
            setEmail={setEmail}
            errors={errors}
            setErrors={setErrors}
            setPasswordResetError={setPasswordResetError}
            onSubmit={handleSendCode}
            isLoading={isLoading}
          />
        )}

        {modalStep === "enterCodeAndNewPassword" && (
          <EnterCodeAndPasswordStep
            emailToDisplay={email}
            code={code}
            setCode={setCode}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmNewPassword={confirmNewPassword}
            setConfirmNewPassword={setConfirmNewPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            errors={errors}
            setErrors={setErrors}
            setPasswordResetError={setPasswordResetError}
            onSubmit={handleResetPasswordSubmit}
            onGoBackToEnterEmail={goBackToEnterEmailHandler}
            isLoading={isLoading}
          />
        )}

        {errors.form && !isLoading && (
          <p className="text-red-500 text-sm mt-4 text-center">{errors.form}</p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
