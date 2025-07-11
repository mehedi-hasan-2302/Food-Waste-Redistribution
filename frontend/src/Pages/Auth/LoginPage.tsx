import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BiHide, BiShowAlt } from "react-icons/bi";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { toast } from "react-toastify";

// zod schema for login validation
const loginSchema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password is required"),
});


const LoginPage: React.FC = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string[]; password?: string[] }>({});
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
      useState(false);

    const [showPassword, setShowPassword] = useState<boolean>(false);

    // auth Store state variables and actions
    const loginSuccess = useAuthStore((state) => state.loginSuccess);
    const setLoginError = useAuthStore((state) => state.setLoginError);
    const setIsLoading = useAuthStore((state) => state.setIsLoading);
    const loginError = useAuthStore((state) => state.loginError);
    const isLoading = useAuthStore((state) => state.isLoading);
    const navigate = useNavigate();


    const togglePasswordVisibility = () => {
      setShowPassword((prev: boolean) => !prev);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        console.log(`Input changed: ${id} = ${value}`);
        setErrors((prev) => ({ ...prev, [id]: undefined }));
        if(loginError) {
            setLoginError(null);
        }
    }

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setLoginError(null);

        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
            const fieldErrors: { email?: string[]; password?: string[] } = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as "email" | "password";
                if (!fieldErrors[field]) {
                  fieldErrors[field] = [];
                }
                fieldErrors[field]?.push(issue.message);
      });

      setErrors(fieldErrors);
      toast.warn("Please correct the errors in the form.");
      return;
    }

    // login API call process
        setIsLoading(true);
        try {
          const response = await axios.post(
            "http://localhost:4000/api/auth/login",
            {
              Email: result.data.email,
              Password: result.data.password,
            }
          );

          if (
            response.data.status === "success" &&
            response.data.data.token &&
            response.data.data.user
          ) {
            loginSuccess(response.data.data.user, response.data.data.token);
            toast.success("Login successful!");
            
            // Reset loading state
            setIsLoading(false);
            
            // Navigate based on profile completion status
            const isProfileComplete = response.data.data.user.isProfileComplete;
            
            if (!isProfileComplete) {
               navigate("/profile");
            } else {
               // Navigate to homepage
               navigate("/");
            }
          } else {
            setIsLoading(false);
            const errorMessage = response.data.message || "Login failed. Please try again.";
            setLoginError(errorMessage);
            toast.error(errorMessage);
          }
          
        } catch (error) {
          setIsLoading(false);
          let message = "Login failed. Please check your connection and try again.";
          
          if (axios.isAxiosError(error) && error.response) {
            message = error.response.data.message || "Invalid credentials or server error.";
          }
          
          setLoginError(message);
          toast.error(message);
          console.error("Login error:", error);
        }
    }

    const openForgotPasswordModal = () => {
      setIsForgotPasswordModalOpen(true);
    };
    const closeForgotPasswordModal = () => {
      setIsForgotPasswordModalOpen(false);
    };

    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-pale-mint px-4 font-sans">
          <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full my-8">
            {" "}
            <div className="flex-1 p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark-text mb-3 text-center md:text-left">
                Sign In
              </h2>
              <p className="text-base text-dark-text/70 mb-8 text-center md:text-left">
                Welcome back! Please enter your details.
              </p>

              {loginError && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm"
                  role="alert"
                >
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{loginError}</span>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <Label
                    htmlFor="email"
                    className="text-base text-brand-green font-medium"
                  >
                    Enter Email / Phone No
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="you@example.com"
                    className="mt-2 h-11 text-base px-4"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      handleInputChange(e);
                    }}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.join(", ")}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Label
                    htmlFor="password"
                    className="text-base text-brand-green font-medium"
                  >
                    Password
                  </Label>{" "}
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 text-base px-4 pr-10"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        handleInputChange(e);
                      }}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-brand-green"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <BiShowAlt className="h-5 w-5" />
                      ) : (
                        <BiHide className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.join(", ")}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={openForgotPasswordModal}
                    className="text-sm font-medium text-highlight hover:underline focus:outline-none"
                  >
                    Forgot your password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white text-lg py-3 h-auto" // Larger text, auto height
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="mx-4 text-sm text-gray-500">
                  Or Sign in with
                </span>
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>

              <Button
                variant="outline"
                className="w-full text-base border-dark-text/30 hover:border-brand-green hover:text-brand-green h-11 flex items-center justify-center"
                disabled={isLoading}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-5 w-5 mr-2"
                />
                Sign In with Google
              </Button>

              <p className="text-sm text-center mt-8 text-dark-text/80">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-highlight hover:underline"
                >
                  Register Now
                </Link>
              </p>
            </div>
            {/* Right side: Illustration */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-white p-8 rounded-r-2xl">
              {" "}
              <img
                src="assets\loginpage-image.png"
                alt="Login Illustration"
                className="max-w-xs lg:max-w-sm object-contain"
              />
            </div>
          </div>
        </div>

        <ForgotPasswordModal
          isOpen={isForgotPasswordModalOpen}
          onClose={closeForgotPasswordModal}
        />
      </>
    );
}

export default LoginPage;