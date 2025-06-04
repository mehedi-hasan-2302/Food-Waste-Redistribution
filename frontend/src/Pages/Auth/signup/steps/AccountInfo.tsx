import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaUserPlus } from "react-icons/fa6";
import { BiHide, BiShowAlt } from "react-icons/bi";
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
}

const AccountInfo: React.FC<AccountInfoFormProps> = ({
  formData,
  errors,
  handleInputChange,
  onSubmit,
}) => {

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev: boolean) => !prev);
  }

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark-text mb-4 flex items-center gap-2">
        <FaUserPlus className="text-brand-green" /> Sign Up - Account Info
      </h2>
      <p className="text-sm font-[Inter] text-dark-text/70 mb-6">
        Enter your details to create an account
      </p>
      <form onSubmit={onSubmit} className="space-y-4 font-[Inter]">
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
            aria-invalid={!!errors.phone?._errors?.length}
            aria-describedby="phone-error"
          />
          {errors.phone?._errors?.length && (
            <p id="phone-error" className="text-xs text-red-500 mt-1">
              {errors.phone._errors.join(", ")}
            </p>
          )}
        </div>
        <div className="relative">
          <Label htmlFor="password">Password</Label>
          {showPassword ? (
            <BiShowAlt
              className="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
              onClick={togglePasswordVisibility}
            />
          ) : (
            <BiHide
              className="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
              onClick={togglePasswordVisibility}
            />
          )}
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`mt-1 ${
              errors.password?._errors?.length ? "border-red-500" : ""
            }`}
            value={formData.password}
            onChange={handleInputChange}
            aria-invalid={!!errors.password?._errors?.length}
            aria-describedby="password-error"
          />
          {errors.password?._errors?.length && (
            <p id="password-error" className="text-xs text-red-500 mt-1">
              {errors.password._errors.join(", ")}
            </p>
          )}
        </div>
        <div className="relative">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          {showPassword ? (
            <BiShowAlt
              className="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
              onClick={togglePasswordVisibility}
            />
          ) : (
            <BiHide
              className="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
              onClick={togglePasswordVisibility}
            />
          )}
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`mt-1 ${
              errors.confirmPassword?._errors?.length ? "border-red-500" : ""
            }`}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            aria-invalid={!!errors.confirmPassword?._errors?.length}
            aria-describedby="confirmPassword-error"
          />
          {errors.confirmPassword?._errors?.length && (
            <p id="confirmPassword-error" className="text-xs text-red-500 mt-1">
              {errors.confirmPassword._errors.join(", ")}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-brand-green hover:bg-brand-green/90 text-white cursor-pointer"
        >
          Proceed to Email Verification
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
