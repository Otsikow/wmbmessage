import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setRole('user');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        const resolvedRole = (data?.role as 'admin' | 'moderator' | 'user' | undefined) ?? 'user';
        setRole(resolvedRole);
        setIsAdmin(resolvedRole === 'admin');
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  return { isAdmin, role, loading };
};
