import { subDays, format, formatISO } from "date-fns";
import { Flame, Star, Award, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useEngagement,
  type EngagementMilestone,
  type EngagementStats,
} from "@/contexts/EngagementContext";

const getHeatmap = (activeDates: string[]) => {
  const today = new Date();
  const activeSet = new Set(activeDates);

  return Array.from({ length: 7 }, (_, index) => {
    const date = subDays(today, 6 - index);
    const iso = formatISO(date, { representation: "date" });

    return {
      label: format(date, "EEE"),
      iso,
      isActive: activeSet.has(iso),
      display: format(date, "MMM d"),
    };
  });
};

const getProgressValue = (
  stats: EngagementStats,
  milestone: EngagementMilestone | null,
) => {
  if (!milestone) return 0;
  const current = milestone.type === "streak" ? stats.currentStreak : stats.points;
  const target = current + milestone.remaining;
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
};

export function EngagementSummary() {
  const { stats, encouragement, nextMilestone, hasActivityToday } = useEngagement();
  const heatmap = getHeatmap(stats.weeklyActivity);
  const progress = getProgressValue(stats, nextMilestone);

  return (
    <Card variant="glass" hoverable={false}>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle glass className="flex items-center gap-2 text-lg sm:text-xl">
            <span className="glass-icon text-primary">
              <Flame className="h-5 w-5" />
            </span>
            Daily Momentum
          </CardTitle>
          <p className="text-sm glass-body">
            {encouragement}
          </p>
        </div>
        <Badge 
          variant={hasActivityToday ? "default" : "secondary"} 
          className={`font-semibold ${hasActivityToday ? 'shadow-[0_0_12px_rgba(var(--primary),0.4)]' : 'bg-white/10 border-white/20'}`}
        >
          {hasActivityToday ? "On track" : "Let's read together"}
        </Badge>
      </CardHeader>
      <CardContent glass className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-[12px] sm:rounded-[16px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-2 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm glass-body">
              <span className="glass-icon text-primary">
                <Flame className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
              <span className="hidden xs:inline">Current</span> Streak
            </div>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold glass-heading">{stats.currentStreak}</p>
            <p className="text-[10px] sm:text-xs glass-body">days in a row</p>
          </div>
          <div className="rounded-[12px] sm:rounded-[16px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-2 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm glass-body">
              <span className="glass-icon text-secondary">
                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
              Points
            </div>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold glass-heading">{stats.points}</p>
            <p className="text-[10px] sm:text-xs glass-body">total earned</p>
          </div>
          <div className="rounded-[12px] sm:rounded-[16px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-2 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm glass-body">
              <span className="glass-icon text-accent">
                <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
              Best
            </div>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold glass-heading">{stats.longestStreak}</p>
            <p className="text-[10px] sm:text-xs glass-body">longest run</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 glass-body">
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              {nextMilestone ? (
                <span className="truncate">
                  {nextMilestone.label} in {nextMilestone.remaining}{" "}
                  {nextMilestone.type === "streak"
                    ? nextMilestone.remaining === 1
                      ? "day"
                      : "days"
                    : nextMilestone.remaining === 1
                      ? "pt"
                      : "pts"}
                </span>
              ) : (
                <span>Keep going!</span>
              )}
            </div>
            {nextMilestone && (
              <span className="text-[10px] sm:text-xs glass-body flex-shrink-0">{nextMilestone.remaining} to go</span>
            )}
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2" />
        </div>

        <div>
          <p className="mb-2 text-xs sm:text-sm font-medium glass-body">Past week activity</p>
          <div className="overflow-x-auto pb-1">
            <div className="grid min-w-[14rem] grid-cols-7 gap-1 sm:gap-3">
              {heatmap.map((day) => (
                <div key={day.iso} className="flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs">
                  <span className="glass-body">{day.label.slice(0, 2)}</span>
                  <div
                    className={`h-6 w-6 sm:h-8 sm:w-8 rounded-[8px] sm:rounded-[10px] border transition-all ${
                      day.isActive
                        ? "border-primary/40 bg-primary/20 text-primary backdrop-blur-sm"
                        : "border-white/10 bg-white/[0.04] backdrop-blur-sm glass-body"
                    } flex items-center justify-center font-semibold text-xs sm:text-sm`}
                    title={day.isActive ? `Read on ${day.display}` : `No activity on ${day.display}`}
                  >
                    {day.isActive ? "★" : "–"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EngagementSummary;
