import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  differenceInCalendarDays,
  formatISO,
  parseISO,
  startOfDay,
} from "date-fns";
import {
  BASE_READING_PLANS,
  createCustomPlanDays,
  getPlanDaysById,
} from "@/data/readingPlans";
import {
  AchievementBadge,
  BiblePlan,
  CustomPlanInput,
  PlanDay,
  ReminderPreferences,
  UserPlanProgress,
} from "@/types/readingPlans";
import { useEngagement } from "@/contexts/EngagementContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/integrations/supabase/config";

interface ReadingPlanState {
  activePlanId?: string;
  progress: Record<string, UserPlanProgress>;
  achievements: AchievementBadge[];
  customPlans: BiblePlan[];
  customPlanDays: Record<string, PlanDay[]>;
}

interface CompletionResult {
  streakIncreased: boolean;
  pointsEarned: number;
  planCompleted: boolean;
  dayCompleted: number;
  newBadges: AchievementBadge[];
}

interface ReadingPlanContextValue {
  plans: BiblePlan[];
  activePlan?: BiblePlan;
  activeProgress?: UserPlanProgress;
  progressMap: Record<string, UserPlanProgress>;
  todayAssignment: { plan: BiblePlan; day: PlanDay } | null;
  achievements: AchievementBadge[];
  totalPoints: number;
  leaderboard: {
    id: string;
    username: string;
    avatarColor: string;
    points: number;
    streak: number;
    rank: number;
    isYou?: boolean;
  }[];
  catchUpQueue: number[];
  celebration: { streak: number; timestamp: string } | null;
  getPlanDays: (planId: string) => PlanDay[];
  startPlan: (planId: string) => void;
  markDayComplete: (
    planId: string,
    dayNumber: number,
    options?: { viaCatchUp?: boolean; timestamp?: Date },
  ) => CompletionResult | null;
  completeCatchUpDay: (planId: string, dayNumber: number) => CompletionResult | null;
  enterCatchUpMode: (planId: string) => number[];
  toggleBookmarkDay: (planId: string, dayNumber: number) => void;
  updateReminderPreferences: (
    planId: string,
    preferences: Partial<ReminderPreferences>,
  ) => void;
  addNoteForDay: (planId: string, dayNumber: number, note: string) => void;
  createCustomPlan: (input: CustomPlanInput) => BiblePlan;
  preloadNextDay: (planId: string, dayNumber: number) => void;
}

const STORAGE_KEY_BASE = "reading-plan-state:v1";

const buildStorageKey = (userId?: string | null) =>
  (userId ? `${STORAGE_KEY_BASE}:${userId}` : STORAGE_KEY_BASE);

const defaultReminder = (): ReminderPreferences => ({
  enabled: false,
  preferredWindow: "morning",
  morningTime: "07:00",
  eveningTime: "20:00",
  customTime: "12:00",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  pushEnabled: true,
  lastReminderSent: null,
});

const createInitialProgress = (planId: string): UserPlanProgress => ({
  planId,
  currentDay: 1,
  completedDays: [],
  streakCount: 0,
  longestStreak: 0,
  lastCompletedDate: null,
  points: 0,
  isCompleted: false,
  bookmarkDays: [],
  reminderPreferences: defaultReminder(),
  catchUpQueue: [],
  downloadedDays: [],
  history: [],
  customNotes: {},
  notificationsEnabled: true,
  lastCatchUpPrompt: null,
});

const defaultState: ReadingPlanState = {
  activePlanId: undefined,
  progress: {},
  achievements: [],
  customPlans: [],
  customPlanDays: {},
};

const mergeStateWithDefaults = (incoming?: Partial<ReadingPlanState>): ReadingPlanState => ({
  ...defaultState,
  ...incoming,
  progress: incoming?.progress ?? {},
  achievements: incoming?.achievements ?? [],
  customPlans: incoming?.customPlans ?? [],
  customPlanDays: incoming?.customPlanDays ?? {},
});

