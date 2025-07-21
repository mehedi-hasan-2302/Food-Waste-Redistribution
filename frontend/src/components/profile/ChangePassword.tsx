import React, { useState } from "react";
import { Eye, EyeOff, Lock, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { API_CONFIG } from "@/config/api";
import { z } from "zod";

interface ChangePasswordProps {
  onSuccess?: () => void;
}

// Password validation schema matching the registration form
const PasswordSchema = z
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
  });

const ChangePasswordSchema = z
  .object({
    CurrentPassword: z.string().min(1, "Current password is required"),
    NewPassword: PasswordSchema,
    ConfirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.NewPassword === data.ConfirmPassword, {
    message: "Passwords do not match",
    path: ["ConfirmPassword"],
  })
  .refine((data) => data.CurrentPassword !== data.NewPassword, {
    message: "New password must be different from current password",
    path: ["NewPassword"],
  });

interface ChangePasswordProps {
  onSuccess?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    CurrentPassword: "",
    NewPassword: "",
    ConfirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    CurrentPassword?: string[];
    NewPassword?: string[];
    ConfirmPassword?: string[];
  }>({});
  
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];
    
    strength = checks.filter(Boolean).length;
    
    return {
      score: strength,
      label: strength === 0 ? "" : 
             strength <= 2 ? "Weak" : 
             strength <= 3 ? "Fair" : 
             strength <= 4 ? "Good" : "Strong",
      color: strength === 0 ? "" :
             strength <= 2 ? "bg-red-500" : 
             strength <= 3 ? "bg-yellow-500" : 
             strength <= 4 ? "bg-blue-500" : "bg-green-500"
    };
  };

  const passwordStrength = getPasswordStrength(formData.NewPassword);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field errors when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Real-time validation for password fields
    if (name === "NewPassword" && value) {
      try {
        PasswordSchema.parse(value);
        setFieldErrors((prev) => ({
          ...prev,
          NewPassword: undefined,
        }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setFieldErrors((prev) => ({
            ...prev,
            NewPassword: error.errors.map((e) => e.message),
          }));
        }
      }
    }

    // Check password match in real-time
    if (name === "ConfirmPassword" && value && formData.NewPassword) {
      if (value !== formData.NewPassword) {
        setFieldErrors((prev) => ({
          ...prev,
          ConfirmPassword: ["Passwords do not match"],
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          ConfirmPassword: undefined,
        }));
      }
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    try {
      ChangePasswordSchema.parse(formData);
      setFieldErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: typeof fieldErrors = {};
        
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof typeof fieldErrors;
          if (!newErrors[field]) {
            newErrors[field] = [];
          }
          newErrors[field]!.push(err.message);
        });
        
        setFieldErrors(newErrors);
        
        // Show the first error in a toast
        const firstError = error.errors[0];
        toast.error(firstError.message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!token) {
      toast.error("You must be logged in to change password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_CONFIG.baseURL}/api/auth/change-password`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (response.data && response.data.status === "success") {
        toast.success("Password changed successfully! Please login again.", {
          autoClose: 3000,
        });
        
        // Clear form
        setFormData({
          CurrentPassword: "",
          NewPassword: "",
          ConfirmPassword: "",
        });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Logout user after 2 seconds to allow them to see the success message
        setTimeout(() => {
          logout();
          window.location.href = "/login";
        }, 2000);
        
      } else {
        throw new Error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to change password"
        : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      CurrentPassword: "",
      NewPassword: "",
      ConfirmPassword: "",
    });
    setFieldErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-highlight/30 pb-4 mb-6">
        <KeyRound className="h-7 w-7 md:h-8 md:w-8 text-highlight" />
        <h2 className="font-serif text-xl md:text-2xl font-semibold text-dark-text">
          Change Password
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label 
            htmlFor="CurrentPassword" 
            className="block text-sm font-medium text-dark-text mb-2"
          >
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPasswords.current ? "text" : "password"}
              id="CurrentPassword"
              name="CurrentPassword"
              value={formData.CurrentPassword}
              onChange={handleInputChange}
              required
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green ${
                fieldErrors.CurrentPassword?.length ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility("current")}
            >
              {showPasswords.current ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {fieldErrors.CurrentPassword?.length && (
            <p className="mt-1 text-xs text-red-500">
              {fieldErrors.CurrentPassword.join(", ")}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label 
            htmlFor="NewPassword" 
            className="block text-sm font-medium text-dark-text mb-2"
          >
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPasswords.new ? "text" : "password"}
              id="NewPassword"
              name="NewPassword"
              value={formData.NewPassword}
              onChange={handleInputChange}
              required
              minLength={8}
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green ${
                fieldErrors.NewPassword?.length ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your new password (min. 8 characters)"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility("new")}
            >
              {showPasswords.new ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.NewPassword && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password Strength:</span>
                <span className={`text-xs font-medium ${
                  passwordStrength.score <= 2 ? "text-red-600" : 
                  passwordStrength.score <= 3 ? "text-yellow-600" : 
                  passwordStrength.score <= 4 ? "text-blue-600" : "text-green-600"
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {fieldErrors.NewPassword?.length ? (
            <div className="mt-1 space-y-1">
              {fieldErrors.NewPassword.map((error, index) => (
                <p key={index} className="text-xs text-red-500">
                  {error}
                </p>
              ))}
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-sm text-gray-500 mb-2">
                Password must contain:
              </p>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center space-x-2 ${
                  formData.NewPassword.length >= 8 ? "text-green-600" : "text-gray-500"
                }`}>
                  <span>{formData.NewPassword.length >= 8 ? "✓" : "○"}</span>
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center space-x-2 ${
                  /[A-Z]/.test(formData.NewPassword) ? "text-green-600" : "text-gray-500"
                }`}>
                  <span>{/[A-Z]/.test(formData.NewPassword) ? "✓" : "○"}</span>
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 ${
                  /[a-z]/.test(formData.NewPassword) ? "text-green-600" : "text-gray-500"
                }`}>
                  <span>{/[a-z]/.test(formData.NewPassword) ? "✓" : "○"}</span>
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 ${
                  /\d/.test(formData.NewPassword) ? "text-green-600" : "text-gray-500"
                }`}>
                  <span>{/\d/.test(formData.NewPassword) ? "✓" : "○"}</span>
                  <span>One number</span>
                </div>
                <div className={`flex items-center space-x-2 ${
                  /[!@#$%^&*(),.?":{}|<>]/.test(formData.NewPassword) ? "text-green-600" : "text-gray-500"
                }`}>
                  <span>{/[!@#$%^&*(),.?":{}|<>]/.test(formData.NewPassword) ? "✓" : "○"}</span>
                  <span>One special character</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label 
            htmlFor="ConfirmPassword" 
            className="block text-sm font-medium text-dark-text mb-2"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPasswords.confirm ? "text" : "password"}
              id="ConfirmPassword"
              name="ConfirmPassword"
              value={formData.ConfirmPassword}
              onChange={handleInputChange}
              required
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green ${
                fieldErrors.ConfirmPassword?.length ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility("confirm")}
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {fieldErrors.ConfirmPassword?.length && (
            <p className="mt-1 text-xs text-red-500">
              {fieldErrors.ConfirmPassword.join(", ")}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-brand-green hover:bg-brand-green/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
          >
            {isLoading ? "Changing Password..." : "Change Password"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Security Notice:</p>
            <p>
              Changing your password will log you out of all devices for security. 
              You'll need to login again with your new password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
