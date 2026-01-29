import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PointsSummaryCardProps {
  totalPoints: number;
  streak: number;
}

const milestoneTargets = [100, 300, 600, 1000, 2000];

export const PointsSummaryCard = ({ totalPoints, streak }: PointsSummaryCardProps) => {
  const nextMilestone = milestoneTargets.find((target) => target > totalPoints) ?? totalPoints;
  const previousMilestone = milestoneTargets
    .filter((target) => target <= totalPoints)
    .pop() ?? 0;
  const percent = Math.round(
    ((totalPoints - previousMilestone) / Math.max(1, nextMilestone - previousMilestone)) * 100,
  );

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent" aria-hidden />
      <CardHeader className="relative gap-2 px-4 py-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Sparkles className="h-4 w-4 text-primary sm:h-5 sm:w-5" /> Spiritual Growth Score
        </CardTitle>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Earn +10 XP per day, +30 for streaks, +100 for each plan completion.
        </p>
      </CardHeader>
      <CardContent className="relative space-y-2 px-4 pb-4 sm:space-y-3 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-2xl font-bold sm:text-3xl">{totalPoints.toLocaleString()} XP</p>
          <p className="text-[11px] uppercase text-muted-foreground sm:text-xs">
            Streak {streak} days
          </p>
        </div>
        <div className="text-[11px] font-medium text-muted-foreground sm:text-xs">
          Next unlock at {nextMilestone} XP
        </div>
        <Progress value={percent} className="h-1.5 sm:h-2" />
      </CardContent>
    </Card>
  );
};

export default PointsSummaryCard;
