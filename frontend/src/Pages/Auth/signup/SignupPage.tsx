"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import RegistrationTracker from "@/components/RegistrationTracker";
import type { Step } from "@/components/RegistrationTracker";
import AccountInfo from "./steps/AccountInfo";
import VerifyEmail from "./steps/VerifyEmail";
import RoleSelection from "./steps/RoleSelection";
import RegistrationCompletion from "./steps/RegistrationCompletion";
import { z } from "zod/v4";

// interface FormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   password: string;
//   confirmPassword: string;
//   role: string;
// }

const AccountInfoSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
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
    path: ["confirmPassword"], // Attach error to confirmPassword field
  });

  const RoleSchema = z.object({
    role: z.string().min(1, "Role is required"),
  });

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const UserSchema = AccountInfoSchema.extend({
    role: RoleSchema.shape.role,
  });

  type FormData = z.infer<typeof UserSchema>;
  type FullFormErrors = Partial<z.ZodFormattedError<FormData, string>>;


const steps: Step[] = [
  { id: 1, name: "Account Info" },
  { id: 2, name: "Verify Email" },
  { id: 3, name: "Select Role" },
  { id: 4, name: "Completion" },
];

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FullFormErrors>({});

  type FormData = z.infer<typeof UserSchema>;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear the specific error when the user starts typing
    // id is a key of FormData, so this is safe
    if (formErrors[id as keyof FormData]) {
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[id as keyof FormData];
        return newErrors;
      });
    }
  };


  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
    // Clear role error if it exists
    if (formErrors.role) {
      // This is now type-correct (line 102 area)
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.role;
        return newErrors;
      });
    }
  };

  const handleNextStep = () => {
    setFormErrors({}); // Clear all errors when moving to the next step
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleAccountInfoSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // setFormErrors({}); // Clear previous specific errors, handled by handleNextStep or initial call

    const dataToValidate = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };
    const result = AccountInfoSchema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors = result.error.format();
      // Update formErrors with errors from AccountInfoSchema
      // Since FullFormErrors is a superset, this is fine.
      setFormErrors((prevErrors) => ({ ...prevErrors, ...fieldErrors }));
      console.error("AccountInfo Validation errors:", fieldErrors);
      return;
    }
    console.log("Account Info Submitted:", result.data);
    handleNextStep();
  };

  const handleVerifyEmailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !verificationCode ||
      verificationCode.length !== 6 ||
      !/^\d+$/.test(verificationCode)
    ) {
      alert("Please enter a valid 6-digit verification code.");
      // Optionally set an error state for this specific input if you have one
      return;
    }
    if (verificationCode === "123456") {
      alert("Email verified successfully!");
      handleNextStep();
    } else {
      alert("Invalid verification code. Please try again.");
    }
  };

  const handleRoleSelectionSubmit = () => {
    // setFormErrors({}); // Clear previous specific errors

    const dataToValidate = { role: formData.role };
    const result = RoleSchema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors = result.error.format();
      // Update formErrors with errors from RoleSchema
      setFormErrors((prevErrors) => ({ ...prevErrors, ...fieldErrors }));
      console.error("RoleSelection Validation errors:", fieldErrors);
      return;
    }
    console.log("Role Selected:", result.data.role);
    handleNextStep();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AccountInfo
            formData={{
              // Pass only relevant fields
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
            }}
            errors={{
              firstName: formErrors.firstName,
              lastName: formErrors.lastName,
              email: formErrors.email,
              phone: formErrors.phone,
              password: formErrors.password,
              confirmPassword: formErrors.confirmPassword,
              _errors: formErrors._errors, // for form-level errors if any
            }} // Pass down the errors object
            handleInputChange={handleInputChange}
            onSubmit={handleAccountInfoSubmit}
          />
        );
      case 2:
        return (
          <VerifyEmail
            email={formData.email}
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            onSubmit={handleVerifyEmailSubmit}
            // You can also pass an error prop for the verification code if needed
          />
        );
      case 3:
        return (
          <RoleSelection
            currentRole={formData.role}
            handleSelectChange={handleSelectChange}
            onNext={handleRoleSelectionSubmit}
            errors={
              formErrors.role
                ? { role: formErrors.role, _errors: [] }
                : { _errors: [] }
            }
          />
        );
      case 4:
        return <RegistrationCompletion firstName={formData.firstName} />;
      default:
        return <p>Loading step...</p>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pale-mint px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row gap-8">
        <RegistrationTracker currentStep={currentStep} steps={steps} />
        <div className="w-full md:w-3/4">{renderStepContent()}</div>
      </div>
    </div>
  );
}