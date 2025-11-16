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
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" /> Spiritual Growth Score
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Earn +10 XP per day, +30 for streaks, +100 for each plan completion.
        </p>
      </CardHeader>
      <CardContent className="relative space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-bold">{totalPoints.toLocaleString()} XP</p>
          <p className="text-xs uppercase text-muted-foreground">Streak {streak} days</p>
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          Next unlock at {nextMilestone} XP
        </div>
        <Progress value={percent} className="h-2" />
      </CardContent>
    </Card>
  );
};

export default PointsSummaryCard;
