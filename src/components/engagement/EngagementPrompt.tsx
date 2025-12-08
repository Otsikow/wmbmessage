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
    <Alert className="glass-card border-primary/20 bg-white/[0.06] backdrop-blur-[16px] saturate-[180%] rounded-[20px]">
      <span className="glass-icon text-primary">
        {hasActivityToday ? (
          <Sparkles className="h-5 w-5" />
        ) : (
          <BellRing className="h-5 w-5" />
        )}
      </span>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <AlertTitle className="flex items-center gap-2 text-base font-semibold glass-heading">
            {hasActivityToday ? "Wonderful consistency!" : "Your reading journey awaits"}
          </AlertTitle>
          <AlertDescription className="text-sm glass-body">
            {subtitle}
          </AlertDescription>
        </div>
        <Button 
          asChild 
          variant={hasActivityToday ? "outline" : "default"} 
          size="sm" 
          className={`mt-2 sm:mt-0 ${hasActivityToday ? 'border-white/20 hover:border-white/30 hover:bg-white/10' : ''}`}
        >
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