const loadState = (storageKey = STORAGE_KEY_BASE): ReadingPlanState => {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return defaultState;
    }
    const parsed = JSON.parse(stored) as Partial<ReadingPlanState>;
    return mergeStateWithDefaults(parsed);
  } catch (error) {
    console.warn("Failed to load reading plan state", error);
    return defaultState;
  }
};

const saveState = (state: ReadingPlanState, storageKey = STORAGE_KEY_BASE) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist reading plan state", error);
  }
};

const ReadingPlanContext = createContext<ReadingPlanContextValue | undefined>(
  undefined,
);

const calculateMissingDays = (
  planDays: PlanDay[],
  progress: UserPlanProgress,
): number[] => {
  const missing: number[] = [];
  for (let i = 1; i <= planDays.length; i += 1) {
    if (!progress.completedDays.includes(i)) {
      missing.push(i);
    }
  }
  return missing;
};

const buildLeaderboardSeeds = () => [
  { id: "seed-1", username: "GraceNotes", avatarColor: "#a855f7", points: 2480, streak: 19 },
  { id: "seed-2", username: "MorningFire", avatarColor: "#f97316", points: 2240, streak: 17 },
  { id: "seed-3", username: "ScriptureSprinter", avatarColor: "#0ea5e9", points: 1890, streak: 14 },
  { id: "seed-4", username: "JoyfulReader", avatarColor: "#10b981", points: 1750, streak: 12 },
];

const findPlan = (plans: BiblePlan[], planId: string) =>
  plans.find((plan) => plan.id === planId);

const ensureUniqueBadges = (
  unlocked: AchievementBadge[],
  existing: AchievementBadge[],
) =>
  unlocked.filter(
    (badge) => !existing.some((existingBadge) => existingBadge.badgeKey === badge.badgeKey),
  );

const buildBadge = (
  badgeKey: string,
  badgeTitle: string,
  description: string,
): AchievementBadge => ({
  badgeKey,
  badgeTitle,
  description,
  dateEarned: new Date().toISOString(),
  shareText: `${badgeTitle} unlocked in Sermon Scrolls!`,
});

