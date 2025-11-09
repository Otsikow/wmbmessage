import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getFriendlyErrorMessage } from "@/lib/errorHandling";
import { validateSignUpInput } from "@/lib/validation/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { sanitized, errors } = validateSignUpInput({ name, email, password });

    setName(sanitized.name);
    setEmail(sanitized.email);
    setPassword(sanitized.password);

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join("\n"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: sanitized.email,
        password: sanitized.password,
        options: {
          data: {
            full_name: sanitized.name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description:
          "Account created successfully! Please verify your email before signing in.",
      });

      navigate("/auth/verify-email", {
        state: { email: sanitized.email },
      });
    } catch (error) {
      console.error("Email sign-up failed:", error);
      toast({
        title: "Error",
        description: getFriendlyErrorMessage(
          error,
          "We couldn't create your account. Please review your details or try again later.",
          "email sign-up"
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Google sign-up failed:", error);
      toast({
        title: "Error",
        description: getFriendlyErrorMessage(
          error,
          "Unable to sign up with Google right now. Please try again later.",
          "google sign-up"
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      description="Start your journey with MessageGuide"
      backLink={{ to: "/", label: "Back to Home" }}
      onGoogleClick={handleGoogleSignUp}
      googleLabel="Continue with Google"
      alternateAction={{
        message: "Already have an account?",
        actionLabel: "Sign In",
        to: "/auth/sign-in",
      }}
    >
      <form onSubmit={handleEmailSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Must be 8+ characters with upper, lower, number, and symbol.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
