export function getFriendlyErrorMessage(
  error: unknown,
  fallbackMessage: string,
  context?: string
): string {
  if (import.meta.env.DEV) {
    if (context) {
      console.error(`[Supabase] ${context}:`, error);
    } else {
      console.error('[Supabase] Operation failed:', error);
    }
  }

  return fallbackMessage;
}
