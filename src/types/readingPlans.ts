export type PlanCategory =
  | "whole-bible"
  | "new-testament"
  | "old-testament"
  | "wisdom"
  | "chronological"
  | "gospels"
  | "topical"
  | "custom";

export type PlanDifficulty = "easy" | "medium" | "advanced";

export interface ScriptureRange {
  book: string;
  chapterStart: number;
  verseStart?: number;
  chapterEnd: number;
  verseEnd?: number;
}

export interface PlanDay {
  id: string;
  planId: string;
  dayNumber: number;
  title: string;
  scriptures: ScriptureRange[];
  estimatedMinutes: number;
  summary: string;
  reflectionQuestion: string;
  encouragement: string;
  aiPrompt?: string;
}

export interface BiblePlan {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  planType: PlanCategory;
  difficulty: PlanDifficulty;
  tags: string[];
  coverImage?: string;
  themeColor?: string;
  featured?: boolean;
  isCustom?: boolean;
  estimatedMinutes?: number;
}

export interface ReminderPreferences {
  enabled: boolean;
  preferredWindow: "morning" | "evening" | "custom";
  morningTime?: string;
  eveningTime?: string;
  customTime?: string;
  timezone?: string;
  pushEnabled: boolean;
  lastReminderSent?: string | null;
}

export interface CompletionHistoryEntry {
  dayNumber: number;
  completedAt: string; // ISO timestamp
  viaCatchUp?: boolean;
}

export interface UserPlanProgress {
  planId: string;
  currentDay: number;
  completedDays: number[];
  streakCount: number;
  longestStreak: number;
  lastCompletedDate?: string | null;
  points: number;
  isCompleted: boolean;
  bookmarkDays: number[];
  reminderPreferences: ReminderPreferences;
  catchUpQueue: number[];
  downloadedDays: number[];
  history: CompletionHistoryEntry[];
  customNotes: Record<number, string>;
  notificationsEnabled: boolean;
  lastCatchUpPrompt?: string | null;
}

export interface AchievementBadge {
  badgeKey: string;
  badgeTitle: string;
  dateEarned: string;
  description: string;
  shareText: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarColor: string;
  points: number;
  streak: number;
  rank: number;
  isYou?: boolean;
}

export interface CustomPlanDayInput {
  title: string;
  scriptures: ScriptureRange[];
  estimatedMinutes?: number;
  reflectionQuestion?: string;
  summary?: string;
}

export interface CustomPlanInput {
  title: string;
  description: string;
  difficulty: PlanDifficulty;
  tags: string[];
  themeColor?: string;
  dailyReadings: CustomPlanDayInput[];
}
