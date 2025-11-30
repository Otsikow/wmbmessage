import * as React from "react";
import type { ReactNode } from "react";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  color?: string;
}

interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
}

const CalendarContext = React.createContext<CalendarContextType | undefined>(undefined);

const STORAGE_KEY = "calendar-events";

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = React.useState<CalendarEvent[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          return parsed.map(
            (e: { id: string; title: string; date: string; description?: string; color?: string }) => ({
              id: e.id,
              title: e.title,
              description: e.description ?? "",
              date: new Date(e.date),
              color: e.color,
            })
          );
        }
      }
    } catch (error) {
      console.error("Failed to load calendar events:", error);
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: "1",
        title: "Bible Study Group",
        description: "Weekly bible study and fellowship",
        date: nextWeek,
      },
      {
        id: "2",
        title: "Prayer Meeting",
        description: "Evening prayer and worship",
        date: tomorrow,
      },
    ];
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error("Unable to save calendar events:", error);
    }
  }, [events]);

  const addEvent = React.useCallback((event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const updateEvent = React.useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...updates } : event))
    );
  }, []);

  const deleteEvent = React.useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({ events, addEvent, updateEvent, deleteEvent }),
    [events, addEvent, updateEvent, deleteEvent]
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = React.useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within CalendarProvider");
  }
  return context;
}
