import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";

export const GlobalLoadingOverlay = () => {
  const { loading: authLoading } = useAuth();
  const { loading: settingsLoading } = useSettings();

  const isLoading = authLoading || settingsLoading;

  if (!isLoading) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background/90 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <div className="text-center">
        <p className="text-base font-medium text-foreground">Preparing your experience…</p>
        <p className="text-sm text-muted-foreground">Loading authentication and settings</p>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
