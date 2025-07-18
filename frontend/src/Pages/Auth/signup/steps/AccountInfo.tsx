import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaUserPlus } from "react-icons/fa6";
import { BiHide, BiShowAlt } from "react-icons/bi";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface FieldError {
  _errors: string[];
}

interface AccountInfoStepErrors {
  fullName?: FieldError;
  email?: FieldError;
  phone?: FieldError;
  password?: FieldError;
  confirmPassword?: FieldError;
  _errors?: string[]; 
}

interface FormDataValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface AccountInfoFormProps {
  formData: FormDataValues;
  errors: AccountInfoStepErrors;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
}

const AccountInfo: React.FC<AccountInfoFormProps> = ({
  formData,
  errors,
  handleInputChange,
  onSubmit,
  isLoading = false,
}) => {

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);

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

  const passwordStrength = getPasswordStrength(formData.password);

  const togglePasswordVisibility = () => {
    setShowPassword((prev: boolean) => !prev);
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    setInternalLoading(true);
    
    onSubmit(e);
    
    setTimeout(() => {
      setInternalLoading(false);
    }, 2000);
  }

  const isCurrentlyLoading = isLoading || internalLoading;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark-text mb-4 flex items-center gap-2">
        <FaUserPlus className="text-brand-green" /> Sign Up - Account Info
      </h2>
      <p className="text-sm font-[Inter] text-dark-text/70 mb-6">
        Enter your details to create an account
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 font-[Inter]">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              className={`mt-1 ${
                errors.fullName?._errors?.length ? "border-red-500" : ""
              }`}
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={isCurrentlyLoading}
              aria-invalid={!!errors.fullName?._errors?.length}
              aria-describedby="fullName-error"
            />
            {errors.fullName?._errors?.length && (
              <p id="fullName-error" className="text-xs text-red-500 mt-1">
                {errors.fullName._errors.join(", ")}
              </p>
            )}
          </div>          
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={`mt-1 ${
              errors.email?._errors?.length ? "border-red-500" : ""
            }`}
            value={formData.email}
            onChange={handleInputChange}
            disabled={isCurrentlyLoading}
            aria-invalid={!!errors.email?._errors?.length}
            aria-describedby="email-error"
          />
          {errors.email?._errors?.length && (
            <p id="email-error" className="text-xs text-red-500 mt-1">
              {errors.email._errors.join(", ")}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="01712345678"
            className={`mt-1 ${
              errors.phone?._errors?.length ? "border-red-500" : ""
            }`}
            value={formData.phone}
            onChange={handleInputChange}
            disabled={isCurrentlyLoading}
            aria-invalid={!!errors.phone?._errors?.length}
            aria-describedby="phone-error"
          />
          {errors.phone?._errors?.length && (
            <p id="phone-error" className="text-xs text-red-500 mt-1">
              {errors.phone._errors.join(", ")}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`mt-1 pr-10 ${
                errors.password?._errors?.length ? "border-red-500" : ""
              }`}
              value={formData.password}
              onChange={handleInputChange}
              disabled={isCurrentlyLoading}
              aria-invalid={!!errors.password?._errors?.length}
              aria-describedby="password-error"
            />
            {showPassword ? (
              <BiShowAlt
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
                onClick={togglePasswordVisibility}
              />
            ) : (
              <BiHide
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
                onClick={togglePasswordVisibility}
              />
            )}
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
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
          
          {errors.password?._errors?.length ? (
            <div className="mt-1 space-y-1">
              {errors.password._errors.map((error, index) => (
                <p key={index} id="password-error" className="text-xs text-red-500">
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
                  formData.password.length >= 8 ? "text-green-600" : "text-gray-500"
                }`}>
                  <span>{formData.password.length >= 8 ? "✓" : "○"}</span>
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center space-x-2 ${
                  /[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-500"
                }`}>
                  <span>{/[A-Z]/.test(formData.password) ? "✓" : "○"}</span>
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 ${
                  /[a-z]/.test(formData.password) ? "text-green-600" : "text-gray-500"
                }`}>
                  <span>{/[a-z]/.test(formData.password) ? "✓" : "○"}</span>
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 ${
                  /\d/.test(formData.password) ? "text-green-600" : "text-gray-500"
                }`}>
                  <span>{/\d/.test(formData.password) ? "✓" : "○"}</span>
                  <span>One number</span>
                </div>
                <div className={`flex items-center space-x-2 ${
                  /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "text-green-600" : "text-gray-500"
                }`}>
                  <span>{/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "✓" : "○"}</span>
                  <span>One special character</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`mt-1 pr-10 ${
                errors.confirmPassword?._errors?.length ? "border-red-500" : ""
              }`}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isCurrentlyLoading}
              aria-invalid={!!errors.confirmPassword?._errors?.length}
              aria-describedby="confirmPassword-error"
            />
            {showPassword ? (
              <BiShowAlt
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
                onClick={togglePasswordVisibility}
              />
            ) : (
              <BiHide
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
                onClick={togglePasswordVisibility}
              />
            )}
          </div>
          {errors.confirmPassword?._errors?.length && (
            <p id="confirmPassword-error" className="text-xs text-red-500 mt-1">
              {errors.confirmPassword._errors.join(", ")}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-brand-green hover:bg-brand-green/90 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isCurrentlyLoading}
        >
          {isCurrentlyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCurrentlyLoading ? "Processing..." : "Proceed to Role Selection"}
        </Button>
      </form>
      {/* Social Logins */}
      <div className="flex items-center my-6">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="mx-2 text-xs text-gray-500 font-[Inter]">
          Or Sign up with
        </span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>
      <Button
        variant="outline"
        className="w-full cursor-pointer"
        onClick={() => alert("Google Sign up clicked")}
        disabled={isCurrentlyLoading}
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="h-5 w-5 mr-2"
        />
        Google
      </Button>
      <p className="text-xs text-center mt-6 font-[Inter]">
        Already have an account?{" "}
        <Link to="/login">
        <span
          className="font-bold cursor-pointer hover:underline hover:text-brand-green"
        >
          Sign in
        </span>
        </Link>
      </p>
    </div>
  );
};

export default AccountInfo;