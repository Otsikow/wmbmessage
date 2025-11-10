import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./AuthContext";

export interface AppSettings {
  fontSize: number; // 14-24px
  fontFamily: "serif" | "sans-serif" | "monospace";
  readerFontFamily: "serif" | "sans-serif" | "monospace";
  colorScheme: "default" | "warm" | "cool" | "high-contrast";
  theme: "light" | "dark";
  bibleVersion: string;
}

const defaultSettings: AppSettings = {
  fontSize: 16,
  fontFamily: "sans-serif",
  readerFontFamily: "serif",
  colorScheme: "default",
  theme: "light",
  bibleVersion: "KJV",
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  loading: boolean;
}

interface SupabaseSettingsRow {
  font_size: string | null;
  font_family: string | null;
  reader_font_family: string | null;
  color_scheme: string | null;
  theme: string | null;
  bible_version: string | null;
}

interface SupabaseSettingsUpsert extends SupabaseSettingsRow {
  user_id: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const authContext = useContext(AuthContext);
  const user = authContext?.user ?? null;
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("app-settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  // Load settings from Supabase when user logs in
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") { // PGRST116 = no rows found
          console.error("Error loading settings:", error);
          setLoading(false);
          return;
        }

        if (data) {
          const rawData = data as any;
          const loadedSettings: AppSettings = {
            fontSize: parseInt(String(rawData.font_size || "16")) || 16,
            fontFamily: (rawData.font_family || "sans-serif") as AppSettings['fontFamily'],
            readerFontFamily: (rawData.reader_font_family || "serif") as AppSettings['readerFontFamily'],
            colorScheme: (rawData.color_scheme || "default") as AppSettings['colorScheme'],
            theme: (rawData.theme || "light") as AppSettings['theme'],
            bibleVersion: rawData.bible_version || "KJV",
          };
          setSettings(loadedSettings);
          localStorage.setItem("app-settings", JSON.stringify(loadedSettings));
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, [user]);

  // Apply settings to DOM
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

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    // Save to Supabase if user is logged in
    if (user) {
      try {
        const supabasePayload: any = {
          user_id: user.id,
          font_size: newSettings.fontSize.toString(),
          font_family: newSettings.fontFamily,
          reader_font_family: newSettings.readerFontFamily,
          color_scheme: newSettings.colorScheme,
          theme: newSettings.theme,
          bible_version: newSettings.bibleVersion,
        };

        const { error } = await supabase
          .from("user_settings")
          .upsert(supabasePayload);

        if (error) {
          console.error("Error saving settings:", error);
        }
      } catch (error) {
        console.error("Error updating settings in Supabase:", error);
      }
    }
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);

    // Reset in Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from("user_settings")
          .delete()
          .eq("user_id", user.id);

        if (error) {
          console.error("Error resetting settings:", error);
        }
      } catch (error) {
        console.error("Error resetting settings in Supabase:", error);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    // Return a default context if provider is not available
    // This prevents the app from crashing if there's a provider initialization issue
    console.warn("useSettings called outside SettingsProvider, using defaults");
    return {
      settings: defaultSettings,
      updateSettings: () => {},
      resetSettings: () => {},
      loading: false,
    };
  }
  return context;
}
