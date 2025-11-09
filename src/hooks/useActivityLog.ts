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
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LogActivityInput {
  action: ActivityAction;
  source_type: ActivitySourceType;
  source_id: string;
  metadata?: Record<string, unknown>;
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
      const { data, error } = await (supabase as any)
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      const typedData = (data ?? []) as ActivityLog[];
      setActivities(typedData);
    } catch (error) {
      console.error("Error fetching activity log:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const logActivity = async (input: LogActivityInput): Promise<ActivityLog | null> => {
    if (!user) return null;

    try {
      const { data, error } = await (supabase as any)
        .from("activity_logs")
        .insert([
          {
            user_id: user.id,
            action: input.action,
            source_type: input.source_type,
            source_id: input.source_id,
            metadata: input.metadata as any || {},
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add to local state without showing toast
      if (!data) {
        return null;
      }

      const activity = data as ActivityLog;
      setActivities((prev) => [activity, ...prev]);
      return activity;
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
