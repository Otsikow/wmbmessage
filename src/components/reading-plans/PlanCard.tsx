import { Link } from "react-router-dom";
import { BookOpenCheck, Clock, Trophy } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BiblePlan, UserPlanProgress } from "@/types/readingPlans";

interface PlanCardProps {
  plan: BiblePlan;
  progress?: UserPlanProgress;
  onStart: () => void;
}

export const PlanCard = ({ plan, progress, onStart }: PlanCardProps) => {
  const completed = progress?.completedDays.length ?? 0;
  const percent = Math.round((completed / Math.max(1, plan.durationDays)) * 100);
  const active = Boolean(progress && (progress.completedDays.length > 0 || progress.currentDay > 1));

  return (
    <Card className="flex flex-col border-border/60">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{plan.title}</CardTitle>
          <Badge style={{ background: plan.themeColor ?? undefined }} className="text-white">
            {plan.difficulty}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {plan.durationDays} days
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpenCheck className="h-3.5 w-3.5" /> {plan.tags.join(", ")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <Progress value={percent} className="h-2" />
        {active && (
          <Badge variant="secondary" className="inline-flex w-fit items-center gap-1">
            <Trophy className="h-3 w-3" /> XP {progress?.points ?? 0}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="mt-auto flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/plans/${plan.id}`}>View Plan</Link>
        </Button>
        <Button onClick={onStart} className="flex-1">
          {active ? "Continue" : "Start Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
