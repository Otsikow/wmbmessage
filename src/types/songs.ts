export type SongSectionType = "verse" | "chorus" | "bridge" | "refrain" | "other";

export interface SongSection {
  type: SongSectionType;
  /** Optional label like "CHORUS", "CHORUS 2", "BRIDGE" */
  label?: string | null;
  lines: string[];
}

export interface Song {
  id: string;
  number: number;
  title: string;
  sections: SongSection[];
  /** Convenience: first chorus joined by newlines, if present */
  chorus: string | null;
  /** All sections joined as plain text */
  lyrics: string;
  rawText: string;
  /** Lowercased text used for fast in-memory search */
  searchText: string;
}
