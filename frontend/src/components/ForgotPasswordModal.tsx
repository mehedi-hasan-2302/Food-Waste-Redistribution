import { useState, type FormEvent } from "react";
import { z } from "zod";
import{ Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FiX, FiMail, FiKey } from "react-icons/fi";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const codeSchema = z.object({
    code: z.string().length(6, "Code must be exactly 6 characters"),
})

type ModalStep = "enterEmail" | "enterCode";

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
      form?: string;
    }>({});
    const [isCodeSent, setIsCodeSent] = useState(false);

    if(!isOpen) return null;

    const handleSendCode = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        
        const result = emailSchema.safeParse({ email });
        if (!result.success) {
          const fieldErrors: { email?: string } = {};
          result.error.issues.forEach((issue) => {
            fieldErrors[issue.path[0] as "email"] = issue.message;
          });
          setErrors(fieldErrors);
          return;
        }

        // Simulate API call to send verification code
        console.log("Sending verification code to:", result.data.email);
        // Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsCodeSent(true);
        setModalStep("enterCode");
    }

    const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors({});
      const result = codeSchema.safeParse({ code });
      if (!result.success) {
        const fieldErrors: { code?: string } = {};
        result.error.issues.forEach((issue) => {
          fieldErrors[issue.path[0] as "code"] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      // Simulate API call to verify code and reset password
      console.log("Verifying code:", result.data.code, "for email:", email);
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (result.data.code === "123456") {
        // Simulate correct code
        alert(
          "Password reset instructions sent! (Or new password set - depending on flow)"
        );
        onClose();
        // Reset modal state for next time
        setEmail("");
        setCode("");
        setModalStep("enterEmail");
        setIsCodeSent(false);
      } else {
        setErrors({ code: "Invalid verification code." });
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
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <FiX size={24} />
          </button>

          {modalStep === "enterEmail" && (
            <>
              <h2 className="text-xl font-semibold text-dark-text mb-2">
                Forgot Password?
              </h2>
              <p className="text-sm text-dark-text/70 mb-6">
                No worries! Enter your email address below and we'll send you a
                code to reset your password.
              </p>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email" className="sr-only">
                    Email Address
                  </Label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={`pl-10 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                >
                  Send Verification Code
                </Button>
              </form>
            </>
          )}

          {modalStep === "enterCode" && isCodeSent && (
            <>
              <h2 className="text-xl font-semibold text-dark-text mb-2">
                Enter Verification Code
              </h2>
              <p className="text-sm text-dark-text/70 mb-6">
                A 6-digit verification code has been sent to{" "}
                <span className="font-medium text-brand-green">{email}</span>.
                Please enter it below.
              </p>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <Label htmlFor="verification-code" className="sr-only">
                    Verification Code
                  </Label>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="verification-code"
                      type="text" // Use "text" to allow easier input, maxLength will handle length
                      placeholder="_ _ _ _ _ _"
                      value={code}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, ""); // Allow only digits
                        if (val.length <= 6) setCode(val);
                        if (errors.code)
                          setErrors((prev) => ({ ...prev, code: undefined }));
                      }}
                      maxLength={6}
                      className={`pl-10 tracking-[0.3em] text-center ${
                        errors.code ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                  {errors.code && (
                    <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                >
                  Verify Code & Reset
                </Button>
                <Button
                  variant="link"
                  type="button"
                  onClick={() => {
                    setModalStep("enterEmail");
                    setIsCodeSent(false);
                    setErrors({});
                  }}
                  className="w-full text-brand-green text-xs"
                >
                  Didn't receive code? Send again or change email.
                </Button>
              </form>
            </>
          )}
          {errors.form && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {errors.form}
            </p>
          )}
        </div>
      </div>
    );
}

export default ForgotPasswordModal;