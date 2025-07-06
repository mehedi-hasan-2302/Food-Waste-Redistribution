"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import RegistrationTracker from "@/components/RegistrationTracker";
import type { Step } from "@/components/RegistrationTracker";
import AccountInfo from "./steps/AccountInfo";
import VerifyEmail from "./steps/VerifyEmail";
import RoleSelection from "./steps/RoleSelection";
import RegistrationCompletion from "./steps/RegistrationCompletion";
import { z } from "zod/v4";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import axios from "axios";

// Define schemas for form validation using Zod
const AccountInfoSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .min(11, "Phone number must be at least 11 characters")
      .max(14, "Phone number must be at most 14 characters")
      .regex(/^\d+$/, "Phone number must contain only digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((val) => /\d/.test(val), {
        message: "Password must contain at least one number",
      })
      .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const RoleSchema = z.object({
    role: z.string().min(1, "Role is required"),
  });

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const UserSchema = AccountInfoSchema.extend({
    role: RoleSchema.shape.role,
  });

  type FormData = z.infer<typeof UserSchema>;
  type PageFormData = z.infer<typeof AccountInfoSchema> & { role: string };
  type FullFormErrors = Partial<z.ZodFormattedError<FormData, string>>;


const steps: Step[] = [
  { id: 1, name: "Account Info" },
  { id: 2, name: "Select Role" },
  { id: 3, name: "Verify Email" },
  { id: 4, name: "Completion" },
];


export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FullFormErrors>({});

  // Use Zustand store for isLoading and error handling
  const isLoading = useAuthStore((state) => state.isLoading);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const setSignupError = useAuthStore((state) => state.setSignupError);

  const setInitial = () => {
    setIsLoading(true);
    setFormErrors({});
    setSignupError(null);
  }

  useEffect(() => {
    return () => {
      setSignupError(null);
    };
  }, [setSignupError, currentStep]);

  type FormData = z.infer<typeof UserSchema>;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setSignupError(null);

    if (formErrors[id as keyof PageFormData]) {
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[id as keyof FormData];
        return newErrors;
      });
    }
    if (formErrors._errors) {
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors._errors;
        return newErrors;
      });
    }
  };


  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
    setSignupError(null);
    if (formErrors.role) {
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.role;
        return newErrors;
      });
    }
  };


  const handleAccountInfoSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
     setInitial();

    const dataToValidate = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };
    const result = AccountInfoSchema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors = result.error.format();
      // Update formErrors with errors from AccountInfoSchema
      setFormErrors((prevErrors) => ({ ...prevErrors, ...fieldErrors }));
      toast.error("Please correct the errors in the form.");
      return;
    }
    console.log("Account Info Submitted:", result.data);
    setCurrentStep(2);
  };

  const handleVerifyEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !verificationCode ||
      verificationCode.length !== 6 ||
      !/^\d+$/.test(verificationCode)
    ) {
      toast.error("Please enter a valid 6-digit verification code.");
      return;
    }

    setInitial();
    try {
      const response = await axios.post(
        /* ...API details */
        "http://localhost:4000/api/auth/verify-email",
        { Email: formData.email, Code: verificationCode }
      );
      if (response.data.status === "success") {
        toast.success(response.data.message || "Email verified successfully!");
        setCurrentStep(4);
      } else {
        const message =
          response.data.message || "Verification failed. Please try again.";
        toast.error(message);
        setSignupError(message);
        setFormErrors({ _errors: [message] });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      const message =
        axios.isAxiosError(error) && error.response
          ? error.response.data.message ||
            "Server error during email verification."
          : "Email verification failed. Please check your connection.";
      toast.error(message);
      setSignupError(message);
      setFormErrors({ _errors: [message] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelectionAndInitiateSignup = async () => {

    const roleValidationResult = RoleSchema.safeParse({ role: formData.role });
    if (!roleValidationResult.success) {
      const fieldErrors = roleValidationResult.error.format();
      setFormErrors((prevErrors) => ({ ...prevErrors, ...fieldErrors }));
      toast.error("Please select a role.");
      if (fieldErrors.role?._errors)
        setSignupError(fieldErrors.role._errors.join(", "));
      return;
    }

    setInitial();

    // --- Apply Role Mapping ---
    let apiRoleValue = "";
    switch (formData.role) {
      case "donor":
        apiRoleValue = "DONOR_SELLER";
        break;
      case "beneficiary":
        apiRoleValue = "CHARITY_ORG";
        break;
      case "volunteer":
        apiRoleValue = "INDEP_DELIVERY";
        break;
      case "buyer":
        apiRoleValue = "BUYER";
        break;
      case "org_volunteer":
        apiRoleValue = "ORG_VOLUNTEER";
        break;
      default:
        toast.error("Invalid role selected. Please try again.");
        setSignupError("Invalid role selected.");
        setFormErrors({ _errors: ["Invalid role selected."] });
        setIsLoading(false);
        return;
    }
    try {
      const signupData = {
        /* ...API data */ 
        Username: formData.fullName,
        Email: formData.email,
        PhoneNumber: formData.phone,
        Password: formData.password,
        Role: apiRoleValue,
      };
      const response = await axios.post(
        /* ...API details */
        "http://localhost:4000/api/auth/signup",
        signupData
      );

      if (response.data.status === "success") {
        toast.success(
          response.data.message ||
            "Account created successfully. Please verify your email."
        );
        setCurrentStep(3);
      } else {
        const message =
          response.data.message || "Signup failed. Please try again.";
        toast.error(message);
        setSignupError(message);
        setFormErrors({ _errors: [message] });
      }
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response
          ? error.response.data.message || "Server error during signup."
          : "Signup failed. Please check your connection.";
      toast.error(message);
      setSignupError(message);
      setFormErrors({ _errors: [message] });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AccountInfo
            formData={{
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
            }}
            errors={{
              fullName: formErrors.fullName,
              email: formErrors.email,
              phone: formErrors.phone,
              password: formErrors.password,
              confirmPassword: formErrors.confirmPassword,
              _errors: formErrors._errors,
            }}
            handleInputChange={handleInputChange}
            onSubmit={handleAccountInfoSubmit}
          />
        );
      case 3:
        return (
          <VerifyEmail
            email={formData.email}
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            onSubmit={handleVerifyEmailSubmit}
          />
        );
      case 2:
        return (
          <RoleSelection
            currentRole={formData.role}
            handleSelectChange={handleSelectChange}
            onNext={handleRoleSelectionAndInitiateSignup}
            errors={
              formErrors.role
                ? { role: formErrors.role, _errors: [] }
                : { _errors: [] }
            }
          />
        );
      case 4:
        return <RegistrationCompletion fullName={formData.fullName} />;
      default:
        return <p>Loading step...</p>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pale-mint px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row gap-8 relative">
        {" "}
        <RegistrationTracker currentStep={currentStep} steps={steps} />
        <div className="w-full md:w-3/4">
          {formErrors._errors &&
            formErrors._errors.length > 0 &&
            !isLoading && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm"
                role="alert"
              >
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">
                  {formErrors._errors.join(", ")}
                </span>
              </div>
            )}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
              {" "}
              {/* Basic overlay loading indicator */}
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green"></div>
              <p className="ml-3 text-lg font-semibold text-brand-green">
                Processing...
              </p>
            </div>
          )}
          <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
            {" "}
            {/* Dim content when loading */}
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
}