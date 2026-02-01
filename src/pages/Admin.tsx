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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { isAdmin, role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bibleVerses: 0,
    sermons: 0,
    crossRefs: 0,
    events: 0,
    prayerRequests: 0,
    testimonies: 0,
    messageChurches: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
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
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles" },
          () => {
            fetchData();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "user_roles" },
          () => {
            fetchData();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bible_verses" },
          () => {
            fetchStats();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sermons" },
          () => {
            fetchStats();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "cross_references" },
          () => {
            fetchStats();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "events" },
          () => {
            fetchStats();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "prayer_requests" },
          () => {
            fetchStats();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "testimonies" },
          () => {
            fetchStats();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "message_churches" },
          () => {
            fetchStats();
          },
        )
        .subscribe();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, isAdmin, roleLoading, navigate]);

  const fetchData = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setProfiles(profilesRes.data || []);
      setUserRoles(rolesRes.data || []);
      setErrorMessage(null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load admin data. Please check Supabase.");
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
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load statistics.");
    }
  };

  const getUserRole = (userId: string) =>
    userRoles.find((r) => r.user_id === userId)?.role || "user";

  const roleSummary = profiles.reduce(
    (acc, profile) => {
      const role = getUserRole(profile.id);
      acc.total += 1;
      acc.byRole[role] = (acc.byRole[role] || 0) + 1;
      return acc;
    },
    { total: 0, byRole: {} as Record<string, number> },
  );

  const now = Date.now();
  const newUsersLastDay = profiles.filter(
    (profile) => now - new Date(profile.created_at).getTime() <= 86400000,
  ).length;
  const newUsersLastWeek = profiles.filter(
    (profile) => now - new Date(profile.created_at).getTime() <= 604800000,
  ).length;
  const latestUser = profiles[0];

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton />
        <div className="flex justify-center items-center min-h-[60vh]">
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
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live updates
            </span>
            <span>Refreshes every {Math.floor(refreshIntervalMs / 1000)} seconds.</span>
            {lastUpdated && <span>Last sync {lastUpdated.toLocaleString()}.</span>}
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="relative z-20 -mx-4 px-4 overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex h-auto min-w-max gap-1 p-1 bg-muted rounded-lg">
              <TabsTrigger value="overview" className="px-3 py-2 text-xs whitespace-nowrap">
                Overview
              </TabsTrigger>
              <TabsTrigger value="moderation" className="px-3 py-2 text-xs whitespace-nowrap">
                <Gavel className="h-3.5 w-3.5 mr-1.5" />
                Moderation
              </TabsTrigger>
              <TabsTrigger value="bible" className="px-3 py-2 text-xs whitespace-nowrap">
                <Book className="h-3.5 w-3.5 mr-1.5" />
                Bible
              </TabsTrigger>
              <TabsTrigger value="sermons" className="px-3 py-2 text-xs whitespace-nowrap">
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Sermons
              </TabsTrigger>
              <TabsTrigger value="crossrefs" className="px-3 py-2 text-xs whitespace-nowrap">
                <Link2 className="h-3.5 w-3.5 mr-1.5" />
                Cross Refs
              </TabsTrigger>
              <TabsTrigger value="plans" className="px-3 py-2 text-xs whitespace-nowrap">
                <Book className="h-3.5 w-3.5 mr-1.5" />
                Plans
              </TabsTrigger>
              <TabsTrigger value="users" className="px-3 py-2 text-xs whitespace-nowrap">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Users
              </TabsTrigger>
              <TabsTrigger value="events" className="px-3 py-2 text-xs whitespace-nowrap">
                <CalendarCheck className="h-3.5 w-3.5 mr-1.5" />
                Events
              </TabsTrigger>
              <TabsTrigger value="message-churches" className="px-3 py-2 text-xs whitespace-nowrap">
                <Building2 className="h-3.5 w-3.5 mr-1.5" />
                Churches
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">Community Overview</h2>
                  <p className="text-sm text-muted-foreground">
                    Live community engagement metrics.
                  </p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/60 bg-card/80 shadow-sm">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Events Created
                    </CardTitle>
                    <CardDescription>
                      Community gatherings posted in the last year
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      {stats.events}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/80 shadow-sm">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Prayer Requests
                    </CardTitle>
                    <CardDescription>
                      Active prayer needs from the community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      {stats.prayerRequests}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/80 shadow-sm">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Testimonies
                    </CardTitle>
                    <CardDescription>
                      Stories of faith shared by users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      {stats.testimonies}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/80 shadow-sm">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Churches in Directory
                    </CardTitle>
                    <CardDescription>
                      Verified Message churches worldwide
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      {stats.messageChurches}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">Key metrics</h2>
                  <p className="text-sm text-muted-foreground">
                    Real-time totals across core collections.
                  </p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border/60 bg-card/80 shadow-sm">
                  <CardHeader className="space-y-1">
                  <CardTitle className="text-sm font-medium">Bible Verses</CardTitle>
                  <CardDescription>Total verses stored</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold tracking-tight">
                    {stats.bibleVerses}
                  </div>
                </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/80 shadow-sm">
                  <CardHeader className="space-y-1">
                  <CardTitle className="text-sm font-medium">Sermons</CardTitle>
                  <CardDescription>William Branham sermons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold tracking-tight">
                    {stats.sermons}
                  </div>
                </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/80 shadow-sm">
                  <CardHeader className="space-y-1">
                  <CardTitle className="text-sm font-medium">Cross References</CardTitle>
                  <CardDescription>Connections built</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold tracking-tight">
                    {stats.crossRefs}
                  </div>
                </CardContent>
                </Card>
                <Card className="border-border/60 bg-card/80 shadow-sm">
                  <CardHeader className="space-y-1">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <CardDescription>Registered accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold tracking-tight">
                    {roleSummary.total}
                  </div>
                </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="moderation">
            <AdminModerationDashboard role={role} />
          </TabsContent>

          <TabsContent value="bible"><BibleManager /></TabsContent>
          <TabsContent value="sermons"><SermonManager /></TabsContent>
          <TabsContent value="crossrefs"><CrossRefManager /></TabsContent>
          <TabsContent value="plans"><ReadingPlanAdmin /></TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>All registered accounts and assigned roles.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">
                            {profile.full_name || "—"}
                          </TableCell>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getUserRole(profile.id)}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(profile.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {profiles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No users found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
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
