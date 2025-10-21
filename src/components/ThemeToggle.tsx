import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

export default function ThemeToggle() {
  const { settings, updateSettings } = useSettings();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
      className="h-9 w-9"
    >
      {settings.theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
