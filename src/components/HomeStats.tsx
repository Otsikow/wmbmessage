import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck, Church, HandHeart, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardIcon, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const formatCount = (value: number | null) => {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
};

const refreshIntervalMs = 60000;

const HomeStats = () => {
  const [counts, setCounts] = useState({
    events: null as number | null,
    prayerRequests: null as number | null,
    testimonies: null as number | null,
    messageChurches: null as number | null,
  });

  const fetchStats = useCallback(async () => {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const [
        events,
        prayerRequests,
        testimonies,
        messageChurches,
      ] = await Promise.all([
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

      if (
        events.error ||
        prayerRequests.error ||
        testimonies.error ||
        messageChurches.error
      ) {
        throw new Error("Failed to load community stats.");
      }

      setCounts({
        events: events.count ?? 0,
        prayerRequests: prayerRequests.count ?? 0,
        testimonies: testimonies.count ?? 0,
        messageChurches: messageChurches.count ?? 0,
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    fetchStats();

    intervalId = setInterval(fetchStats, refreshIntervalMs);

    channel = supabase
      .channel("home-stats-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, fetchStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "prayer_requests" }, fetchStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "testimonies" }, fetchStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "message_churches" }, fetchStats)
      .subscribe();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  const stats = useMemo(
    () => [
      {
        label: "Events created",
        value: formatCount(counts.events),
        description: "Community gatherings posted in the last year.",
        icon: CalendarCheck,
        accent: "text-primary",
      },
      {
        label: "Prayer requests",
        value: formatCount(counts.prayerRequests),
        description: "Hearts lifting one another up each day.",
        icon: HandHeart,
        accent: "text-secondary",
      },
      {
        label: "Testimonies",
        value: formatCount(counts.testimonies),
        description: "Stories of hope and answered prayer shared.",
        icon: Sparkles,
        accent: "text-amber-300",
      },
      {
        label: "Churches in directory",
        value: formatCount(counts.messageChurches),
        description: "Growing list of Message churches worldwide.",
        icon: Church,
        accent: "text-sky-300",
      },
    ],
    [counts],
  );

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
      <div className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/70">Community impact</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gradient-blue-purple">
            Celebrating what God is doing through MessageGuide
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            From new events to answered prayers, these moments highlight the growing faith family
            connecting across the platform.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, description, icon: Icon, accent }) => (
            <Card
              key={label}
              variant="glass"
              hoverable
              className="group border-white/15 bg-white/[0.08] shadow-glass-subtle"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardIcon className={`${accent} bg-white/5 rounded-full p-2 shadow-glass-subtle`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </CardIcon>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {label}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardTitle glass className="text-3xl">
                  {value}
                </CardTitle>
                <CardDescription glass className="mt-1 text-xs sm:text-sm">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeStats;
