const RETURN_PATH_KEY = "mg:auth:return-path";

/**
 * Only allow same-origin relative paths (no protocol-relative "//evil.com").
 */
export const sanitizeReturnPath = (value: string | null | undefined): string | null => {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/auth/")) return null;
  return value;
};

export const storeReturnPath = (value: string) => {
  const safe = sanitizeReturnPath(value);
  try {
    if (safe) {
      sessionStorage.setItem(RETURN_PATH_KEY, safe);
    } else {
      sessionStorage.removeItem(RETURN_PATH_KEY);
    }
  } catch {
    // sessionStorage may be unavailable (private mode) - ignore.
  }
};

export const consumeReturnPath = (): string => {
  try {
    const stored = sanitizeReturnPath(sessionStorage.getItem(RETURN_PATH_KEY));
    sessionStorage.removeItem(RETURN_PATH_KEY);
    return stored ?? "/";
  } catch {
    return "/";
  }
};

/** Stable, same-origin OAuth callback URL. Never hard-code a host. */
export const getOAuthCallbackUrl = () => `${window.location.origin}/auth/callback`;
