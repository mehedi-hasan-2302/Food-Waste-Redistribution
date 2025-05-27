import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginPage() {
    return (
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

                <form className="space-y-4">
                <div>
                    <Label htmlFor="email">Enter Email / Phone No</Label>
                    <Input
                    id="email"
                    type="text"
                    placeholder="you@example.com"
                    className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="password">Passcode</Label>
                    <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="mt-1"
                    />
                </div>

                <div className="text-right text-xs text-dark-text/70">
                    Don’t have an account?{" "}
                    <span className="font-bold cursor-pointer hover:underline hover:text-brand-green">
                    Register now!
                    </span>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
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

                <Button variant="outline" className="w-full">
                <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="h-5 w-5 mr-2"
                />
                Google
                </Button>

                <p className="text-xs text-center mt-6">
                Don’t have an account?{" "}
                <span className="font-bold cursor-pointer hover:underline hover:text-brand-green">
                    Register Now
                </span>
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
    );
}

export default LoginPage;
