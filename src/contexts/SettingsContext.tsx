import { createContext, useState, useEffect, useContext, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./AuthContext";
import {
  DEFAULT_SCRIPTURE_FONT,
  SCRIPTURE_FONT_STACKS,
  type ScriptureFontId,
  normalizeScriptureFont,
} from "@/hooks/useScriptureFontOptions";

export interface AppSettings {
  fontSize: number; // 14-24px
  fontFamily: "serif" | "sans-serif" | "monospace";
  readerFontFamily: ScriptureFontId;
  colorScheme: "default" | "warm" | "cool" | "high-contrast";
  theme: "light" | "dark";
  bibleVersion: string;
}

const defaultSettings: AppSettings = {
  fontSize: 16,
  fontFamily: "sans-serif",
  readerFontFamily: DEFAULT_SCRIPTURE_FONT,
  colorScheme: "default",
  theme: "light",
  bibleVersion: "KJV",
};

const FONT_STACKS: Record<AppSettings["fontFamily"], string> = {
  "sans-serif": "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  serif: "'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif",
  monospace: "'JetBrains Mono', 'Fira Code', 'Fira Mono', 'Courier New', monospace",
};

const clampFontSize = (value: number): number => {
  if (!Number.isFinite(value)) {
    return defaultSettings.fontSize;
  }

  return Math.min(24, Math.max(14, Math.round(value)));
};

const sanitizeSettings = (settings: AppSettings): AppSettings => ({
  ...settings,
  fontSize: clampFontSize(settings.fontSize),
  readerFontFamily: normalizeScriptureFont(settings.readerFontFamily),
});

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  loading: boolean;
}

interface SupabaseSettingsRow {
  font_size: number | string | null;
  font_family: string | null;
  reader_font_family: string | null;
  color_scheme: string | null;
  theme: string | null;
  bible_version: string | null;
}

type SupabaseSettingsUpsert = {
  user_id: string;
  font_size: string;
  font_family: string;
  reader_font_family: string;
  color_scheme: string;
  theme: string;
  bible_version: string;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const authContext = useContext(AuthContext);
  const user = authContext?.user ?? null;
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") {
      return sanitizeSettings(defaultSettings);
    }

    try {
      const saved = window.localStorage.getItem("app-settings");
      return saved
        ? sanitizeSettings({ ...defaultSettings, ...JSON.parse(saved) })
        : sanitizeSettings(defaultSettings);
    } catch (error) {
      console.error("Failed to load saved settings from localStorage", error);
      return sanitizeSettings(defaultSettings);
    }
  });
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

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
          const rawData = data as SupabaseSettingsRow;
          const loadedSettings: AppSettings = sanitizeSettings({
            fontSize:
              typeof rawData.font_size === "number"
                ? rawData.font_size
                : parseInt(String(rawData.font_size || "16"), 10) || 16,
            fontFamily: (rawData.font_family || "sans-serif") as AppSettings['fontFamily'],
            readerFontFamily: normalizeScriptureFont(rawData.reader_font_family),
            colorScheme: (rawData.color_scheme || "default") as AppSettings['colorScheme'],
            theme: (rawData.theme || "light") as AppSettings['theme'],
            bibleVersion: rawData.bible_version || "KJV",
          });
          setSettings(loadedSettings);
          if (typeof window !== "undefined") {
            try {
              window.localStorage.setItem("app-settings", JSON.stringify(loadedSettings));
            } catch (storageError) {
              console.error("Failed to persist loaded settings to localStorage", storageError);
            }
          }
        } else {
          const savedSettings = (() => {
            if (typeof window === "undefined") {
              return settingsRef.current;
            }

            try {
              const saved = window.localStorage.getItem("app-settings");
              return saved
                ? sanitizeSettings({ ...defaultSettings, ...JSON.parse(saved) })
                : settingsRef.current;
            } catch (storageError) {
              console.error("Failed to read cached settings while creating user settings", storageError);
              return settingsRef.current;
            }
          })();

          const supabasePayload: SupabaseSettingsUpsert = {
            user_id: user.id,
            font_size: String(clampFontSize(savedSettings.fontSize)),
            font_family: savedSettings.fontFamily,
            reader_font_family: savedSettings.readerFontFamily,
            color_scheme: savedSettings.colorScheme,
            theme: savedSettings.theme,
            bible_version: savedSettings.bibleVersion,
          };

          const { error: upsertError } = await supabase
            .from("user_settings")
            .upsert([supabasePayload]);

          if (upsertError) {
            console.error("Error creating default user settings:", upsertError);
          } else {
            setSettings(savedSettings);
          }
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
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("app-settings", JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to persist settings to localStorage", error);
      }
    }

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      const body = document.body;

      // Apply theme
      if (settings.theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Apply font sizing
      root.style.setProperty("--base-font-size", `${settings.fontSize}px`);
      root.style.fontSize = `${settings.fontSize}px`;

      // Apply color scheme tokens
      if (settings.colorScheme === "default") {
        root.removeAttribute("data-color-scheme");
      } else {
        root.setAttribute("data-color-scheme", settings.colorScheme);
      }

      const appFontStack = FONT_STACKS[settings.fontFamily];
      const readerFontStack = SCRIPTURE_FONT_STACKS[settings.readerFontFamily];

      root.style.setProperty("--app-font-family", appFontStack);
      root.style.setProperty("--reader-font-family", readerFontStack);
      root.style.setProperty("--scripture-font-family", readerFontStack);
      body.style.fontFamily = appFontStack;

      // Apply app font family utility classes for Tailwind components
      const fontClass =
        settings.fontFamily === "serif" ? "font-serif" :
        settings.fontFamily === "monospace" ? "font-mono" : "font-sans";

      body.classList.remove("font-sans", "font-serif", "font-mono");
      body.classList.add(fontClass);
    }
  }, [settings]);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = sanitizeSettings({ ...settings, ...updates });
    setSettings(newSettings);

    // Save to Supabase if user is logged in
    if (user) {
      try {
        const supabasePayload: SupabaseSettingsUpsert = {
          user_id: user.id,
          font_size: String(newSettings.fontSize),
          font_family: newSettings.fontFamily,
          reader_font_family: newSettings.readerFontFamily,
          color_scheme: newSettings.colorScheme,
          theme: newSettings.theme,
          bible_version: newSettings.bibleVersion,
        };

        const { error } = await supabase
          .from("user_settings")
          .upsert([supabasePayload]);

        if (error) {
          console.error("Error saving settings:", error);
        }
      } catch (error) {
        console.error("Error updating settings in Supabase:", error);
      }
    }
  };

  const resetSettings = async () => {
    setSettings(sanitizeSettings(defaultSettings));

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
