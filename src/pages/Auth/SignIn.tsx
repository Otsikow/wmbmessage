import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isSupabaseConfigured } from "@/integrations/supabase/config";
import { supabase } from "@/integrations/supabase/client";
import { getSanitizedAuthErrorMessage } from "@/lib/authErrors";
import { validateSignInInput } from "@/lib/validation/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const { sanitized, errors } = validateSignInInput({ email, password });

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

    if (!isSupabaseConfigured) {
      toast({
        title: "Service unavailable",
        description:
          "Sign in is temporarily unavailable while we finish setting up authentication. Please try again soon.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitized.email,
        password: sanitized.password,
      });

      if (error) {
        const errorMessage = error.message?.toLowerCase?.() ?? "";

        if (errorMessage.includes("confirm") || errorMessage.includes("verify")) {
          toast({
            title: "Email verification required",
            description:
              "Please verify your email address before signing in. We've sent you instructions.",
          });

          navigate("/auth/verify-email", {
            state: { email: sanitized.email },
          });

          return;
        }

        throw error;
      }

      toast({
        title: "Success",
        description: "You have been signed in successfully.",
      });

      navigate("/");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Email sign-in failed:", error);
      }
      toast({
        title: "Error",
        description: getSanitizedAuthErrorMessage(error, "sign-in"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Service unavailable",
        description:
          "Sign in is temporarily unavailable while we finish setting up authentication. Please try again soon.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });

      if (error) throw error;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Google sign-in failed:", error);
      }
      toast({
        title: "Error",
        description: getSanitizedAuthErrorMessage(error, "oauth"),
        variant: "destructive",
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to access your Bible study and notes"
      backLink={{ to: "/", label: "Back to Home" }}
      onGoogleClick={handleGoogleSignIn}
      googleLabel="Continue with Google"
      alternateAction={{
        message: "Don’t have an account?",
        actionLabel: "Create Account",
        to: "/auth/sign-up",
      }}
    >
      <form onSubmit={handleEmailSignIn} className="space-y-4">
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
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <Link to="/auth/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
    </AuthLayout>
  );
}
