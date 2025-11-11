import { Link } from "react-router-dom";
import { BellRing, BookOpenCheck, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useEngagement } from "@/contexts/EngagementContext";

export function EngagementPrompt() {
  const { hasActivityToday, stats, nextMilestone } = useEngagement();

  const subtitle = hasActivityToday
    ? `You're ${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"} strong. Keep the habit going!`
    : nextMilestone
      ? `Only ${nextMilestone.remaining} more ${
          nextMilestone.type === "streak"
            ? nextMilestone.remaining === 1
              ? "day"
              : "days"
            : nextMilestone.remaining === 1
              ? "point"
              : "points"
        } until your next achievement.`
      : "A few minutes of reading today will keep your streak alive.";

  return (
    <Alert className="border-primary/30 bg-primary/5">
      {hasActivityToday ? (
        <Sparkles className="h-5 w-5 text-primary" />
      ) : (
        <BellRing className="h-5 w-5 text-primary" />
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <AlertTitle className="flex items-center gap-2 text-base font-semibold">
            {hasActivityToday ? "Wonderful consistency!" : "Your reading journey awaits"}
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            {subtitle}
          </AlertDescription>
        </div>
        <Button asChild variant={hasActivityToday ? "outline" : "default"} size="sm" className="mt-2 sm:mt-0">
          <Link to="/reader">
            <BookOpenCheck className="mr-2 h-4 w-4" />
            {hasActivityToday ? "Review today's progress" : "Start today's reading"}
          </Link>
        </Button>
      </div>
    </Alert>
  );
}

export default EngagementPrompt;
