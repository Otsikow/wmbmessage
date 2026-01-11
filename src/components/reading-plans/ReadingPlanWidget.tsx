import { Link } from "react-router-dom";
import { Flame, PlayCircle, Sparkles, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useReadingPlans } from "@/contexts/ReadingPlanContext";
import { getReaderLinkForRange } from "@/lib/scripture";
import { cn } from "@/lib/utils";

const ConfettiOverlay = ({ active }: { active: boolean }) => (
  <div
    aria-hidden
    className={cn(
      "pointer-events-none absolute inset-0 overflow-hidden rounded-2xl transition-opacity",
      active ? "opacity-100" : "opacity-0",
    )}
  >
    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
    <div className="absolute left-4 top-4 h-3 w-3 rounded-full bg-primary/80 animate-bounce" />
    <div className="absolute right-6 top-8 h-2 w-2 rounded-full bg-secondary/80 animate-[ping_1.5s_ease_infinite]" />
    <div className="absolute bottom-4 left-8 h-4 w-4 rounded-full bg-accent/80 animate-ping" />
  </div>
);

export const ReadingPlanWidget = () => {
  const { user } = useAuth();
  const { todayAssignment, activeProgress, catchUpQueue, celebration } = useReadingPlans();

  if (!user) {
    return (
      <Card variant="glass" hoverable={false} className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle glass className="text-lg font-semibold">Bible Reading Plans</CardTitle>
          <span className="glass-icon text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent glass className="space-y-4">
          <p className="text-sm">
            Sign in to track your progress, streaks, bookmarks, and notes across every device.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
              <Flame className="mr-1 h-3.5 w-3.5" /> Secure streaks
            </Badge>
            <Badge variant="outline" className="bg-secondary/20 border-secondary/30 backdrop-blur-sm">
              Synced notes
            </Badge>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link to="/auth/sign-in">Sign in to start</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-white/20 hover:border-white/30 hover:bg-white/10">
              <Link to="/auth/sign-up">Create free account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!todayAssignment || !activeProgress) {
    return (
      <Card variant="glass" hoverable={false} className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle glass className="text-lg font-semibold">Bible Reading Plan</CardTitle>
          <span className="glass-icon text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent glass className="space-y-4">
          <p className="text-sm">
            Build momentum with a guided plan, streak tracking, and gamified encouragement.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
              <Flame className="mr-1 h-3.5 w-3.5" /> Daily streaks
            </Badge>
            <Badge variant="outline" className="bg-secondary/20 border-secondary/30 backdrop-blur-sm">
              XP + Achievements
            </Badge>
          </div>
          <Button asChild className="w-full">
            <Link to="/plans">Browse Reading Plans</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { plan, day } = todayAssignment;
  const totalCompleted = activeProgress.completedDays.length;
  const percent = Math.round(
    (totalCompleted / Math.max(1, plan.durationDays)) * 100,
  );
  const readerLink = day.scriptures[0]
    ? getReaderLinkForRange(day.scriptures[0])
    : `/plans/${plan.id}/day/${day.dayNumber}`;

  return (
    <Card variant="glass" hoverable={false} className="relative overflow-hidden">
      <ConfettiOverlay active={Boolean(celebration)} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <p className="text-xs uppercase glass-body">Today's Reading</p>
          <CardTitle glass className="text-2xl font-semibold">
            {plan.title}
          </CardTitle>
        </div>
        <Badge className="bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_12px_rgba(var(--primary),0.4)]">
          <Flame className="mr-1.5 h-4 w-4" />
          {activeProgress.streakCount} day streak
        </Badge>
      </CardHeader>
      <CardContent glass className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium glass-heading">Day {day.dayNumber}</p>
          <p className="text-sm">
            {day.scriptures.map((range) => `${range.book} ${range.chapterStart}${range.chapterEnd !== range.chapterStart ? `-${range.chapterEnd}` : ""}`).join(", ")}
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs font-medium glass-body">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="mt-1" />
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-[16px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-3">
            <p className="text-xs uppercase tracking-wide glass-body">XP</p>
            <p className="text-lg font-semibold glass-heading">{activeProgress.points}</p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-3">
            <p className="text-xs uppercase tracking-wide glass-body">Catch-Up</p>
            <p className="text-lg font-semibold glass-heading">{catchUpQueue.length || 0} days</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link to={readerLink}>
              <PlayCircle className="mr-2 h-4 w-4" /> Continue Reading
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-white/20 hover:border-white/30 hover:bg-white/10">
            <Link to={`/plans/${plan.id}`}>
              <Target className="mr-2 h-4 w-4" /> Plan Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingPlanWidget;
