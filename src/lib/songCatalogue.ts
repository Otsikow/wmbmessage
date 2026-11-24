import { toTitleCase } from "@/lib/titleCase";
import { searchSongs } from "@/services/songService";
import type { Song } from "@/types/songs";

export type SongCollection = "all" | "fellowship" | "presenter";
export type SongOrder = "title" | "number";

export interface SongEntry {
  id: string;
  title: string;
  firstLine?: string;
  arrangements: Song[];
}

export interface SongResult {
  entry: SongEntry;
  song: Song;
}

// These arrangements share their printed title with a different song.
const distinctSongs: Record<string, string> = {
  "presenter-4cd0d0c0837be1c0": "holy holy holy sound of heaven",
  "presenter-e3ca364bc6c1f2e9": "redeemed you set me free",
  "presenter-ddff684f9969c8d7": "redeemed you set me free",
  "presenter-ca5e4c8923e444d8": "great is the lord city of our god",
  "presenter-075e1c03caaca445": "a child of the king once i was clothed",
  "presenter-1213bf41269d6917": "beulah land homesick for a country",
  "presenter-2124436dcc4b1cd4": "how great is our god splendor of the king",
  "presenter-677e31a0383d091c": "how great is our god splendor of the king",
  "presenter-0eb1e1ad963676ac": "it is well town called shunem",
  "presenter-8ab4c618e5876e1d": "thank you lord i saw the sun go down",
  "presenter-c6443a203e7d6e73": "emmanuel not the one we thought would come",
  "presenter-15aee273885adee1": "praise him i feel like praising",
  "presenter-817e3b45b1ff4d34": "worthy is the lamb thank you for the cross",
};

// Source IDs whose lyrics identify the same song under another title.
const alternateTitles: Record<string, string> = {
  "presenter-677e31a0383d091c": "How Great Is Our God",
  "presenter-ddff684f9969c8d7": "Redeemed",
  "presenter-6e333dda68cc8825": "They Come from the East and West",
  "presenter-8116f2860e17f7d6": "God Gave",
  "presenter-38ae97e9919a09ad": "Eliezer Call",
  "presenter-a706a66dc8ce4013": "How Good He Is",
  "presenter-9a113bd82b2355cf": "I Am Determined to Hold Out",
  "presenter-2a80465c28c01233": "Wonderful Peace",
  "presenter-7179a4ddd391eda9": "Battle Hymn of the Republic",
  "presenter-44beea68d8c2ef64": "I’d Rather Be Christian",
  "presenter-0da5b8b1b84e327a": "I’m Glad I’m One of Them",
  "presenter-9039338033d2cb33": "In That City, Lamb Is Light",
  "presenter-103111bf115232fe": "Goodness and Mercy",
  "presenter-60355a90dec88ff9": "I Am Thine, Oh Lord",
  "presenter-1f5dd739ab9a52f8": "When He Reached Down",
  "presenter-5739936dfaad4b3d": "It Is Well",
  "presenter-13422046781e7cc3": "Cleanse Me",
  "presenter-134b29a1da53667f": "When the Redeemed Gather",
  "presenter-1705aeb2fde30301": "Wear a Crown",
  "presenter-28772ba34e8e5f96": "Wonderful, Wonderful",
  "presenter-b17097a1cb35f191": "One Day",
  "presenter-cdaf698dfbe4b219": "To God Be the Glory",
  "presenter-b01ab6087329a183": "Ship of Zion",
  "presenter-5ae31ffc6e0f337d": "Fill My Way with Love",
  "presenter-38e705f9908da4cc": "Where We Never Grow Old",
  "presenter-cc499156bcda97c4": "Matters into His Own Hands",
  "presenter-b632acd079e17265": "Jesus, the Light",
  "presenter-0f0b8a3f79f68a44": "When the Saints March In",
  "presenter-0702e2c81ac324aa": "Feast of Overcomers",
  "presenter-11dd29c9a60f13ac": "Just a Closer Walk",
  "presenter-9a7b54a0f2d4e303": "Give Me Faith",
  "presenter-ec034287b7bc9d0d": "You Do Not Owe Me",
  "presenter-92d9eceb67c67d9a": "Psalm 19",
  "presenter-f2fbcb854c0c5c7d": "Hold to God’s Hand",
  "presenter-d007e18de4632b8d": "Lord, I’m Coming Home",
  "presenter-2a1b52cc2af679c8": "I Can’t Even Walk Without You Holding My Hand",
  "presenter-7d8fcf81a4527dd4": "The Token",
  "presenter-1c1383c607303df0": "Let the Worshipers Arise",
  "1013-there-is-power-in-blood": "There Is Power in the Blood",
  "0141-nothing-but-the-blod": "Nothing but the Blood",
  "presenter-a60a8e30ee1b0e31": "I Won’t Cross Alone",
  "presenter-c83e9cccfe27e2bf": "Jesus at the Center",
  "presenter-c2e4f20cebb930c5": "Old-Time Power",
  "presenter-803b2502db810432": "No Turning Back",
  "presenter-b33b995ed733934b": "Let Me Walk with Jesus",
  "presenter-38bebd06374770ae": "How Great Is Our God",
  "presenter-178db1067d07d7cc": "I’m Reaching Out to You",
  "presenter-d9da88e20397c4c9": "Hosanna, Blessed Be the Rock",
  "presenter-9b7631cd5ffc0557": "His Banner over Me",
  "presenter-df94bf64b5dd0705": "Jesus, Jesus, Jesus",
  "presenter-61f22e1297f663a8": "He Is All I Need",
  "presenter-bc8e0ecc4641bd25": "Give Me Oil",
  "presenter-2347dc5a0da07ae5": "He Has Made Me Glad",
  "presenter-ec45df11919d2473": "We Are Standing on Holy Ground",
  "presenter-f187e00756533084": "Every Promise in the Book",
  "presenter-962a5fa2d9750a24": "Every Promise in the Book",
  "presenter-e524a0e9c0d52c12": "Sanctuary",
  "presenter-d5a9ac96575af690": "Lead Me Lord I Will Go",
};

