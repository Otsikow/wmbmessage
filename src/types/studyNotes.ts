export type StudyNoteStatus = "draft" | "published";

export interface StudyNote {
  id: string;
  title: string;
  topic: string;
  body: string;
  excerpt: string | null;
  tags: string[];
  status: StudyNoteStatus;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export const STUDY_NOTE_TOPICS = [
  "Godhead",
  "Water Baptism",
  "Bride of Christ",
  "Seven Seals",
  "Seven Church Ages",
  "Communion",
  "Foot Washing",
  "Faith",
  "Healing",
  "Christian Living",
  "Prophecy",
  "The Rapture",
  "The Token",
  "The Original Sin",
  "The Mark of the Beast",
  "The Stature of a Perfect Man",
  "End Time Message",
  "General",
] as const;
