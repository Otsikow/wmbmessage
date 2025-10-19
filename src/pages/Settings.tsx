import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Moon, Bell, Download, Globe } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

export default function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);

  const handleToggle = (setting: string, value: boolean) => {
    toast.success(`${setting} ${value ? "enabled" : "disabled"}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/more")}
              className="md:hidden shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Settings</h1>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Appearance
              </h2>
              <div className="bg-card border border-border rounded-lg divide-y divide-border">
                <div className="flex items-center justify-between p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Moon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Dark Mode</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Enable dark theme</p>
                    </div>
                  </div>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={(value) => {
                      setDarkMode(value);
                      handleToggle("Dark mode", value);
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Notifications
              </h2>
              <div className="bg-card border border-border rounded-lg divide-y divide-border">
                <div className="flex items-center justify-between p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Bell className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Push Notifications</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Receive daily reminders</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications} 
                    onCheckedChange={(value) => {
                      setNotifications(value);
                      handleToggle("Notifications", value);
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Content
              </h2>
              <div className="bg-card border border-border rounded-lg divide-y divide-border">
                <div className="flex items-center justify-between p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Download className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Auto-download</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Download content for offline use</p>
                    </div>
                  </div>
                  <Switch 
                    checked={autoDownload} 
                    onCheckedChange={(value) => {
                      setAutoDownload(value);
                      handleToggle("Auto-download", value);
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
