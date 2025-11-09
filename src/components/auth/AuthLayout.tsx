import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logo.png";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  backLink?: {
    to: string;
    label: string;
  };
  alternateAction?: {
    message: string;
    actionLabel: string;
    to: string;
  };
  onGoogleClick?: () => void;
  googleLabel?: string;
}

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.81-2.22.85-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const AuthLayout = ({
  title,
  description,
  children,
  backLink,
  alternateAction,
  onGoogleClick,
  googleLabel,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-subtle-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {backLink ? (
          <Link
            to={backLink.to}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLink.label}
          </Link>
        ) : null}

        <div className="flex flex-col items-center space-y-4 text-center">
          <img src={logo} alt="MessageGuide" className="h-16 w-16" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {onGoogleClick ? (
          <div className="space-y-6">
            <Button type="button" variant="outline" className="w-full" onClick={onGoogleClick}>
              <GoogleIcon />
              {googleLabel ?? "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
          </div>
        ) : null}

        {children}

        {alternateAction ? (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex flex-col items-center gap-3 text-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{alternateAction.message}</span>
              <Link to={alternateAction.to} className="w-full">
                <Button variant="outline" className="w-full text-xs sm:text-sm">
                  {alternateAction.actionLabel}
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
};

export default AuthLayout;
