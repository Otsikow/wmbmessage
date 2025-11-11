import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BookmarkIcon,
  Highlighter,
  FileText,
  Clock,
  Loader2,
  Trash2,
  Download,
  FileDown,
  FileJson,
  Search,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BackButton from "@/components/BackButton";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

const HIGHLIGHT_COLORS = {
  yellow: "bg-yellow-200 dark:bg-yellow-900",
  green: "bg-green-200 dark:bg-green-900",
  blue: "bg-blue-200 dark:bg-blue-900",
  pink: "bg-pink-200 dark:bg-pink-900",
  purple: "bg-purple-200 dark:bg-purple-900",
  orange: "bg-orange-200 dark:bg-orange-900",
};

type LibraryDisplayItem =
  | LibraryBookmark
  | LibraryHighlight
  | {
      id: string;
      title?: string | null;
      content?: string | null;
      source_id?: string | null;
      tags?: string[];
      created_at?: string;
      note?: string | null;
      verse_text?: string | null;
      book?: string;
      chapter?: number;
      verse?: number;
      sermon_title?: string | null;
    };

type LibraryItemType = "bookmark" | "highlight" | "note";
type SortOption = "date" | "book" | "type";

interface CombinedLibraryItem {
  type: LibraryItemType;
  item: LibraryDisplayItem;
}

