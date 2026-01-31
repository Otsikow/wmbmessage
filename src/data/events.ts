export const EVENT_TYPES = [
  "Convention",
  "Special Retreat",
  "Revival Meeting",
  "Marriage Ceremony",
  "Conference",
  "Youth Program",
  "Prayer Summit",
  "Other (admin approval required)",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_FORMATS = ["Physical", "Online", "Hybrid"] as const;
export type EventFormat = (typeof EVENT_FORMATS)[number];

export const ENTRY_TYPES = ["Free", "Paid"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export const VISIBILITY_OPTIONS = ["Public", "Group-only", "Region-based"] as const;
export type VisibilityOption = (typeof VISIBILITY_OPTIONS)[number];
