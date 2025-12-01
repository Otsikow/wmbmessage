import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  differenceInCalendarDays,
  formatISO,
  isSameDay,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

const STORAGE_KEY = "engagement:stats:v1";

export type EngagementActivity =
  | "bible-reading"
  | "sermon-reading"
  | "daily-devotional"
  | "note-created"
  | "library-explore";

interface ActivityLogEntry {
  date: string; // ISO date representation (YYYY-MM-DD)
  activity: EngagementActivity;
  points: number;
  description?: string;
}

export interface EngagementStats {
  points: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalSessions: number;
  activityLog: ActivityLogEntry[];
  weeklyActivity: string[];
}

interface RecordOptions {
  description?: string;
  pointsOverride?: number;
  timestamp?: Date;
}

interface Milestone {
  label: string;
  remaining: number;
  type: "streak" | "points";
}

interface EngagementContextValue {
  stats: EngagementStats;
  recordActivity: (activity: EngagementActivity, options?: RecordOptions) => void;
  hasActivityToday: boolean;
  encouragement: string;
  nextMilestone: Milestone | null;
}

const ACTIVITY_POINTS: Record<EngagementActivity, number> = {
  "bible-reading": 15,
  "sermon-reading": 12,
  "daily-devotional": 8,
  "note-created": 6,
  "library-explore": 5,
};

const DEFAULT_STATS: EngagementStats = {
  points: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  totalSessions: 0,
  activityLog: [],
  weeklyActivity: [],
};

export type EngagementMilestone = Milestone;

const EngagementContext = createContext<EngagementContextValue | undefined>(
  undefined,
);

const getInitialStats = (): EngagementStats => {
  if (typeof window === "undefined") {
    return DEFAULT_STATS;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_STATS;
    }

    const parsed = JSON.parse(stored) as EngagementStats;
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_STATS;
    }

    return {
      ...DEFAULT_STATS,
      ...parsed,
      activityLog: Array.isArray(parsed.activityLog)
        ? parsed.activityLog.slice(0, 120)
        : [],
      weeklyActivity: Array.isArray(parsed.weeklyActivity)
        ? parsed.weeklyActivity
        : [],
    };
  } catch (error) {
    console.warn("Failed to load engagement stats", error);
    return DEFAULT_STATS;
  }
};

const saveStats = (stats: EngagementStats) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn("Failed to save engagement stats", error);
  }
};

const calculateNextMilestone = (stats: EngagementStats): Milestone | null => {
  const streakMilestones = [3, 7, 14, 21, 30];
  const pointMilestones = [50, 150, 300, 600, 1000];

  const nextStreak = streakMilestones.find((target) => target > stats.currentStreak);
  if (nextStreak) {
    return {
      label: `${nextStreak}-day streak`,
      remaining: nextStreak - stats.currentStreak,
      type: "streak",
    };
  }

  const nextPoints = pointMilestones.find((target) => target > stats.points);
  if (nextPoints) {
    return {
      label: `${nextPoints} points`,
      remaining: nextPoints - stats.points,
      type: "points",
    };
  }

  return null;
};

const getEncouragementMessage = (
  stats: EngagementStats,
  hasActivityToday: boolean,
): string => {
  if (stats.currentStreak >= 21) {
    return "You are building a powerful habit—keep shining!";
  }

  if (stats.currentStreak >= 7) {
    return "Seven days strong! Your consistency is inspiring.";
  }

  if (hasActivityToday) {
    return stats.currentStreak > 1
      ? `Beautiful work! Day ${stats.currentStreak} and counting.`
      : "Great start! Come back tomorrow to build your streak.";
  }

  if (stats.lastActiveDate) {
    const lastActive = parseISO(stats.lastActiveDate);
    const diff = differenceInCalendarDays(startOfDay(new Date()), lastActive);

    if (diff === 1) {
      return "Your streak is just waiting for you today—let's keep it going!";
    }

    if (diff <= 3) {
      return "We're saving your spot. A few minutes of reading will make your day.";
    }
  }

  return "Today's a great day to dive back into the Word.";
};

export function EngagementProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<EngagementStats>(() => getInitialStats());

  const hasActivityToday = useMemo(() => {
    if (!stats.lastActiveDate) {
      return false;
    }

    try {
      return isSameDay(parseISO(stats.lastActiveDate), new Date());
    } catch {
      return false;
    }
  }, [stats.lastActiveDate]);

  const recordActivity = useCallback(
    (activity: EngagementActivity, options?: RecordOptions) => {
      setStats((previous) => {
        const timestamp = options?.timestamp ?? new Date();
        const today = startOfDay(timestamp);
        const isoDate = formatISO(today, { representation: "date" });
        const points =
          options?.pointsOverride ?? ACTIVITY_POINTS[activity] ?? 5;

        const alreadyLogged = previous.activityLog.some(
          (entry) => entry.activity === activity && entry.date === isoDate,
        );

        if (alreadyLogged) {
          return previous;
        }

        const lastActiveDate = previous.lastActiveDate
          ? parseISO(previous.lastActiveDate)
          : null;

        let currentStreak = previous.currentStreak;

        if (!lastActiveDate) {
          currentStreak = 1;
        } else {
          const diff = differenceInCalendarDays(today, lastActiveDate);

          if (diff === 0) {
            currentStreak = previous.currentStreak || 1;
          } else if (diff === 1) {
            currentStreak = previous.currentStreak + 1;
          } else if (diff > 1) {
            currentStreak = 1;
          }
        }

        const longestStreak = Math.max(previous.longestStreak, currentStreak);

        const trimmedLog = previous.activityLog
          .concat()
          .slice(-59);

        const nextLog: ActivityLogEntry[] = [
          {
            date: isoDate,
            activity,
            points,
            description: options?.description,
          },
          ...trimmedLog,
        ];

        const recentWindow = subDays(today, 6);
        const weeklyActivitySet = new Set(
          previous.weeklyActivity.filter((entry) => {
            try {
              const entryDate = parseISO(entry);
              return entryDate >= recentWindow && entryDate <= today;
            } catch {
              return false;
            }
          }),
        );
        weeklyActivitySet.add(isoDate);

        const nextStats: EngagementStats = {
          points: previous.points + points,
          currentStreak,
          longestStreak,
          lastActiveDate: isoDate,
          totalSessions: previous.totalSessions + 1,
          activityLog: nextLog,
          weeklyActivity: Array.from(weeklyActivitySet).sort(),
        };

        saveStats(nextStats);
        return nextStats;
      });
    },
    [],
  );

  const nextMilestone = useMemo(
    () => calculateNextMilestone(stats),
    [stats],
  );

  const encouragement = useMemo(
    () => getEncouragementMessage(stats, hasActivityToday),
    [stats, hasActivityToday],
  );

  const value = useMemo<EngagementContextValue>(
    () => ({
      stats,
      recordActivity,
      hasActivityToday,
      encouragement,
      nextMilestone,
    }),
    [encouragement, hasActivityToday, nextMilestone, recordActivity, stats],
  );

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
}

export const useEngagement = () => {
  const context = useContext(EngagementContext);
  if (!context) {
    throw new Error("useEngagement must be used within an EngagementProvider");
  }
  return context;
};

export const useOptionalEngagement = () => useContext(EngagementContext);
