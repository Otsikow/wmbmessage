const RATE_LIMIT_MESSAGE = "Too many attempts. Please wait a moment and try again.";
const NETWORK_ERROR_MESSAGE = "We couldn't reach the server. Please check your connection and try again.";
const SERVICE_UNAVAILABLE_MESSAGE = "The service is temporarily unavailable. Please try again later.";

const DEFAULT_MESSAGES = {
  "sign-in": "Unable to sign in. Please check your email and password and try again.",
  "sign-up": "We couldn't create your account. Please try again or use a different email.",
  "forgot-password": "We couldn't process your request. If the email is registered, you'll receive reset instructions shortly.",
  "reset-password": "We couldn't update your password. Please try again.",
  oauth: "We couldn't complete the sign in. Please try again.",
} as const;

export type AuthAction = keyof typeof DEFAULT_MESSAGES;

interface PossibleSupabaseError {
  status?: number;
  message?: string;
  name?: string;
}

const RATE_LIMIT_PATTERNS = [/rate limit/i, /too many/i];

const isSupabaseError = (error: unknown): error is PossibleSupabaseError => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as PossibleSupabaseError;
  return (
    typeof candidate.message === "string" ||
    typeof candidate.status === "number" ||
    typeof candidate.name === "string"
  );
};

const isNetworkError = (error: unknown) => {
  return (
    error instanceof TypeError &&
    typeof error.message === "string" &&
    /fetch|network/i.test(error.message)
  );
};

export const getSanitizedAuthErrorMessage = (
  error: unknown,
  action: AuthAction
): string => {
  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (isSupabaseError(error)) {
    if (typeof error.status === "number") {
      if (error.status === 429) {
        return RATE_LIMIT_MESSAGE;
      }

      if (error.status >= 500) {
        return SERVICE_UNAVAILABLE_MESSAGE;
      }
    }

    if (
      typeof error.message === "string" &&
      RATE_LIMIT_PATTERNS.some((pattern) => pattern.test(error.message))
    ) {
      return RATE_LIMIT_MESSAGE;
    }
  }

  return DEFAULT_MESSAGES[action];
};
