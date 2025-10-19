import { Type, Palette } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/contexts/SettingsContext";

export default function SettingsFontControls() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-3">
      <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Reading Experience
      </h2>
      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {/* Font Size */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Type className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <Label className="font-medium text-sm sm:text-base">Font Size</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Adjust text size throughout the app</p>
            </div>
            <span className="text-sm font-medium min-w-[3rem] text-right">{settings.fontSize}px</span>
          </div>
          <Slider
            value={[settings.fontSize]}
            onValueChange={(value) => updateSettings({ fontSize: value[0] })}
            min={14}
            max={24}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Small (14px)</span>
            <span>Large (24px)</span>
          </div>
        </div>

        {/* App Font Family */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Type className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
            <div className="flex-1 space-y-3">
              <div>
                <Label className="font-medium text-sm sm:text-base">App Font Style</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Font for navigation and UI elements</p>
              </div>
              <Select
                value={settings.fontFamily}
                onValueChange={(value: "serif" | "sans-serif" | "monospace") =>
                  updateSettings({ fontFamily: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans-serif" className="font-sans">Sans Serif (Modern)</SelectItem>
                  <SelectItem value="serif" className="font-serif">Serif (Traditional)</SelectItem>
                  <SelectItem value="monospace" className="font-mono">Monospace (Code)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Reader Font Family */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Type className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
            <div className="flex-1 space-y-3">
              <div>
                <Label className="font-medium text-sm sm:text-base">Bible Reading Font</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Font for scripture text</p>
              </div>
              <Select
                value={settings.readerFontFamily}
                onValueChange={(value: "serif" | "sans-serif" | "monospace") =>
                  updateSettings({ readerFontFamily: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif" className="font-serif">Serif (Recommended)</SelectItem>
                  <SelectItem value="sans-serif" className="font-sans">Sans Serif</SelectItem>
                  <SelectItem value="monospace" className="font-mono">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Palette className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
            <div className="flex-1 space-y-3">
              <div>
                <Label className="font-medium text-sm sm:text-base">Color Scheme</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Choose your preferred color palette</p>
              </div>
              <Select
                value={settings.colorScheme}
                onValueChange={(value: "default" | "warm" | "cool" | "high-contrast") =>
                  updateSettings({ colorScheme: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (Blue & Gold)</SelectItem>
                  <SelectItem value="warm">Warm (Earth Tones)</SelectItem>
                  <SelectItem value="cool">Cool (Ocean Blues)</SelectItem>
                  <SelectItem value="high-contrast">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
