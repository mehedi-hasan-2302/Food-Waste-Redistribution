import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BiHide, BiShowAlt } from "react-icons/bi";
import { z } from "zod";
import { useState } from "react";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import { Link } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password is required"),
});


const LoginPage: React.FC = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
      useState(false);

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const togglePasswordVisibility = () => {
      setShowPassword((prev: boolean) => !prev);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        console.log(`Input changed: ${id} = ${value}`);
        setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
            const fieldErrors: { email?: string; password?: string } = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as "email" | "password";
                fieldErrors[field] = issue.message;
      });

      setErrors(fieldErrors);
      return;
    }
        console.log("Login successful:", result.data);
        // Handle successful login logic here
    }

    const openForgotPasswordModal = () => {
      setIsForgotPasswordModalOpen(true);
    };
    const closeForgotPasswordModal = () => {
      setIsForgotPasswordModalOpen(false);
    };

    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-pale-mint px-4">
          <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-md overflow-hidden max-w-5xl w-full">
            {/* Left side: Form */}
            <div className="flex-1 p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark-text mb-4">
                Sign in
              </h2>
              <p className="text-sm text-dark-text/70 mb-6">
                Enter your details to login to your account
              </p>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <Label htmlFor="email">Enter Email / Phone No</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="you@example.com"
                    className="mt-1"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      handleInputChange(e);
                    }}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="relative">
                  <Label htmlFor="password">Passcode</Label>
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
                    type= {showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="mt-1"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      handleInputChange(e);
                    }}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div
                  className="text-right font-bold text-xs text-dark-text/70 cursor-pointer hover:underline hover:text-brand-green"
                  onClick={openForgotPasswordModal}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      openForgotPasswordModal();
                    }
                  }}
                >
                  Forgot your password?{" "}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white cursor-pointer"
                >
                  Sign in
                </Button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="mx-2 text-xs text-gray-500">
                  Or Sign in with
                </span>
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>

              <Button variant="outline" className="w-full cursor-pointer">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-5 w-5 mr-2"
                />
                Google
              </Button>

              <p className="text-xs text-center mt-6">
                Don’t have an account?{" "}
                <Link to="/signup">
                <span className="font-bold cursor-pointer hover:underline hover:text-brand-green">
                  Register Now
                </span>
                </Link>
              </p>
            </div>

            {/* Right side: Illustration */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-white">
              <img
                src="/src/assets/loginpage-image.png"
                alt="Login Illustration"
                className="max-h-[350px] object-contain"
              />
            </div>
          </div>
        </div>

        {/* Modal Component */}
        <ForgotPasswordModal
          isOpen={isForgotPasswordModalOpen}
          onClose={closeForgotPasswordModal}
        />
      </>
    );
}

export default LoginPage;
