import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BookmarkIcon,
  Highlighter,
  FileText,
  Clock,
  Loader2,
  Trash2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  useLibraryItems,
  type LibraryBookmark,
  type LibraryHighlight,
} from "@/hooks/useLibraryItems";
import { useUserNotes } from "@/hooks/useNotes";
import { useActivityLog } from "@/hooks/useActivityLog";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BackButton from "@/components/BackButton";

const HIGHLIGHT_COLORS = {
  yellow: "bg-yellow-200 dark:bg-yellow-900",
  green: "bg-green-200 dark:bg-green-900",
  blue: "bg-blue-200 dark:bg-blue-900",
  pink: "bg-pink-200 dark:bg-pink-900",
  purple: "bg-purple-200 dark:bg-purple-900",
  orange: "bg-orange-200 dark:bg-orange-900",
};

type LibraryDisplayItem = LibraryBookmark | LibraryHighlight | {
  id: string;
  title?: string | null;
  content?: string | null;
  source_id?: string | null;
  tags?: string[];
  created_at?: string;
  sermon_title?: string | null;
};

interface LibrarySectionProps<T extends LibraryDisplayItem = LibraryDisplayItem> {
  title: string;
  icon: LucideIcon;
  items: T[];
  loading: boolean;
  onDelete?: (item: T) => void;
  onNavigate: (item: T) => void;
  colorMap?: Record<string, string>;
  searchQuery?: string;
}

interface LibraryTabProps<T extends LibraryDisplayItem = LibraryDisplayItem>
  extends Omit<LibrarySectionProps<T>, "title"> {
  label: string;
  emptyMessage: string;
}

