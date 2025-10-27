import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Moon, Sun, Bell, Download, RotateCcw, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SettingsFontControls from "@/components/SettingsFontControls";
import { useSettings } from "@/contexts/SettingsContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleReset = () => {
    resetSettings();
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 w-full py-6 sm:py-8 pb-24 md:pb-8">
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
            <SettingsFontControls />

            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Bible Version
              </h2>
              <div className="bg-card border border-border rounded-lg">
                <div className="flex items-center justify-between p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base">Preferred Translation</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Choose your default Bible version
                      </p>
                    </div>
                  </div>
                  <Select
                    value={settings.bibleVersion}
                    onValueChange={(value) => {
                      updateSettings({ bibleVersion: value });
                      toast.success(`Bible version changed to ${value}`);
                    }}
                  >
                    <SelectTrigger className="w-[140px] sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KJV">King James (KJV)</SelectItem>
                      <SelectItem value="NIV">New International (NIV)</SelectItem>
                      <SelectItem value="ESV">English Standard (ESV)</SelectItem>
                      <SelectItem value="NKJV">New King James (NKJV)</SelectItem>
                      <SelectItem value="NLT">New Living (NLT)</SelectItem>
                      <SelectItem value="NASB">New American Standard (NASB)</SelectItem>
                      <SelectItem value="AMP">Amplified (AMP)</SelectItem>
                      <SelectItem value="CSB">Christian Standard (CSB)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Appearance
              </h2>
              <div className="bg-card border border-border rounded-lg divide-y divide-border">
                <div className="flex items-center justify-between p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {settings.theme === "dark" ? (
                      <Moon className="h-5 w-5 text-muted-foreground shrink-0" />
                    ) : (
                      <Sun className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-sm sm:text-base">Dark Mode</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {settings.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.theme === "dark"} 
                    onCheckedChange={(checked) => {
                      updateSettings({ theme: checked ? "dark" : "light" });
                      toast.success(`${checked ? "Dark" : "Light"} mode enabled`);
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Reset
              </h2>
              <div className="bg-card border border-border rounded-lg">
                <div className="p-4 sm:p-6">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="w-full"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset All Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
