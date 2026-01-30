import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type RetentionTrigger =
  | "new-prayer-request"
  | "prayer-answered"
  | "encouragement-received";

export type NotificationChannel = "push" | "email";

export interface RetentionNotificationPreferences {
  enabled: boolean;
  channels: Record<NotificationChannel, boolean>;
  triggers: Record<RetentionTrigger, boolean>;
  categories: string[];
}

export interface RetentionNotificationEvent {
  trigger: RetentionTrigger;
  category?: string;
}

export interface RetentionNotificationDispatch {
  channel: NotificationChannel;
  message: string;
  status: "sent" | "suppressed";
  reason?: string;
}

interface NotificationHistory {
  push: string | null;
  email: string | null;
}

const STORAGE_KEY = "retention-notifications:preferences:v1";
const HISTORY_KEY = "retention-notifications:history:v1";

export const PRAYER_CATEGORIES = [
  { id: "general", label: "General" },
  { id: "healing", label: "Healing" },
  { id: "family", label: "Family" },
  { id: "guidance", label: "Guidance" },
  { id: "provision", label: "Provision" },
  { id: "praise", label: "Praise" },
];

const DEFAULT_PREFERENCES: RetentionNotificationPreferences = {
  enabled: true,
  channels: {
    push: true,
    email: false,
  },
  triggers: {
    "new-prayer-request": true,
    "prayer-answered": true,
    "encouragement-received": true,
  },
  categories: PRAYER_CATEGORIES.map((category) => category.id),
};

const DEFAULT_HISTORY: NotificationHistory = {
  push: null,
  email: null,
};

interface RetentionNotificationContextValue {
  preferences: RetentionNotificationPreferences;
  updatePreferences: (updates: Partial<RetentionNotificationPreferences>) => void;
  setCategoryPreference: (categoryId: string, enabled: boolean) => void;
  sendNotification: (event: RetentionNotificationEvent) => RetentionNotificationDispatch[];
  history: NotificationHistory;
}

const RetentionNotificationContext = createContext<
  RetentionNotificationContextValue | undefined
>(undefined);

const getDateStamp = (date: Date = new Date()): string =>
  date.toISOString().slice(0, 10);

const loadPreferences = (): RetentionNotificationPreferences => {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(stored) as RetentionNotificationPreferences;
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_PREFERENCES;
    }

    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      channels: {
        ...DEFAULT_PREFERENCES.channels,
        ...parsed.channels,
      },
      triggers: {
        ...DEFAULT_PREFERENCES.triggers,
        ...parsed.triggers,
      },
      categories: Array.isArray(parsed.categories)
        ? parsed.categories
        : DEFAULT_PREFERENCES.categories,
    };
  } catch (error) {
    console.warn("Failed to load retention notification preferences", error);
    return DEFAULT_PREFERENCES;
  }
};

const loadHistory = (): NotificationHistory => {
  if (typeof window === "undefined") {
    return DEFAULT_HISTORY;
  }

  try {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    if (!stored) {
      return DEFAULT_HISTORY;
    }

    const parsed = JSON.parse(stored) as NotificationHistory;
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_HISTORY;
    }

    return {
      ...DEFAULT_HISTORY,
      ...parsed,
    };
  } catch (error) {
    console.warn("Failed to load retention notification history", error);
    return DEFAULT_HISTORY;
  }
};

const getMessageForEvent = (
  event: RetentionNotificationEvent,
  categories: typeof PRAYER_CATEGORIES,
): string => {
  switch (event.trigger) {
    case "new-prayer-request": {
      const categoryLabel = categories.find(
        (category) => category.id === event.category,
      )?.label;
      return categoryLabel
        ? `Someone asked for prayer in ${categoryLabel} today — will you pray with them?`
        : "Someone asked for prayer today — will you pray with them?";
    }
    case "prayer-answered":
      return "Your prayer was marked as answered.";
    case "encouragement-received":
      return "You received an encouragement today.";
    default:
      return "A new update is ready.";
  }
};

const canSend = (lastSent: string | null, today: string): boolean =>
  lastSent !== today;

export function RetentionNotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn("Failed to save retention notification preferences", error);
    }
  }, [preferences]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn("Failed to save retention notification history", error);
    }
  }, [history]);

  const updatePreferences = useCallback(
    (updates: Partial<RetentionNotificationPreferences>) => {
      setPreferences((previous) => ({
        ...previous,
        ...updates,
        channels: updates.channels
          ? { ...previous.channels, ...updates.channels }
          : previous.channels,
        triggers: updates.triggers
          ? { ...previous.triggers, ...updates.triggers }
          : previous.triggers,
        categories: updates.categories ?? previous.categories,
      }));
    },
    [],
  );

  const setCategoryPreference = useCallback(
    (categoryId: string, enabled: boolean) => {
      setPreferences((previous) => {
        const categories = new Set(previous.categories);
        if (enabled) {
          categories.add(categoryId);
        } else {
          categories.delete(categoryId);
        }

        return {
          ...previous,
          categories: Array.from(categories),
        };
      });
    },
    [],
  );

  const sendNotification = useCallback(
    (event: RetentionNotificationEvent): RetentionNotificationDispatch[] => {
      if (!preferences.enabled || !preferences.triggers[event.trigger]) {
        return [];
      }

      if (
        event.trigger === "new-prayer-request" &&
        event.category &&
        !preferences.categories.includes(event.category)
      ) {
        return [];
      }

      const today = getDateStamp();
      const message = getMessageForEvent(event, PRAYER_CATEGORIES);
      const results: RetentionNotificationDispatch[] = [];
      const updates: Partial<NotificationHistory> = {};

      (Object.keys(preferences.channels) as NotificationChannel[]).forEach(
        (channel) => {
          if (!preferences.channels[channel]) {
            return;
          }

          const lastSent = history[channel];
          if (!canSend(lastSent, today)) {
            results.push({
              channel,
              message,
              status: "suppressed",
              reason: "Daily limit reached",
            });
            return;
          }

          results.push({
            channel,
            message,
            status: "sent",
          });
          updates[channel] = today;
        },
      );

      if (Object.keys(updates).length > 0) {
        setHistory((previous) => ({ ...previous, ...updates }));
      }

      return results;
    },
    [history, preferences],
  );

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences,
      setCategoryPreference,
      sendNotification,
      history,
    }),
    [preferences, updatePreferences, setCategoryPreference, sendNotification, history],
  );

  return (
    <RetentionNotificationContext.Provider value={value}>
      {children}
    </RetentionNotificationContext.Provider>
  );
}

export const useRetentionNotifications = (): RetentionNotificationContextValue => {
  const context = useContext(RetentionNotificationContext);
  if (!context) {
    throw new Error(
      "useRetentionNotifications must be used within RetentionNotificationProvider",
    );
  }

  return context;
};
