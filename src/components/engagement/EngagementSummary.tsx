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
      <CardContent glass className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[16px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 text-sm glass-body">
              <span className="glass-icon text-primary">
                <Flame className="h-4 w-4" />
              </span>
              Current streak
            </div>
            <p className="mt-2 text-3xl font-semibold glass-heading">{stats.currentStreak}</p>
            <p className="text-xs glass-body">days in a row</p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 text-sm glass-body">
              <span className="glass-icon text-secondary">
                <Star className="h-4 w-4" />
              </span>
              Total points
            </div>
            <p className="mt-2 text-3xl font-semibold glass-heading">{stats.points}</p>
            <p className="text-xs glass-body">earned through consistent reading</p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 text-sm glass-body">
              <span className="glass-icon text-accent">
                <Award className="h-4 w-4" />
              </span>
              Longest streak
            </div>
            <p className="mt-2 text-3xl font-semibold glass-heading">{stats.longestStreak}</p>
            <p className="text-xs glass-body">best run so far</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 glass-body">
              <Target className="h-4 w-4" />
              {nextMilestone ? (
                <span>
                  {nextMilestone.label} in {nextMilestone.remaining}{" "}
                  {nextMilestone.type === "streak"
                    ? nextMilestone.remaining === 1
                      ? "day"
                      : "days"
                    : nextMilestone.remaining === 1
                      ? "point"
                      : "points"}
                </span>
              ) : (
                <span>Keep going—new milestones are on the horizon!</span>
              )}
            </div>
            {nextMilestone && (
              <span className="text-xs glass-body">{nextMilestone.remaining} to go</span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium glass-body">Past week activity</p>
          <div className="flex items-center gap-3">
            {heatmap.map((day) => (
              <div key={day.iso} className="flex flex-col items-center gap-1 text-xs">
                <span className="glass-body">{day.label}</span>
                <div
                  className={`h-8 w-8 rounded-[10px] border transition-all ${
                    day.isActive
                      ? "border-primary/40 bg-primary/20 text-primary backdrop-blur-sm"
                      : "border-white/10 bg-white/[0.04] backdrop-blur-sm glass-body"
                  } flex items-center justify-center font-semibold`}
                  title={day.isActive ? `Read on ${day.display}` : `No activity on ${day.display}`}
                >
                  {day.isActive ? "★" : "–"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EngagementSummary;
