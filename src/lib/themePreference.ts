export type AppTheme = "light" | "dark";

export function resolveThemePreference(
  savedSettingsTheme: unknown,
  legacyTheme: unknown,
  systemDark: boolean,
): AppTheme {
  if (savedSettingsTheme === "light" || savedSettingsTheme === "dark") return savedSettingsTheme;
  if (legacyTheme === "light" || legacyTheme === "dark") return legacyTheme;
  if (legacyTheme === "system") return systemDark ? "dark" : "light";
  // Preserve the shared settings contract's explicit default.
  return "light";
}