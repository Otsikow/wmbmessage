import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/integrations/supabase/config";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Skip Supabase auth initialization when the app isn't configured.
      // This prevents the provider from throwing hard-to-diagnose errors
      // (e.g. "Cannot read properties of null (reading 'useState')") when
      // the auth client isn't available.
      console.warn("Supabase auth is not configured; skipping session initialization.");
      setLoading(false);
      return;
    }

    let mounted = true;

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
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

  const value = useMemo(
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