interface LibrarySectionProps<T extends LibraryDisplayItem = LibraryDisplayItem> {
  title: string;
  icon: LucideIcon;
  items: T[];
  loading: boolean;
  onDelete?: (item: T) => void;
  onNavigate: (item: T) => void;
  colorMap?: Record<string, string>;
  searchQuery?: string;
  sectionType: LibraryItemType;
  onUpdateHighlight?: (item: LibraryHighlight, note: string) => Promise<boolean>;
  onUpdateNote?: (item: T, content: string) => Promise<boolean>;
  showTypeBadge?: boolean;
  emptyMessage?: string;
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
    updateHighlight,
  } = useLibraryItems();
  const { userNotes, loading: notesLoading, updateUserNote } = useUserNotes();
  const { activities, loading: activitiesLoading, getRecentActivity } = useActivityLog();
  const { toast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<
    | {
        type: "bookmark" | "highlight";
        item: LibraryBookmark | LibraryHighlight;
      }
    | null
  >(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date");

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

  const totalLibraryItems =
    bookmarks.length + highlights.length + noteDisplayItems.length;
  const isLoadingData = bookmarksLoading || highlightsLoading || notesLoading;

  /* ------------------------- EXPORT FUNCTIONS ------------------------- */
  const buildExportData = () => ({
    generatedAt: new Date().toISOString(),
    totals: {
      bookmarks: bookmarks.length,
      highlights: highlights.length,
      notes: userNotes.length,
    },
    bookmarks: bookmarks.map((b) => ({ ...b, reference: formatLibraryItemReference(b) })),
    highlights: highlights.map((h) => ({ ...h, reference: formatLibraryItemReference(h) })),
    notes: userNotes.map((n) => ({
      ...n,
      tags: Array.isArray(n.tags) ? n.tags : [],
    })),
  });

  const handleExportJSON = async () => {
    if (totalLibraryItems === 0) {
      toast({
        title: "Nothing to export",
        description: "Add bookmarks, highlights, or notes before exporting.",
      });
      return;
    }
    try {
      setIsExporting(true);
      const blob = new Blob([JSON.stringify(buildExportData(), null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `library-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Export successful", description: "Library saved as JSON file." });
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Something went wrong exporting your data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (totalLibraryItems === 0) {
      toast({
        title: "Nothing to export",
        description: "Add bookmarks, highlights, or notes before exporting.",
      });
      return;
    }

    try {
      setIsExporting(true);
      const pdfLines: string[] = [];
      const add = (t: string) => wrapTextForPdf(t).forEach((x) => pdfLines.push(x));

      add("My Library Export");
      add(`Generated on ${new Date().toLocaleString()}`);
      pdfLines.push("");

      const append = (title: string, items: LibraryDisplayItem[]) => {
        add(title);
        if (items.length === 0) {
          add("No entries available.");
          pdfLines.push("");
          return;
        }
        items.forEach((item, i) => {
          const { reference, description, note, tags } = getLibraryItemDetails(item);
          add(`${i + 1}. ${reference}`);
          if (description) add(description);
          if (note) add(`Note: ${note}`);
          if (tags.length > 0) add(`Tags: ${tags.join(", ")}`);
          pdfLines.push("");
        });
      };

      append("Bookmarks", bookmarks);
      append("Highlights", highlights);
      append("Notes", noteDisplayItems);

      const pdfBlob = generateSimplePdf(pdfLines);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `library-export-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({ title: "Export successful", description: "Library saved as PDF file." });
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Unable to create PDF file.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  /* ------------------------- SEARCH FILTERING ------------------------- */
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

  const sortedBookmarks = useMemo(
    () => sortLibraryItems(filteredBookmarks, sortOption),
    [filteredBookmarks, sortOption]
  );
  const sortedHighlights = useMemo(
    () => sortLibraryItems(filteredHighlights, sortOption),
    [filteredHighlights, sortOption]
  );
  const sortedNotes = useMemo(
    () => sortLibraryItems(filteredNotes, sortOption),
    [filteredNotes, sortOption]
  );

  const combinedItems = useMemo(
    () =>
      sortCombinedLibraryItems(
        [
          ...filteredBookmarks.map((item) => ({ type: "bookmark" as const, item })),
          ...filteredHighlights.map((item) => ({ type: "highlight" as const, item })),
          ...filteredNotes.map((item) => ({ type: "note" as const, item })),
        ],
        sortOption
      ),
    [filteredBookmarks, filteredHighlights, filteredNotes, sortOption]
  );

  const handleHighlightEdit = useCallback(
    async (item: LibraryHighlight, noteValue: string) => {
      const normalized = noteValue.trim();
      return updateHighlight(item, { note: normalized.length > 0 ? normalized : null });
    },
    [updateHighlight]
  );

  const handleNoteEdit = useCallback(
    async (item: LibraryDisplayItem, content: string) => {
      if (!item.id) return false;
      const result = await updateUserNote(item.id, { content });
      return Boolean(result);
    },
    [updateUserNote]
  );

  /* ------------------------- DELETE HANDLER ------------------------- */
  const handleDelete = async () => {
    if (!itemToDelete) return;
    const ok =
      itemToDelete.type === "bookmark"
        ? await removeBookmark(itemToDelete.item)
        : await removeHighlight(itemToDelete.item as LibraryHighlight);
    if (ok) {
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

  /* ------------------------- RENDER ------------------------- */
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
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting || isLoadingData}>
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    void handleExportPDF();
                  }}
                >
                  <FileDown className="mr-2 h-4 w-4" /> Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    void handleExportJSON();
                  }}
                >
                  <FileJson className="mr-2 h-4 w-4" /> Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved items..."
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Added</SelectItem>
                <SelectItem value="book">Book</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="bookmarks">
              <BookmarkIcon className="h-4 w-4 mr-1" /> Bookmarks
            </TabsTrigger>
            <TabsTrigger value="highlights">
              <Highlighter className="h-4 w-4 mr-1" /> Highlights
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-1" /> Notes
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-1" /> Recent
            </TabsTrigger>
          </TabsList>

          {/* Combined View */}
          <TabsContent value="all">
            {isLoadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : combinedItems.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Your library is empty</h3>
                <p className="text-muted-foreground">
                  Add bookmarks, highlights, or notes to see them here.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {combinedItems.map(({ type, item }) => {
                  const highlight = type === "highlight" ? (item as LibraryHighlight) : null;
                  const colorClass = highlight?.color
                    ? HIGHLIGHT_COLORS[highlight.color] ?? undefined
                    : undefined;

                  return (
                    <LibraryItemCard
                      key={`${type}-${item.id}`}
                      item={item}
                      itemType={type}
                      colorClass={colorClass}
                      showTypeBadge
                      onNavigate={(selected) => {
                        if (type === "note") {
                          navigate("/notes");
                          return;
                        }
                        const target = selected as LibraryBookmark;
                        navigate(
                          `/reader?book=${encodeURIComponent(target.book)}&chapter=${target.chapter}&verse=${target.verse}`
                        );
                      }}
                      onDelete={
                        type === "note"
                          ? undefined
                          : (selected) =>
                              openDeleteDialog(
                                type,
                                selected as LibraryBookmark | LibraryHighlight
                              )
                      }
                      onUpdateHighlight={type === "highlight" ? handleHighlightEdit : undefined}
                      onUpdateNote={type === "note" ? handleNoteEdit : undefined}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Notes / Bookmarks / Highlights Individual Tabs */}
          <LibraryTab
            label="Bookmarks"
            icon={BookmarkIcon}
            items={sortedBookmarks}
            loading={bookmarksLoading}
            emptyMessage="Start bookmarking verses to save them for later."
            onDelete={(i) => openDeleteDialog("bookmark", i)}
            onNavigate={(b) =>
              navigate(
                `/reader?book=${encodeURIComponent(b.book)}&chapter=${b.chapter}&verse=${b.verse}`
              )
            }
            sectionType="bookmark"
          />

          <LibraryTab
            label="Highlights"
            icon={Highlighter}
            items={sortedHighlights}
            loading={highlightsLoading}
            emptyMessage="Start highlighting verses to remember important passages."
            onDelete={(i) => openDeleteDialog("highlight", i)}
            onNavigate={(h) =>
              navigate(
                `/reader?book=${encodeURIComponent(h.book)}&chapter=${h.chapter}&verse=${h.verse}`
              )
            }
            colorMap={HIGHLIGHT_COLORS}
            sectionType="highlight"
            onUpdateHighlight={handleHighlightEdit}
          />

          <LibraryTab
            label="Notes"
            icon={FileText}
            items={sortedNotes}
            loading={notesLoading}
            emptyMessage="Create your first study note to get started."
            onNavigate={() => navigate("/notes")}
            sectionType="note"
            onUpdateNote={handleNoteEdit}
          />

          {/* Recent Activity */}
          <TabsContent value="recent">
            {activitiesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivities.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground">Your reading activity will appear here.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((a) => (
                  <Card key={a.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        {a.action === "read" && <Clock className="h-4 w-4 text-muted-foreground" />}
                        {a.action === "highlight" && (
                          <Highlighter className="h-4 w-4 text-yellow-500" />
                        )}
                        {a.action === "bookmark" && (
                          <BookmarkIcon className="h-4 w-4 text-primary" />
                        )}
                        {a.action === "note" && <FileText className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium capitalize">{a.action}</span>{" "}
                          <span className="text-muted-foreground">{a.source_id}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {itemToDelete?.type === "bookmark" ? "Bookmark" : "Highlight"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {formatPendingItem}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------- COMPONENTS ------------------------- */

function LibrarySection<T extends LibraryDisplayItem>({
  title,
  icon: Icon,
  items,
  loading,
  onDelete,
  onNavigate,
  colorMap,
  sectionType,
  onUpdateHighlight,
  onUpdateNote,
  showTypeBadge,
  emptyMessage,
}: LibrarySectionProps<T>) {
  if (loading) {
    return (
      <Card className="p-12 text-center">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Icon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No {title}</h3>
        <p className="text-muted-foreground">
          {emptyMessage ?? `No ${title.toLowerCase()} found.`}
        </p>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </h2>
      <div className="grid gap-3">
        {items.map((item) => {
          const highlight =
            sectionType === "highlight" && "color" in item
              ? (item as unknown as LibraryHighlight)
              : null;
          const colorClass = highlight && colorMap ? colorMap[highlight.color] : undefined;

          return (
            <LibraryItemCard
              key={item.id}
              item={item}
              itemType={sectionType}
              colorClass={colorClass}
              onNavigate={onNavigate}
              onDelete={onDelete}
              onUpdateHighlight={sectionType === "highlight" ? onUpdateHighlight : undefined}
              onUpdateNote={sectionType === "note" ? onUpdateNote : undefined}
              showTypeBadge={showTypeBadge}
            />
          );
        })}
      </div>
    </div>
  );
}

function LibraryTab<T extends LibraryDisplayItem>({
  label,
  icon: Icon,
  items,
  loading,
  emptyMessage,
  onDelete,
  onNavigate,
  colorMap,
  sectionType,
  onUpdateHighlight,
  onUpdateNote,
  showTypeBadge,
}: LibraryTabProps<T>) {
  return (
    <TabsContent value={label.toLowerCase()}>
      <LibrarySection
        title={label}
        icon={Icon}
        items={items}
        loading={loading}
        onDelete={onDelete}
        onNavigate={onNavigate}
        colorMap={colorMap}
        sectionType={sectionType}
        onUpdateHighlight={onUpdateHighlight}
        onUpdateNote={onUpdateNote}
        showTypeBadge={showTypeBadge}
        emptyMessage={emptyMessage}
      />
    </TabsContent>
  );
}

interface LibraryItemCardProps<T extends LibraryDisplayItem> {
  item: T;
  itemType: LibraryItemType;
  onNavigate: (item: T) => void;
  onDelete?: (item: T) => void;
  colorClass?: string;
  onUpdateHighlight?: (item: LibraryHighlight, note: string) => Promise<boolean>;
  onUpdateNote?: (item: T, content: string) => Promise<boolean>;
  showTypeBadge?: boolean;
}

function LibraryItemCard<T extends LibraryDisplayItem>({
  item,
  itemType,
  onNavigate,
  onDelete,
  colorClass,
  onUpdateHighlight,
  onUpdateNote,
  showTypeBadge,
}: LibraryItemCardProps<T>) {
  const { reference, description, note, tags } = getLibraryItemDetails(item);

  const isHighlight = itemType === "highlight";
  const isNote = itemType === "note";
  const isEditable = isHighlight || isNote;

  const initialText = useMemo(() => {
    if (isHighlight) {
      return typeof (item as LibraryHighlight).note === "string"
        ? ((item as LibraryHighlight).note as string)
        : "";
    }
    if ("content" in item && typeof item.content === "string") {
      return item.content;
    }
    return "";
  }, [isHighlight, item]);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialText);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(initialText);
    }
  }, [initialText, isEditing]);

  const handleStartEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsEditing(true);
    setEditValue(initialText);
  };

  const handleCancelEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setEditValue(initialText);
    setIsEditing(false);
  };

  const handleSaveEdit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!isEditable || isSaving) return;

    setIsSaving(true);
    try {
      let success = true;
      if (isHighlight && onUpdateHighlight) {
        success = await onUpdateHighlight(item as LibraryHighlight, editValue);
      } else if (isNote && onUpdateNote) {
        success = await onUpdateNote(item, editValue);
      }

      if (success) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = editValue !== initialText;

  const typeLabel: Record<LibraryItemType, string> = {
    bookmark: "Bookmark",
    highlight: "Highlight",
    note: "Note",
  };

  const cardClasses = [
    "p-4",
    "transition-shadow",
    colorClass ?? "",
    isEditing ? "" : "cursor-pointer hover:shadow-md",
  ]
    .filter(Boolean)
    .join(" ");

  const renderDescription = () => {
    if (itemType === "note") {
      if (isEditing) {
        return null;
      }
      return description ? (
        <p className="text-sm text-muted-foreground whitespace-pre-line mb-2">
          {description}
        </p>
      ) : null;
    }

    return description ? (
      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
    ) : null;
  };

  const renderNoteContent = () => {
    if (isHighlight) {
      if (isEditing) {
        return (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            rows={3}
            placeholder="Add a note about this highlight"
          />
        );
      }

      return note ? (
        <p className="text-xs text-muted-foreground italic mb-2">Note: {note}</p>
      ) : null;
    }

    if (isNote) {
      if (isEditing) {
        return (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            rows={4}
            placeholder="Update your note"
          />
        );
      }

      return null;
    }

    return note ? (
      <p className="text-xs text-muted-foreground italic mb-2">Note: {note}</p>
    ) : null;
  };

  const renderTags = () => {
    if (tags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((tag, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Card
      className={cardClasses}
      onClick={() => {
        if (!isEditing) {
          onNavigate(item);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm truncate">{reference}</p>
            {showTypeBadge && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                {typeLabel[itemType]}
              </Badge>
            )}
          </div>
          {renderDescription()}
          {renderNoteContent()}
          {renderTags()}
        </div>
        <div className="flex items-center gap-1">
          {isEditable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleStartEdit}
              disabled={isEditing}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {isEditable && isEditing && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSaveEdit}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      )}
    </Card>
  );
}

/* ------------------------- Helper Functions ------------------------- */

function filterLibraryItems<T extends LibraryDisplayItem>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((i) => {
    const { reference, description, note, tags } = getLibraryItemDetails(i);
    const combined = [reference, description, note, ...(tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return combined.includes(q);
  });
}

function sortLibraryItems<T extends LibraryDisplayItem>(items: T[], option: SortOption): T[] {
  const sorted = [...items];
  if (option === "book") {
    return sorted.sort((a, b) => {
      const bookCompare = getItemBookSortKey(a).localeCompare(getItemBookSortKey(b));
      if (bookCompare !== 0) return bookCompare;
      return getItemDateValue(b) - getItemDateValue(a);
    });
  }

  if (option === "date" || option === "type") {
    return sorted.sort((a, b) => {
      const dateDiff = getItemDateValue(b) - getItemDateValue(a);
      if (dateDiff !== 0) return dateDiff;
      return getItemBookSortKey(a).localeCompare(getItemBookSortKey(b));
    });
  }

  return sorted;
}

function sortCombinedLibraryItems(items: CombinedLibraryItem[], option: SortOption): CombinedLibraryItem[] {
  const sorted = [...items];

  if (option === "type") {
    const typeOrder: Record<LibraryItemType, number> = {
      bookmark: 0,
      highlight: 1,
      note: 2,
    };

    return sorted.sort((a, b) => {
      const typeDiff = typeOrder[a.type] - typeOrder[b.type];
      if (typeDiff !== 0) return typeDiff;

      const dateDiff = getItemDateValue(b.item) - getItemDateValue(a.item);
      if (dateDiff !== 0) return dateDiff;

      return getItemBookSortKey(a.item).localeCompare(getItemBookSortKey(b.item));
    });
  }

  if (option === "book") {
    return sorted.sort((a, b) => {
      const bookCompare = getItemBookSortKey(a.item).localeCompare(getItemBookSortKey(b.item));
      if (bookCompare !== 0) return bookCompare;
      return getItemDateValue(b.item) - getItemDateValue(a.item);
    });
  }

  return sorted.sort((a, b) => {
    const dateDiff = getItemDateValue(b.item) - getItemDateValue(a.item);
    if (dateDiff !== 0) return dateDiff;
    return getItemBookSortKey(a.item).localeCompare(getItemBookSortKey(b.item));
  });
}

function getItemDateValue(item: LibraryDisplayItem): number {
  const updatedAt = 'updated_at' in item ? (item as { updated_at?: string | null }).updated_at : undefined;
  const createdAt = 'created_at' in item ? (item as { created_at?: string | null }).created_at : undefined;
  const dateString = updatedAt || createdAt;
  return dateString ? new Date(dateString).getTime() : 0;
}

function getItemBookSortKey(item: LibraryDisplayItem): string {
  if ('book' in item && item.book) {
    const chapter = 'chapter' in item && typeof item.chapter === 'number' ? item.chapter : 0;
    const verse = 'verse' in item && typeof item.verse === 'number' ? item.verse : 0;
    return `${item.book.toLowerCase()}-${chapter.toString().padStart(3, '0')}-${verse
      .toString()
      .padStart(3, '0')}`;
  }

  if ('source_id' in item && item.source_id) {
    return item.source_id.toLowerCase();
  }

  if ('title' in item && item.title) {
    return item.title.toLowerCase();
  }

  return formatLibraryItemReference(item).toLowerCase();
}

function formatLibraryItemReference(item: LibraryDisplayItem): string {
  if ('book' in item && 'chapter' in item && 'verse' in item && item.book && item.chapter && item.verse) {
    return `${item.book} ${item.chapter}:${item.verse}`;
  }
  if ('source_id' in item && item.source_id) return item.source_id;
  if ('title' in item && item.title) return item.title;
  return "this item";
}

function getLibraryItemDetails(item: LibraryDisplayItem) {
  const reference = formatLibraryItemReference(item);
  const verse_text = 'verse_text' in item ? item.verse_text : undefined;
  const content = 'content' in item ? item.content : undefined;
  const description = verse_text?.trim() || content?.trim() || undefined;
  const note = 'note' in item && item.note ? item.note.trim() : undefined;
  const itemTags = 'tags' in item ? item.tags : undefined;
  const tags = Array.isArray(itemTags)
    ? itemTags.filter((t) => typeof t === "string" && t.trim().length > 0)
    : [];
  return { reference, description, note, tags };
}

function wrapTextForPdf(text: string, max = 90): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
    } else {
      line += " " + w;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function generateSimplePdf(lines: string[]): Blob {
  const text = lines.join("\n");
  const pdf = [
    "%PDF-1.4",
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj",
    `4 0 obj << /Length ${text.length + 20} >> stream\nBT /F1 12 Tf 50 750 Td (${escapePdfText(
      text
    )}) Tj ET\nendstream endobj`,
    "xref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000120 00000 n \n0000000220 00000 n \ntrailer << /Size 5 /Root 1 0 R >>\nstartxref\n320\n%%EOF",
  ].join("\n");
  return new Blob([pdf], { type: "application/pdf" });
}

function escapePdfText(text: string) {
  return text.replace(/[\\()]/g, (m) => "\\" + m);
}
