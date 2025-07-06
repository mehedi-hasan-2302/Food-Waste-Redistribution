import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import { Mail, User, MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// 1. Zod schema for validation
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  message: z.string().min(10, "Message must be at least 10 characters."),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms." }),
  }),
});

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const validationResult = contactSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        formattedErrors[issue.path[0]] = issue.message;
      }
      setErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);
    console.log("Form data submitted:", validationResult.data);

    try {
      // API Handling for later
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Your message has been sent successfully!");
      setFormData({ name: "", email: "", message: "", agreeToTerms: false });
    } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-beige font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <span className="text-highlight font-semibold font-sans uppercase tracking-wider">
            Contact Us
          </span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold font-serif text-brand-green">
            How Can We Help You?
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Suggestions, feedbacks, complaints, or just want to say hello? We value your input and look forward to connecting!
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-sm p-6 md:p-12 rounded-lg shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name" className="text-dark-text">
                  Your Name *
                </Label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="pl-10"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email" className="text-dark-text">
                  Your Email *
                </Label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="message" className="text-dark-text">
                Your Message *
              </Label>
              <div className="relative">
                <MessageSquare
                  size={18}
                  className="absolute top-3.5 left-3.5 text-gray-400"
                />
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows={6}
                  className="pl-10"
                />
              </div>
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            <div className="items-top flex space-x-2">
              <Checkbox
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={handleCheckboxChange}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="agreeToTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree that my submitted data is being collected and stored.
                </Label>
              </div>
            </div>
            {errors.agreeToTerms && (
              <p className="-mt-4 text-sm text-red-500">
                {errors.agreeToTerms}
              </p>
            )}

            <div className="text-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full sm:w-auto bg-highlight hover:bg-brand-green shadow-lg text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
