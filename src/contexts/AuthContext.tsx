import * as React from "react";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/integrations/supabase/config";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      // Skip Supabase auth initialization when the app isn't configured.
      // This prevents the provider from throwing hard-to-diagnose errors
      // (e.g. "Cannot read properties of null (reading 'useState')") when
      // the auth client isn't available.
      console.warn("Supabase auth is not configured; skipping session initialization.");
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    if ((supabase as any).__disabled) {
      console.warn("Supabase client is disabled; skipping auth session checks.");
      setLoading(false);
      return;
    }

    let mounted = true;

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;

        if (error) {
          console.error("Failed to initialize auth session", error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to initialize auth session", error);
        if (mounted) {
          setLoading(false);
        }
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = React.useMemo(
    () => ({ user, session, loading }),
    [user, session, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
