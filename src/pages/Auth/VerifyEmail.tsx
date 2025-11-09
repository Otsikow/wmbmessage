import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateEmailOnly } from "@/lib/validation/auth";

interface VerifyEmailState {
  email?: string;
}

const RESEND_TIMEOUT_SECONDS = 60;

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const initialState = location.state as VerifyEmailState | null;
  const queryEmail = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("email") || undefined;
  }, [location.search]);

  const [email, setEmail] = useState(initialState?.email || queryEmail || "");
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (initialState?.email) {
      setEmail(initialState.email);
    }
  }, [initialState?.email]);

  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [queryEmail]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendVerification = async () => {
    const { sanitized, errors } = validateEmailOnly(email);
    setEmail(sanitized.email);

    if (errors.length > 0) {
      toast({
        title: "Invalid email",
        description: errors.join("\n"),
        variant: "destructive",
      });
      return;
    }

    setResendLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: sanitized.email,
      });

      if (error) throw error;

      setCountdown(RESEND_TIMEOUT_SECONDS);
      toast({
        title: "Verification email sent",
        description: "We've sent a fresh verification link to your inbox.",
      });
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Unable to resend",
        description:
          "We couldn't resend the verification email right now. Please try again shortly.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-8 space-y-6">
        <Link
          to="/auth/sign-in"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-primary/10 text-primary p-3">
            <MailCheck className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to
              {email ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">{email}</span>.
                </>
              ) : (
                " your inbox."
              )}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
            <p className="text-xs text-muted-foreground">
              Can't find the email? Check your spam folder or request a new link below.
            </p>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={handleResendVerification}
            disabled={resendLoading || countdown > 0}
          >
            {resendLoading ? (
              <div className="inline-flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Sending...
              </div>
            ) : countdown > 0 ? (
              `Resend available in ${countdown}s`
            ) : (
              "Resend verification email"
            )}
          </Button>
        </div>

        <div className="rounded-md bg-muted/60 p-4 text-sm text-muted-foreground">
          Once you've clicked the link in your email, return here and continue to sign in.
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <button
            type="button"
            onClick={() => navigate("/auth/sign-in")}
            className="font-medium text-primary hover:underline"
          >
            Sign in now
          </button>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
