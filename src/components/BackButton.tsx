import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

interface BackButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  fallbackPath?: string;
  iconClassName?: string;
}

export function BackButton({
  fallbackPath = "/",
  className,
  iconClassName = "h-4 w-4 sm:h-5 sm:w-5",
  variant = "ghost",
  size = "icon",
  ...buttonProps
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    const canGoBack = typeof window !== "undefined" && window.history.length > 1;

    if (canGoBack) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath);
  };

  return (
    <Button
      type="button"
      aria-label="Go back"
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn("shrink-0", className)}
      {...buttonProps}
    >
      <ArrowLeft className={iconClassName} />
    </Button>
  );
}

export default BackButton;
