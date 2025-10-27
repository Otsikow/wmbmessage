import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ActivityAction = "read" | "highlight" | "bookmark" | "note" | "search";
export type ActivitySourceType = "verse" | "chapter" | "sermon" | "note";

export interface ActivityLog {
  id: string;
  user_id: string;
  action: ActivityAction;
  source_type: ActivitySourceType;
  source_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface LogActivityInput {
  action: ActivityAction;
  source_type: ActivitySourceType;
  source_id: string;
  metadata?: Record<string, any>;
}

export function useActivityLog() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchActivities = async (limit: number = 50) => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activity log:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const logActivity = async (input: LogActivityInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("user_activity_log")
        .insert([
          {
            user_id: user.id,
            action: input.action,
            source_type: input.source_type,
            source_id: input.source_id,
            metadata: input.metadata || {},
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add to local state without showing toast
      setActivities([data, ...activities]);
      return data;
    } catch (error) {
      console.error("Error logging activity:", error);
      return null;
    }
  };

  const getRecentActivity = (limit: number = 10) => {
    return activities.slice(0, limit);
  };

  return {
    activities,
    loading,
    logActivity,
    getRecentActivity,
    refetch: fetchActivities,
  };
}
