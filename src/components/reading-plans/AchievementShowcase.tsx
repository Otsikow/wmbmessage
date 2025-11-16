import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AchievementBadge } from "@/types/readingPlans";

interface AchievementShowcaseProps {
  badges: AchievementBadge[];
}

export const AchievementShowcase = ({ badges }: AchievementShowcaseProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <div>
        <CardTitle className="text-lg">Achievement Badges</CardTitle>
        <p className="text-sm text-muted-foreground">
          Shareable milestones that unlock as you stay faithful.
        </p>
      </div>
      <Badge variant="outline" className="gap-1">
        <Trophy className="h-4 w-4" /> {badges.length}
      </Badge>
    </CardHeader>
    <CardContent>
      {badges.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No badges yet—complete today's reading to earn your first!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {badges.map((badge) => (
            <div
              key={badge.badgeKey}
              className="rounded-xl border border-border/70 p-3"
            >
              <p className="text-sm font-semibold">{badge.badgeTitle}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                Earned {new Date(badge.dateEarned).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default AchievementShowcase;
