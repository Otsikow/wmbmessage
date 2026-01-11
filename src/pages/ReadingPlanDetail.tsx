import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReminderPreferencesForm from "@/components/reading-plans/ReminderPreferencesForm";
import AiReflectionCard from "@/components/reading-plans/AiReflectionCard";
import { useReadingPlans } from "@/contexts/ReadingPlanContext";
import { getReaderLinkForRange } from "@/lib/scripture";
import { ReminderPreferences } from "@/types/readingPlans";
import { format } from "date-fns";
import { Flame, BookOpen, CheckCircle, DownloadCloud } from "lucide-react";

const ReadingPlanDetail = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const {
    plans,
    progressMap,
    getPlanDays,
    startPlan,
    markDayComplete,
    enterCatchUpMode,
    updateReminderPreferences,
    preloadNextDay,
  } = useReadingPlans();

  const plan = useMemo(() => plans.find((entry) => entry.id === planId), [planId, plans]);
  const planDays = useMemo(() => (plan ? getPlanDays(plan.id) : []), [getPlanDays, plan]);
  const progress = plan ? progressMap[plan.id] : undefined;

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton />
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
          <p className="text-lg font-semibold">Plan not found</p>
          <Button onClick={() => navigate("/plans")}>Browse plans</Button>
        </div>
      </div>
    );
  }

  const percent = Math.round(
    ((progress?.completedDays.length ?? 0) / Math.max(1, plan.durationDays)) * 100,
  );
  const currentDayNumber = progress?.currentDay ?? 1;
  const currentDay = planDays.find((day) => day.dayNumber === currentDayNumber) ?? planDays[0];
  const nextDayNumber = Math.min(plan.durationDays, currentDayNumber + 1);

  const handleComplete = (dayNumber: number) => {
    markDayComplete(plan.id, dayNumber);
  };

  const handleReminderChange = (update: Partial<ReminderPreferences>) => {
    updateReminderPreferences(plan.id, update);
  };

  const backlog = progress?.catchUpQueue ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <main className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
        <Card className="relative overflow-hidden">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Reading Plan</p>
                <CardTitle className="text-3xl">{plan.title}</CardTitle>
              </div>
              <Badge style={{ background: plan.themeColor }} className="text-white">
                {plan.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-primary" />
                {progress?.streakCount ?? 0} day streak
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> {plan.durationDays} day journey
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> {percent}% complete
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => startPlan(plan.id)} className="flex-1">
              Resume Plan
            </Button>
            <Button
              variant="secondary"
              onClick={() => preloadNextDay(plan.id, nextDayNumber)}
              className="flex-1"
            >
              <DownloadCloud className="mr-2 h-4 w-4" /> Preload Day {nextDayNumber}
            </Button>
            <Button variant="outline" onClick={() => enterCatchUpMode(plan.id)} className="flex-1">
              Catch-Up ({backlog.length})
            </Button>
          </CardContent>
        </Card>

        {currentDay && (
          <div className="grid gap-6 lg:grid-cols-2">
            <AiReflectionCard
              summary={currentDay.summary}
              reflectionQuestion={currentDay.reflectionQuestion}
              scriptures={currentDay.scriptures}
            />
            <ReminderPreferencesForm
              preferences={progress?.reminderPreferences ?? {
                enabled: false,
                preferredWindow: "morning",
                morningTime: "07:00",
                eveningTime: "20:00",
                customTime: "12:00",
                pushEnabled: true,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                lastReminderSent: null,
              }}
              onChange={handleReminderChange}
            />
          </div>
        )}

        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">Daily schedule</TabsTrigger>
            <TabsTrigger value="catchup">Catch-Up</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule">
            <ScrollArea className="h-[420px] rounded-xl border border-border/60">
              <div className="divide-y divide-border/60">
                {planDays.map((day) => {
                  const completed = progress?.completedDays.includes(day.dayNumber);
                  return (
                    <div
                      key={day.id}
                      className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          Day {day.dayNumber} · {day.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {day.scriptures
                            .map(
                              (range) =>
                                `${range.book} ${range.chapterStart}${
                                  range.chapterEnd !== range.chapterStart
                                    ? `-${range.chapterEnd}`
                                    : ""
                                }`,
                            )
                            .join(", ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              day.scriptures[0]
                                ? getReaderLinkForRange(day.scriptures[0])
                                : `/plans/${plan.id}/day/${day.dayNumber}`,
                            )
                          }
                        >
                          Open Reader
                        </Button>
                        <Button
                          variant={completed ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleComplete(day.dayNumber)}
                        >
                          {completed ? "Completed" : "Mark complete"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="catchup">
            <Card>
              <CardHeader>
                <CardTitle>Catch-Up Queue</CardTitle>
                <p className="text-sm text-muted-foreground">
                  We surface uncompleted days so you can stay on pace.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {backlog.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No backlog! You're fully caught up.
                  </p>
                ) : (
                  backlog.map((dayNumber) => (
                    <div
                      key={dayNumber}
                      className="flex items-center justify-between rounded-xl border border-border/60 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">Day {dayNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          Scheduled for {format(new Date(), "PP")}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleComplete(dayNumber)}>
                        Complete now
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Plan Notes</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Use the reader to jot highlights per day—synced to this plan.
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Notes, highlights, and bookmarks added in the reading experience automatically connect here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ReadingPlanDetail;