export default function Library() {
  const navigate = useNavigate();
  const {
    bookmarks,
    highlights,
    bookmarksLoading,
    highlightsLoading,
    removeBookmark,
    removeHighlight,
  } = useLibraryItems();
  const { userNotes, loading: notesLoading } = useUserNotes();
  const { activities, loading: activitiesLoading, getRecentActivity } = useActivityLog();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<
    | {
        type: "bookmark" | "highlight";
        item: LibraryBookmark | LibraryHighlight;
      }
    | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");

  const recentActivities = getRecentActivity(20);

  const noteDisplayItems = useMemo<LibraryDisplayItem[]>(
    () =>
      userNotes.map((note) => ({
        id: note.id,
        title: note.tags?.[0] ?? null,
        source_id: note.source_id,
        content: note.content,
        tags: note.tags,
        created_at: note.created_at,
        sermon_title: note.sermon_title ?? null,
      })),
    [userNotes]
  );

  const filteredBookmarks = useMemo(
    () => filterLibraryItems(bookmarks, searchQuery),
    [bookmarks, searchQuery]
  );

  const filteredHighlights = useMemo(
    () => filterLibraryItems(highlights, searchQuery),
    [highlights, searchQuery]
  );

  const filteredNotes = useMemo(
    () => filterLibraryItems(noteDisplayItems, searchQuery),
    [noteDisplayItems, searchQuery]
  );

  const handleDelete = async () => {
    if (!itemToDelete) return;

    const success =
      itemToDelete.type === "bookmark"
        ? await removeBookmark(itemToDelete.item as LibraryBookmark)
        : await removeHighlight(itemToDelete.item as LibraryHighlight);

    if (success) {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (
    type: "bookmark" | "highlight",
    item: LibraryBookmark | LibraryHighlight
  ) => {
    setItemToDelete({ type, item });
    setDeleteDialogOpen(true);
  };

  const formatPendingItem = itemToDelete
    ? formatLibraryItemReference(itemToDelete.item)
    : "this item";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center gap-3 py-3 px-4">
          <BackButton fallbackPath="/more" />
          <div>
            <h1 className="text-2xl font-bold">My Library</h1>
            <p className="text-sm text-muted-foreground">
              Your personal Bible study collection
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-xl mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by text or Bible reference"
              className="pl-9"
              aria-label="Search saved items"
            />
          </div>
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="bookmarks">
              <BookmarkIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Bookmarks</span>
            </TabsTrigger>
            <TabsTrigger value="highlights">
              <Highlighter className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Highlights</span>
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Recent</span>
            </TabsTrigger>
          </TabsList>

          {/* All Tab */}
          <TabsContent value="all" className="space-y-6">
            {/* Bookmarks Section */}
            <LibrarySection
              title="Bookmarks"
              icon={BookmarkIcon}
              items={filteredBookmarks}
              loading={bookmarksLoading}
              onDelete={(item) => openDeleteDialog("bookmark", item)}
              onNavigate={(b) =>
                navigate(
                  `/reader?book=${encodeURIComponent(b.book)}&chapter=${b.chapter}&verse=${b.verse}`
                )
              }
              searchQuery={searchQuery}
            />

            {/* Highlights Section */}
            <LibrarySection
              title="Highlights"
              icon={Highlighter}
              items={filteredHighlights}
              loading={highlightsLoading}
              colorMap={HIGHLIGHT_COLORS}
              onDelete={(item) => openDeleteDialog("highlight", item)}
              onNavigate={(h) =>
                navigate(
                  `/reader?book=${encodeURIComponent(h.book)}&chapter=${h.chapter}&verse=${h.verse}`
                )
              }
              searchQuery={searchQuery}
            />

            {/* Notes Section */}
            <LibrarySection
              title="Notes"
              icon={FileText}
              items={filteredNotes}
              loading={notesLoading}
              onNavigate={() => navigate("/notes")}
              searchQuery={searchQuery}
            />
          </TabsContent>

          {/* Bookmarks Tab */}
          <LibraryTab
            label="Bookmarks"
              icon={BookmarkIcon}
            items={filteredBookmarks}
            loading={bookmarksLoading}
            emptyMessage="Start bookmarking verses to save them for later."
            onDelete={(item) => openDeleteDialog("bookmark", item)}
            onNavigate={(b) =>
              navigate(
                `/reader?book=${encodeURIComponent(b.book)}&chapter=${b.chapter}&verse=${b.verse}`
              )
            }
            searchQuery={searchQuery}
          />

          {/* Highlights Tab */}
          <LibraryTab
            label="Highlights"
              icon={Highlighter}
            items={filteredHighlights}
            loading={highlightsLoading}
            emptyMessage="Start highlighting verses to remember important passages."
            onDelete={(item) => openDeleteDialog("highlight", item)}
            onNavigate={(h) =>
              navigate(
                `/reader?book=${encodeURIComponent(h.book)}&chapter=${h.chapter}&verse=${h.verse}`
              )
            }
            colorMap={HIGHLIGHT_COLORS}
            searchQuery={searchQuery}
          />

          {/* Notes Tab */}
          <LibraryTab
            label="Notes"
              icon={FileText}
            items={filteredNotes}
            loading={notesLoading}
            emptyMessage="Create your first study note to get started."
            onNavigate={() => navigate("/notes")}
            searchQuery={searchQuery}
          />

          {/* Recent Activity Tab */}
          <TabsContent value="recent">
            {activitiesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivities.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground">
                  Your reading activity will appear here.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <Card key={activity.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        {activity.action === "read" && (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        {activity.action === "highlight" && (
                          <Highlighter className="h-4 w-4 text-yellow-500" />
                        )}
                        {activity.action === "bookmark" && (
                          <BookmarkIcon className="h-4 w-4 text-primary" />
                        )}
                        {activity.action === "note" && (
                          <FileText className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium capitalize">
                            {activity.action}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {activity.source_id}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {itemToDelete?.type === "bookmark" ? "Bookmark" : "Highlight"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {formatPendingItem}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* Subcomponent for compact library previews */
function LibrarySection<T extends LibraryDisplayItem = LibraryDisplayItem>({
  title,
  icon: Icon,
  items,
  loading,
  onDelete,
  onNavigate,
  colorMap,
  searchQuery,
}: LibrarySectionProps<T>) {
  const hasSearch = Boolean(searchQuery && searchQuery.trim().length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
          <Badge variant="secondary">{items.length}</Badge>
        </h2>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          {hasSearch
            ? `No ${title.toLowerCase()} match your search.`
            : `No ${title.toLowerCase()} yet`}
        </Card>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => {
            const colorClass =
              "color" in item && item.color && colorMap ? colorMap[item.color] : undefined;
            const { reference, description, note, tags } = getLibraryItemDetails(item);

            return (
              <Card
                key={item.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onNavigate(item)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {colorClass && (
                        <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                      )}
                      {reference && (
                        <span className="font-semibold text-sm">{reference}</span>
                      )}
                    </div>
                    {description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {description}
                      </p>
                    )}
                    {note && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3 mt-2">
                        {note}
                      </p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Subcomponent for tab details */
function LibraryTab<T extends LibraryDisplayItem = LibraryDisplayItem>({
  label,
  icon: Icon,
  items,
  loading,
  emptyMessage,
  onDelete,
  onNavigate,
  colorMap,
  searchQuery,
}: LibraryTabProps<T>) {
  const hasSearch = Boolean(searchQuery && searchQuery.trim().length > 0);

  return (
    <TabsContent value={label.toLowerCase()}>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {hasSearch ? "No Results Found" : `No ${label} Yet`}
          </h3>
          <p className="text-muted-foreground">
            {hasSearch
              ? `Try adjusting your search to find saved ${label.toLowerCase()}.`
              : emptyMessage}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const colorClass =
              "color" in item && item.color && colorMap ? colorMap[item.color] : undefined;
            const { reference, description, note, tags } = getLibraryItemDetails(item);

            return (
              <Card
                key={item.id}
                className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate(item)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {colorClass && (
                        <div className={`w-4 h-4 rounded-full ${colorClass}`} />
                      )}
                      {reference && <span className="font-semibold">{reference}</span>}
                    </div>
                    {description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                        {description}
                      </p>
                    )}
                    {note && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
                        {note}
                      </p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </TabsContent>
  );
}

function filterLibraryItems<T extends LibraryDisplayItem>(items: T[], query: string): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => matchesLibraryItemQuery(item, normalizedQuery));
}

function matchesLibraryItemQuery(item: LibraryDisplayItem, normalizedQuery: string): boolean {
  const { reference, description, note, tags } = getLibraryItemDetails(item);
  const searchableValues: string[] = [];

  const addValue = (value?: string | number | null) => {
    if (value === null || value === undefined) return;

    const normalized = String(value).trim().toLowerCase();
    if (normalized) {
      searchableValues.push(normalized);
    }
  };

  addValue(reference);
  addValue(description);
  addValue(note);

  tags.forEach(addValue);

  if ("source_id" in item) {
    addValue(item.source_id);
  }

  if ("sermon_title" in item) {
    addValue(item.sermon_title);
  }

  if ("title" in item) {
    addValue(item.title);
  }

  if ("content" in item) {
    addValue(item.content);
  }

  if ("verse_text" in item) {
    addValue(item.verse_text);
  }

  if ("note" in item) {
    addValue(item.note);
  }

  if ("book" in item && typeof item.book === "string" && item.book.trim().length > 0) {
    const book = item.book.trim();
    addValue(book);

    if ("chapter" in item && typeof item.chapter === "number") {
      addValue(`${book} ${item.chapter}`);

      if ("verse" in item && typeof item.verse === "number") {
        addValue(`${book} ${item.chapter}:${item.verse}`);
      }
    }
  }

  if ("chapter" in item && typeof item.chapter === "number") {
    addValue(item.chapter);
  }

  if ("verse" in item && typeof item.verse === "number") {
    addValue(item.verse);
  }

  if (
    "chapter" in item &&
    typeof item.chapter === "number" &&
    "verse" in item &&
    typeof item.verse === "number"
  ) {
    addValue(`${item.chapter}:${item.verse}`);
  }

  return searchableValues.some((value) => value.includes(normalizedQuery));
}

function formatLibraryItemReference(item: LibraryDisplayItem): string {
  if (
    "book" in item &&
    typeof item.book === "string" &&
    item.book.trim().length > 0 &&
    "chapter" in item &&
    typeof item.chapter === "number" &&
    "verse" in item &&
    typeof item.verse === "number"
  ) {
    return `${item.book} ${item.chapter}:${item.verse}`;
  }

  if ("source_id" in item && typeof item.source_id === "string" && item.source_id.trim().length > 0) {
    return item.source_id;
  }

  if ("title" in item && typeof item.title === "string" && item.title.trim().length > 0) {
    return item.title;
  }

  return "this item";
}

function getLibraryItemDetails(item: LibraryDisplayItem) {
  const reference = formatLibraryItemReference(item);

  const description = (() => {
    if ("verse_text" in item && typeof item.verse_text === "string" && item.verse_text.trim()) {
      return item.verse_text.trim();
    }
    if ("content" in item && typeof item.content === "string" && item.content.trim()) {
      return item.content.trim();
    }
    return undefined;
  })();

  const note =
    "note" in item && typeof item.note === "string" && item.note.trim().length > 0
      ? item.note.trim()
      : undefined;

  const tags =
    "tags" in item && Array.isArray(item.tags)
      ? item.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      : [];

  return { reference, description, note, tags };
}