const titleCollator = new Intl.Collator("en", { sensitivity: "base", ignorePunctuation: true });
const keySuffix = /\s+[-–—]\s*([A-G](?:[#♯b♭])?m?)?\s*$/;
const titleKey = (title: string) => title.normalize("NFKD").toLowerCase()
  .replace(/\p{M}/gu, "").replace(/[’‘']/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function arrangementKey(song: Song) {
  return song.title.match(keySuffix)?.[1];
}

export function collectionName(song: Song) {
  return song.collection === "presenter" ? "Church Presenter" : "Fellowship Song Book";
}

export function arrangementLabel(song: Song) {
  const key = arrangementKey(song);
  return [collectionName(song), song.number === null ? null : `No. ${song.number}`, key ? `Key ${key}` : null]
    .filter(Boolean).join(" · ");
}

function leadingLyric(song: Song) {
  const firstLine = song.sections.flatMap((section) => section.lines).find((line) => line.trim())?.trim();
  return firstLine && firstLine.length > 68 ? `${firstLine.slice(0, 65).trimEnd()}…` : firstLine;
}

export function buildSongCatalogue(songs: Song[]) {
  const entries = new Map<string, SongEntry>();
  const bySong = new Map<string, SongEntry>();
  const titles = new Map<string, number>();

  for (const song of songs) {
    const title = alternateTitles[song.id] ?? toTitleCase(song.title.replace(keySuffix, ""));
    const normalized = titleKey(title);
    const id = distinctSongs[song.id] ?? normalized;
    let entry = entries.get(id);
    if (!entry) {
      entry = { id, title, arrangements: [] };
      entries.set(id, entry);
      titles.set(normalized, (titles.get(normalized) ?? 0) + 1);
    }
    entry.arrangements.push(song);
    bySong.set(song.id, entry);
  }

  for (const entry of entries.values()) {
    if ((titles.get(titleKey(entry.title)) ?? 0) > 1) {
      entry.firstLine = leadingLyric(entry.arrangements[0]);
    }
  }

  return { entries: [...entries.values()], bySong };
}

export function browseSongs(
  catalogue: ReturnType<typeof buildSongCatalogue>,
  query: string,
  collection: SongCollection,
  order: SongOrder,
): SongResult[] {
  const candidates = catalogue.entries
    .flatMap((entry) => entry.arrangements.filter((song) => collection === "all" || (song.collection ?? "fellowship") === collection))
    .sort((a, b) => {
      const first = catalogue.bySong.get(a.id)!;
      const second = catalogue.bySong.get(b.id)!;
      const byNumber = order === "number" ? (a.number ?? Infinity) - (b.number ?? Infinity) : 0;
      return byNumber || titleCollator.compare(first.title, second.title);
    });
  const visible = new Map<string, SongResult>();
  for (const song of searchSongs(candidates, query, { displayTitle: (song) => catalogue.bySong.get(song.id)?.title })) {
    const entry = catalogue.bySong.get(song.id)!;
    if (!visible.has(entry.id)) visible.set(entry.id, { entry, song });
  }
  return [...visible.values()];
}

export function arrangementOptions(entry: SongEntry) {
  const labels = entry.arrangements.map(arrangementLabel);
  return entry.arrangements.map((song, index) => {
    const label = labels[index];
    if (labels.indexOf(label) === labels.lastIndexOf(label)) return { song, label };
    const detail = song.title.replace(keySuffix, "");
    const sameTitles = entry.arrangements.filter((other, i) => labels[i] === label && other.title.replace(keySuffix, "") === detail);
    return { song, label: `${label} · ${sameTitles.length > 1 ? `Version ${sameTitles.indexOf(song) + 1}` : detail}` };
  });
}
