import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/integrations/supabase/config";
import { consumeReturnPath } from "@/lib/authRedirect";
import { getSanitizedAuthErrorMessage } from "@/lib/authErrors";
import { AuthLayout } from "@/components/auth/AuthLayout";

const readUrlError = () => {
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return (
    params.get("error_description") ||
    params.get("error") ||
    hash.get("error_description") ||
    hash.get("error") ||
    null
  );
};

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const urlError = readUrlError();
      if (urlError) {
        if (!cancelled) {
          const denied = /access_denied|denied|cancel/i.test(urlError);
          setErrorMessage(
            denied
              ? "Google sign-in was cancelled. You can return to sign in and try again."
              : getSanitizedAuthErrorMessage(new Error(urlError), "oauth")
          );
        }
        return;
      }

      if (!isSupabaseConfigured) {
        if (!cancelled) setErrorMessage("Authentication is not configured for this environment.");
        return;
      }

      try {
        const code = new URLSearchParams(window.location.search).get("code");
        let { data, error } = await supabase.auth.getSession();

        if (!data.session && code) {
          const exchange = await supabase.auth.exchangeCodeForSession(code);
          data = exchange.data;
          error = exchange.error;
        }

        for (let attempt = 0; !data.session && attempt < 20; attempt += 1) {
          await wait(250);
          const sessionResult = await supabase.auth.getSession();
          data = sessionResult.data;
          error = sessionResult.error;
          if (error) break;
        }

        if (cancelled) return;

        if (error) {
          setErrorMessage(getSanitizedAuthErrorMessage(error, "oauth"));
          return;
        }

        if (data.session) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (cancelled) return;

          if (userError || !userData.user) {
            setErrorMessage(
              userError
                ? getSanitizedAuthErrorMessage(userError, "oauth")
                : "We couldn't verify your account. Please return to sign in and try again."
            );
            return;
          }

          toast({ title: "Signed in", description: "You have been signed in successfully." });
          navigate(consumeReturnPath(), { replace: true });
          return;
        }

        setErrorMessage("Google did not return a valid sign-in session. Please return to sign in and try again.");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getSanitizedAuthErrorMessage(error, "oauth"));
        }
      }
    };

    void finish();

    return () => {
      cancelled = true;
    };
  }, [navigate, toast]);

  if (errorMessage) {
    return (
      <AuthLayout
        title="Sign-in failed"
        description="We couldn't complete your sign-in."
        backLink={{ to: "/", label: "Back to Home" }}
      >
        <div className="space-y-4">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button className="w-full" onClick={() => navigate("/auth/sign-in", { replace: true })}>
            Back to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Signing you in" description="Please wait while we finish signing you in.">
      <div className="flex justify-center py-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Signing in" />
      </div>
    </AuthLayout>
  );
}
