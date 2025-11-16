import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { ReadingPlanWidget } from "@/components/reading-plans/ReadingPlanWidget";
import PlanCard from "@/components/reading-plans/PlanCard";
import AchievementShowcase from "@/components/reading-plans/AchievementShowcase";
import ReminderPreferencesForm from "@/components/reading-plans/ReminderPreferencesForm";
import PointsSummaryCard from "@/components/reading-plans/PointsSummaryCard";
import LeaderboardCard from "@/components/reading-plans/LeaderboardCard";
import CustomPlanBuilder from "@/components/reading-plans/CustomPlanBuilder";
import { useReadingPlans } from "@/contexts/ReadingPlanContext";
import { PlanCategory } from "@/types/readingPlans";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const planTypes: (PlanCategory | "all")[] = [
  "all",
  "whole-bible",
  "new-testament",
  "old-testament",
  "wisdom",
  "chronological",
  "gospels",
  "topical",
  "custom",
];

const difficulties = ["all", "easy", "medium", "advanced"] as const;

const ReadingPlans = () => {
  const {
    plans,
    progressMap,
    startPlan,
    achievements,
    totalPoints,
    leaderboard,
    activeProgress,
    enterCatchUpMode,
    updateReminderPreferences,
    createCustomPlan,
  } = useReadingPlans();
  const [typeFilter, setTypeFilter] = useState<(typeof planTypes)[number]>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<(typeof difficulties)[number]>("all");

  const filteredPlans = useMemo(
    () =>
      plans.filter((plan) => {
        const matchesType = typeFilter === "all" || plan.planType === typeFilter;
        const matchesDifficulty =
          difficultyFilter === "all" || plan.difficulty === difficultyFilter;
        return matchesType && matchesDifficulty;
      }),
    [difficultyFilter, plans, typeFilter],
  );

  const handleCatchUp = () => {
    if (!activeProgress) {
      return;
    }
    enterCatchUpMode(activeProgress.planId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <main className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReadingPlanWidget />
          </div>
          <div className="space-y-4">
            <PointsSummaryCard totalPoints={totalPoints} streak={activeProgress?.streakCount ?? 0} />
            <Button variant="outline" className="w-full" onClick={handleCatchUp}>
              Activate Catch-Up Mode
            </Button>
          </div>
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Plan Library</TabsTrigger>
            <TabsTrigger value="gamification">Gamification</TabsTrigger>
            <TabsTrigger value="custom">Custom Builder</TabsTrigger>
          </TabsList>
          <TabsContent value="plans" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as (typeof planTypes)[number])}>
                <SelectTrigger>
                  <SelectValue placeholder="Plan type" />
                </SelectTrigger>
                <SelectContent>
                  {planTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All types" : type.replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={difficultyFilter}
                onValueChange={(value) => setDifficultyFilter(value as (typeof difficulties)[number])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty === "all" ? "All difficulty levels" : difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  progress={progressMap[plan.id]}
                  onStart={() => startPlan(plan.id)}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="gamification" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <AchievementShowcase badges={achievements} />
              <LeaderboardCard entries={leaderboard} />
            </div>
            <ReminderPreferencesForm
              preferences={activeProgress?.reminderPreferences ?? {
                enabled: false,
                preferredWindow: "morning",
                morningTime: "07:00",
                eveningTime: "20:00",
                customTime: "12:00",
                pushEnabled: true,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                lastReminderSent: null,
              }}
              onChange={(update) =>
                activeProgress && updateReminderPreferences(activeProgress.planId, update)
              }
            />
          </TabsContent>
          <TabsContent value="custom">
            <CustomPlanBuilder onCreate={createCustomPlan} />
          </TabsContent>
        </Tabs>

        <Separator />
        <LeaderboardCard entries={leaderboard} />
      </main>
    </div>
  );
};

export default ReadingPlans;
