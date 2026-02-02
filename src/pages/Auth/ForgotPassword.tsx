import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getFriendlyErrorMessage } from "@/lib/errorHandling";
import logo from "@/assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/reset-password`;
      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        error?: string;
      }>("send-password-reset", {
        body: { email, redirectTo },
      });

      if (error) throw error;
      if (data && !data.success) {
        throw new Error(data.error || "Password reset request failed.");
      }

      setSent(true);
      toast({
        title: "Recovery email sent",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Password recovery request failed:", error);
      }
      toast({
        title: "Error",
        description: getFriendlyErrorMessage(
          error,
          "We couldn't send the reset email. Please verify your address and try again.",
          "forgot-password"
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <Link
          to="/auth/sign-in"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>

        <div className="flex flex-col items-center space-y-4">
          <img src={logo} alt="MessageGuide" className="h-16 w-16" />
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-muted-foreground text-center">
            {sent
              ? "We've sent password reset instructions to your email."
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="outline"
              onClick={() => setSent(false)}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
