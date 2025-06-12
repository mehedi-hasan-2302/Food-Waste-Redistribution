import type { FormEvent } from "react";

export interface EnterEmailStepProps {
  email: string;
  setEmail: (value: string) => void;
  errors: { email?: string; form?: string };
  setErrors: React.Dispatch<React.SetStateAction<ForgotPasswordModalErrors>>;
  setPasswordResetError: (error: string | null) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export interface EnterCodeAndPasswordStepProps {
  emailToDisplay: string;
  code: string;
  setCode: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (value: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: React.Dispatch<React.SetStateAction<boolean>>;
  errors: {
    code?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    form?: string;
  };
  setErrors: React.Dispatch<React.SetStateAction<ForgotPasswordModalErrors>>;
  setPasswordResetError: (error: string | null) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onGoBackToEnterEmail: () => void;
  isLoading: boolean;
}

export type ForgotPasswordModalErrors = {
  email?: string;
  code?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  form?: string;
};
