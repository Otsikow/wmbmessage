import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

import {
  Loader2,
  Users,
  Shield,
  Book,
  MessageSquare,
  Link2,
  Building2,
  Gavel,
  CalendarCheck,
} from "lucide-react";

import Header from "@/components/Header";
import BibleManager from "@/components/BibleManager";
import SermonManager from "@/components/SermonManager";
import CrossRefManager from "@/components/CrossRefManager";
import ReadingPlanAdmin from "@/components/ReadingPlanAdmin";
import MessageChurchAdmin from "@/components/message-churches/MessageChurchAdmin";
import AdminModerationDashboard from "@/components/moderation/AdminModerationDashboard";
import AdminEventsDashboard from "@/components/admin/AdminEventsDashboard";
import UserManager, {
  AdminProfile,
  AdminUserRole,
} from "@/components/UserManager";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function Admin() {
  const { user } = useAuth();
  const { isAdmin, role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [userRoles, setUserRoles] = useState<AdminUserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [stats, setStats] = useState({
    bibleVerses: 0,
    sermons: 0,
    crossRefs: 0,
    events: 0,
    prayerRequests: 0,
    testimonies: 0,
    messageChurches: 0,
  });

  const refreshIntervalMs = 30000;

  useEffect(() => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }

    if (!roleLoading && !isAdmin) {
      navigate("/");
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    if (isAdmin) {
      fetchData();
      fetchStats();

      intervalId = setInterval(() => {
        fetchData();
        fetchStats();
      }, refreshIntervalMs);

      channel = supabase
        .channel("admin-dashboard-realtime")
        .on("postgres_changes", { event: "*", schema: "public" }, () => {
          fetchData();
          fetchStats();
        })
        .subscribe();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, isAdmin, roleLoading, navigate]);

  const fetchData = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setProfiles((profilesRes.data || []) as AdminProfile[]);
      setUserRoles((rolesRes.data || []) as AdminUserRole[]);
      setErrorMessage(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const [
        verses,
        sermons,
        crossRefs,
        events,
        prayerRequests,
        testimonies,
        messageChurches,
      ] = await Promise.all([
        supabase.from("bible_verses").select("*", { count: "exact", head: true }),
        supabase.from("sermons").select("*", { count: "exact", head: true }),
        supabase
          .from("cross_references")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("status", "APPROVED")
          .gte("created_at", oneYearAgo.toISOString()),
        supabase
          .from("prayer_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved"),
        supabase
          .from("testimonies")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved"),
        supabase
          .from("message_churches")
          .select("*", { count: "exact", head: true })
          .eq("verified", true),
      ]);

      setStats({
        bibleVerses: verses.count || 0,
        sermons: sermons.count || 0,
        crossRefs: crossRefs.count || 0,
        events: events.count || 0,
        prayerRequests: prayerRequests.count || 0,
        testimonies: testimonies.count || 0,
        messageChurches: messageChurches.count || 0,
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to load statistics.");
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <main className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage users, content, moderation, and events
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last synced: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="moderation">
              <Gavel className="mr-1 h-4 w-4" /> Moderation
            </TabsTrigger>
            <TabsTrigger value="bible">
              <Book className="mr-1 h-4 w-4" /> Bible
            </TabsTrigger>
            <TabsTrigger value="sermons">
              <MessageSquare className="mr-1 h-4 w-4" /> Sermons
            </TabsTrigger>
            <TabsTrigger value="crossrefs">
              <Link2 className="mr-1 h-4 w-4" /> Cross Refs
            </TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-1 h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="events">
              <CalendarCheck className="mr-1 h-4 w-4" /> Events
            </TabsTrigger>
            <TabsTrigger value="message-churches">
              <Building2 className="mr-1 h-4 w-4" /> Churches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Events", stats.events],
                ["Prayer Requests", stats.prayerRequests],
                ["Testimonies", stats.testimonies],
                ["Churches", stats.messageChurches],
              ].map(([label, value]) => (
                <Card key={label}>
                  <CardHeader>
                    <CardTitle className="text-sm">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="moderation">
            <AdminModerationDashboard role={role} />
          </TabsContent>

          <TabsContent value="bible">
            <BibleManager />
          </TabsContent>

          <TabsContent value="sermons">
            <SermonManager />
          </TabsContent>

          <TabsContent value="crossrefs">
            <CrossRefManager />
          </TabsContent>

          <TabsContent value="plans">
            <ReadingPlanAdmin />
          </TabsContent>

          <TabsContent value="users">
            <UserManager profiles={profiles} userRoles={userRoles} />
          </TabsContent>

          <TabsContent value="events">
            <AdminEventsDashboard />
          </TabsContent>

          <TabsContent value="message-churches">
            <MessageChurchAdmin />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