export const ReadingPlanProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = useState<ReadingPlanState>(() => loadState());
  const [celebration, setCelebration] = useState<{
    streak: number;
    timestamp: string;
  } | null>(null);
  const [storageKey, setStorageKey] = useState(() => STORAGE_KEY_BASE);
  const [isRemoteHydrated, setIsRemoteHydrated] = useState(() => !user);
  const { recordActivity } = useEngagement();

  useEffect(() => {
    const nextKey = buildStorageKey(user?.id ?? null);
    setStorageKey(nextKey);
    setState(loadState(nextKey));
    setIsRemoteHydrated(!user);
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!isSupabaseConfigured) {
      setIsRemoteHydrated(true);
      return;
    }

    let cancelled = false;
    setIsRemoteHydrated(false);

    const hydrateFromSupabase = async () => {
      const { data, error } = await supabase
        .from("user_reading_states")
        .select("state")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.warn("Failed to load reading plan state from Supabase", error);
      }

      if (data?.state) {
        setState(mergeStateWithDefaults(data.state as Partial<ReadingPlanState>));
      }

      setIsRemoteHydrated(true);
    };

    hydrateFromSupabase();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const plans = useMemo(
    () => [...BASE_READING_PLANS, ...state.customPlans],
    [state.customPlans],
  );

  const getPlanDays = useCallback(
    (planId: string) => state.customPlanDays[planId] ?? getPlanDaysById(planId),
    [state.customPlanDays],
  );

  const activePlan = useMemo(
    () => (state.activePlanId ? findPlan(plans, state.activePlanId) : undefined),
    [plans, state.activePlanId],
  );

  const activeProgress = useMemo(
    () => (activePlan ? state.progress[activePlan.id] : undefined),
    [activePlan, state.progress],
  );

  const todayAssignment = useMemo(() => {
    if (!activePlan) {
      return null;
    }
    const planDays = getPlanDays(activePlan.id);
    const targetDayNumber = activeProgress?.currentDay ?? 1;
    const day = planDays.find((entry) => entry.dayNumber === targetDayNumber);
    if (!day) {
      return null;
    }
    return { plan: activePlan, day };
  }, [activePlan, activeProgress?.currentDay, getPlanDays]);

  useEffect(() => {
    saveState(state, storageKey);
  }, [state, storageKey]);

  useEffect(() => {
    if (!user || !isRemoteHydrated || !isSupabaseConfigured) {
      return;
    }

    const timeout = setTimeout(async () => {
      const serializedState = JSON.parse(JSON.stringify(state));
      const { error } = await supabase
        .from("user_reading_states")
        .upsert({ user_id: user.id, state: serializedState });

      if (error) {
        console.warn("Failed to save reading plan state to Supabase", error);
      }
    }, 800);

    return () => {
      clearTimeout(timeout);
    };
  }, [state, user?.id, isRemoteHydrated]);

  const startPlan = useCallback((planId: string) => {
    setState((previous) => {
      const existingProgress = previous.progress[planId] ?? createInitialProgress(planId);
      return {
        ...previous,
        activePlanId: planId,
        progress: {
          ...previous.progress,
          [planId]: existingProgress,
        },
      };
    });
  }, []);

  const updateProgress = useCallback(
    (
      planId: string,
      updater: (progress: UserPlanProgress, planDays: PlanDay[]) => UserPlanProgress,
    ) => {
      const plan = findPlan(plans, planId);
      if (!plan) {
        return;
      }
      const planDays = getPlanDays(planId);
      setState((previous) => {
        const existing = previous.progress[planId] ?? createInitialProgress(planId);
        const nextProgress = updater(existing, planDays);
        return {
          ...previous,
          progress: {
            ...previous.progress,
            [planId]: nextProgress,
          },
        };
      });
    },
    [getPlanDays, plans],
  );

  const toggleBookmarkDay = useCallback(
    (planId: string, dayNumber: number) => {
      updateProgress(planId, (progress) => {
        const alreadyBookmarked = progress.bookmarkDays.includes(dayNumber);
        return {
          ...progress,
          bookmarkDays: alreadyBookmarked
            ? progress.bookmarkDays.filter((entry) => entry !== dayNumber)
            : [...progress.bookmarkDays, dayNumber],
        };
      });
    },
    [updateProgress],
  );

  const updateReminderPreferences = useCallback(
    (planId: string, preferences: Partial<ReminderPreferences>) => {
      updateProgress(planId, (progress) => ({
        ...progress,
        reminderPreferences: {
          ...progress.reminderPreferences,
          ...preferences,
        },
      }));
    },
    [updateProgress],
  );

  const addNoteForDay = useCallback(
    (planId: string, dayNumber: number, note: string) => {
      updateProgress(planId, (progress) => ({
        ...progress,
        customNotes: {
          ...progress.customNotes,
          [dayNumber]: note,
        },
      }));
    },
    [updateProgress],
  );

  const enterCatchUpMode = useCallback(
    (planId: string) => {
      const plan = findPlan(plans, planId);
      if (!plan) {
        return [];
      }
      const planDays = getPlanDays(planId);
      let queue: number[] = [];
      updateProgress(planId, (progress) => {
        queue = calculateMissingDays(planDays, progress);
        return {
          ...progress,
          catchUpQueue: queue,
          lastCatchUpPrompt: new Date().toISOString(),
        };
      });
      return queue;
    },
    [getPlanDays, plans, updateProgress],
  );

  const evaluateAchievements = (
    planId: string,
    planType: string,
    progress: UserPlanProgress,
    completionDate: Date,
    previous: ReadingPlanState,
    wasPlanCompleted: boolean,
    wasComeback: boolean,
  ) => {
    const unlocked: AchievementBadge[] = [];
    if (progress.streakCount >= 7) {
      unlocked.push(
        buildBadge(
          "streak-7",
          "7-Day Faithful Reader",
          "Seven straight days in Scripture is building holy momentum.",
        ),
      );
    }
    if (progress.streakCount >= 30) {
      unlocked.push(
        buildBadge(
          "streak-30",
          "30-Day Discipline Award",
          "A full month in the Word proves your consistency.",
        ),
      );
    }
    if (wasPlanCompleted && planId === "bible-in-a-year") {
      unlocked.push(
        buildBadge(
          "bible-year",
          "Bible-in-a-Year Champion",
          "You completed the entire Bible journey.",
        ),
      );
    }
    if (wasPlanCompleted && planType === "new-testament") {
      unlocked.push(
        buildBadge(
          "nt-finisher",
          "New Testament Finisher",
          "You completed a New Testament plan!",
        ),
      );
    }
    if (wasPlanCompleted) {
      unlocked.push(
        buildBadge(
          `plan-finish-${planId}`,
          "Plan Completed",
          "Another plan marked complete—celebrate the milestone!",
        ),
      );
    }
    const morningReads = progress.history.filter(
      (entry) => new Date(entry.completedAt).getHours() < 12,
    ).length;
    if (morningReads >= 10) {
      unlocked.push(
        buildBadge(
          "morning-master",
          "Morning Devotion Master",
          "You consistently met God before noon!",
        ),
      );
    }
    const nightReads = progress.history.filter(
      (entry) => new Date(entry.completedAt).getHours() >= 20,
    ).length;
    if (nightReads >= 10) {
      unlocked.push(
        buildBadge(
          "night-champion",
          "Night Reader Champion",
          "Late-night obedience keeps the fire burning.",
        ),
      );
    }
    if (wasComeback) {
      unlocked.push(
        buildBadge(
          "comeback",
          "Comeback Badge",
          "You returned after a break and kept going—well done!",
        ),
      );
    }

    return ensureUniqueBadges(unlocked, previous.achievements);
  };

  const markDayComplete = useCallback(
    (
      planId: string,
      dayNumber: number,
      options?: { viaCatchUp?: boolean; timestamp?: Date },
    ): CompletionResult | null => {
      const plan = findPlan(plans, planId);
      if (!plan) {
        return null;
      }
      const planDays = getPlanDays(planId);
      const timestamp = options?.timestamp ?? new Date();
      const todayStart = startOfDay(timestamp);
      const isoDate = formatISO(todayStart, { representation: "date" });

      let completionResult: CompletionResult | null = null;

      setState((previous) => {
        const existing = previous.progress[planId] ?? createInitialProgress(planId);
        if (existing.completedDays.includes(dayNumber)) {
          return previous;
        }
        const lastCompletedDate = existing.lastCompletedDate
          ? parseISO(existing.lastCompletedDate)
          : null;
        const diff = lastCompletedDate
          ? differenceInCalendarDays(todayStart, lastCompletedDate)
          : null;
        let streakCount = existing.streakCount;
        if (!lastCompletedDate) {
          streakCount = 1;
        } else if (diff === 0) {
          streakCount = existing.streakCount;
        } else if (diff === 1) {
          streakCount = existing.streakCount + 1;
        } else if (diff && diff > 1) {
          streakCount = 1;
        }
        const longestStreak = Math.max(existing.longestStreak, streakCount);
        const completedDays = [...existing.completedDays, dayNumber].sort((a, b) => a - b);
        const completedCount = completedDays.length;
        const totalDays = planDays.length;
        const isCompleted = completedCount >= totalDays;

        let pointsEarned = 10;
        if (streakCount > 0 && streakCount % 7 === 0) {
          pointsEarned += 30;
        }
        if (isCompleted) {
          pointsEarned += 100;
        }

        const nextHistory = [
          {
            dayNumber,
            completedAt: timestamp.toISOString(),
            viaCatchUp: options?.viaCatchUp ?? false,
          },
          ...existing.history,
        ].slice(0, 200);

        const missingDays = calculateMissingDays(planDays, {
          ...existing,
          completedDays,
        });

        const wasComeback = diff !== null && diff > 3;
        const newBadges = evaluateAchievements(
          planId,
          plan.planType,
          {
            ...existing,
            completedDays,
            history: nextHistory,
            streakCount,
            longestStreak,
          },
          timestamp,
          previous,
          isCompleted,
          wasComeback,
        );

        completionResult = {
          streakIncreased: streakCount > existing.streakCount,
          pointsEarned,
          planCompleted: isCompleted,
          dayCompleted: dayNumber,
          newBadges,
        };

        if (completionResult.streakIncreased && streakCount > 1) {
          setCelebration({ streak: streakCount, timestamp: timestamp.toISOString() });
        }

        recordActivity("bible-reading", {
          description: `Completed day ${dayNumber} of ${plan.title}`,
          pointsOverride: pointsEarned,
          timestamp,
        });

        const nextProgress: UserPlanProgress = {
          ...existing,
          currentDay: Math.min(totalDays, Math.max(existing.currentDay, dayNumber + 1)),
          completedDays,
          streakCount,
          longestStreak,
          lastCompletedDate: isoDate,
          points: existing.points + pointsEarned,
          isCompleted,
          catchUpQueue: missingDays,
          history: nextHistory,
        };

        return {
          ...previous,
          progress: {
            ...previous.progress,
            [planId]: nextProgress,
          },
          achievements: [...previous.achievements, ...newBadges],
          activePlanId: previous.activePlanId ?? planId,
        };
      });

      return completionResult;
    },
    [getPlanDays, plans, recordActivity],
  );

  const completeCatchUpDay = useCallback(
    (planId: string, dayNumber: number) =>
      markDayComplete(planId, dayNumber, { viaCatchUp: true }),
    [markDayComplete],
  );

  const createCustomPlan = useCallback(
    (input: CustomPlanInput): BiblePlan => {
      const planId = `custom-${Date.now()}`;
      const plan: BiblePlan = {
        id: planId,
        title: input.title,
        description: input.description,
        durationDays: input.dailyReadings.length,
        planType: "custom",
        difficulty: input.difficulty,
        tags: input.tags,
        themeColor: input.themeColor ?? "#6366f1",
        isCustom: true,
      };
      const days = createCustomPlanDays(planId, input.dailyReadings);
      setState((previous) => ({
        ...previous,
        customPlans: [...previous.customPlans, plan],
        customPlanDays: {
          ...previous.customPlanDays,
          [planId]: days,
        },
      }));
      return plan;
    },
    [],
  );

  const preloadNextDay = useCallback(
    (planId: string, dayNumber: number) => {
      updateProgress(planId, (progress) => ({
        ...progress,
        downloadedDays: progress.downloadedDays.includes(dayNumber)
          ? progress.downloadedDays
          : [...progress.downloadedDays, dayNumber],
      }));
    },
    [updateProgress],
  );

  const totalPoints = useMemo(
    () =>
      Object.values(state.progress).reduce((sum, progress) => sum + progress.points, 0),
    [state.progress],
  );

  const leaderboard = useMemo(() => {
    const seeds = buildLeaderboardSeeds();
    const you = {
      id: "you",
      username: "You",
      avatarColor: "#facc15",
      points: Math.max(5, totalPoints),
      streak: activeProgress?.streakCount ?? 0,
      rank: 0,
      isYou: true,
    };
    const combined = [...seeds, you].sort((a, b) => b.points - a.points);
    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [activeProgress?.streakCount, totalPoints]);

  const contextValue: ReadingPlanContextValue = {
    plans,
    activePlan,
    activeProgress,
    progressMap: state.progress,
    todayAssignment,
    achievements: state.achievements,
    totalPoints,
    leaderboard,
    catchUpQueue: activeProgress?.catchUpQueue ?? [],
    celebration,
    getPlanDays,
    startPlan,
    markDayComplete,
    completeCatchUpDay,
    enterCatchUpMode,
    toggleBookmarkDay,
    updateReminderPreferences,
    addNoteForDay,
    createCustomPlan,
    preloadNextDay,
  };

  return (
    <ReadingPlanContext.Provider value={contextValue}>
      {children}
    </ReadingPlanContext.Provider>
  );
};

export const useReadingPlans = () => {
  const context = useContext(ReadingPlanContext);
  if (!context) {
    throw new Error("useReadingPlans must be used inside ReadingPlanProvider");
  }
  return context;
};
