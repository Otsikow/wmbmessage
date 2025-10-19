import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AppSettings {
  fontSize: number; // 14-24px
  fontFamily: "serif" | "sans-serif" | "monospace";
  readerFontFamily: "serif" | "sans-serif" | "monospace";
  colorScheme: "default" | "warm" | "cool" | "high-contrast";
  theme: "light" | "dark";
}

const defaultSettings: AppSettings = {
  fontSize: 16,
  fontFamily: "sans-serif",
  readerFontFamily: "serif",
  colorScheme: "default",
  theme: "light",
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("app-settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("app-settings", JSON.stringify(settings));
    
    // Apply theme
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply font size to root
    document.documentElement.style.setProperty("--base-font-size", `${settings.fontSize}px`);
    
    // Apply color scheme
    document.documentElement.setAttribute("data-color-scheme", settings.colorScheme);
    
    // Apply app font family to body
    const fontClass = 
      settings.fontFamily === "serif" ? "font-serif" :
      settings.fontFamily === "monospace" ? "font-mono" : "font-sans";
    
    document.body.classList.remove("font-sans", "font-serif", "font-mono");
    document.body.classList.add(fontClass);
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
