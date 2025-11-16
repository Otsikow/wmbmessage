import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LeaderboardEntry } from "@/types/readingPlans";

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
}

export const LeaderboardCard = ({ entries }: LeaderboardCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <CardTitle className="flex items-center gap-2 text-lg">
        <Crown className="h-5 w-5 text-amber-500" /> Weekly Reading Leaderboard
      </CardTitle>
      <p className="text-xs text-muted-foreground">Friendly motivation only</p>
    </CardHeader>
    <CardContent className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={cn(
            "flex items-center justify-between rounded-xl border border-border/60 p-3",
            entry.isYou && "border-primary bg-primary/5",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: entry.avatarColor }}
            >
              {entry.username
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold">{entry.username}</p>
              <p className="text-xs text-muted-foreground">
                {entry.streak} day streak · Rank {entry.rank}
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold">{entry.points.toLocaleString()} XP</p>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default LeaderboardCard;
