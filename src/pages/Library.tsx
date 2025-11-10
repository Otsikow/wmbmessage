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
  Download,
  FileDown,
  FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  note?: string | null;
  verse_text?: string | null;
  book?: string;
  chapter?: number;
  verse?: number;
};

interface LibrarySectionProps<T extends LibraryDisplayItem = LibraryDisplayItem> {
  title: string;
  icon: LucideIcon;
  items: T[];
  loading: boolean;
  onDelete?: (item: T) => void;
  onNavigate: (item: T) => void;
  colorMap?: Record<string, string>;
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
      })),
    [userNotes]
  );

  const totalLibraryItems =
    bookmarks.length + highlights.length + noteDisplayItems.length;

  const isLoadingData = bookmarksLoading || highlightsLoading || notesLoading;

  const buildExportData = () => ({
    generatedAt: new Date().toISOString(),
    totals: {
      bookmarks: bookmarks.length,
      highlights: highlights.length,
      notes: userNotes.length,
    },
    bookmarks: bookmarks.map((bookmark) => ({
      ...bookmark,
      reference: formatLibraryItemReference(bookmark),
    })),
    highlights: highlights.map((highlight) => ({
      ...highlight,
      reference: formatLibraryItemReference(highlight),
    })),
    notes: userNotes.map((note) => ({
      ...note,
      tags: Array.isArray(note.tags) ? note.tags : [],
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
      const exportData = buildExportData();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sermon-scrolls-library-${new Date()
        .toISOString()
        .split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export ready",
        description: "Your library has been saved as a JSON file.",
      });
    } catch (error) {
      console.error("Failed to export library as JSON", error);
      toast({
        title: "Export failed",
        description: "We couldn't export your library. Please try again.",
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

      const appendWrappedLines = (text: string) => {
        wrapTextForPdf(text).forEach((line) => {
          pdfLines.push(line);
        });
      };

      appendWrappedLines("My Library Export");
      appendWrappedLines(`Generated on ${new Date().toLocaleString()}`);
      pdfLines.push("");

      const appendSection = <T extends LibraryDisplayItem>(
        title: string,
        items: T[],
        formatter?: (item: T) => string | undefined
      ) => {
        appendWrappedLines(title);

        if (items.length === 0) {
          appendWrappedLines("No entries available yet.");
          pdfLines.push("");
          return;
        }

        items.forEach((item, index) => {
          const { reference, description, note, tags } = getLibraryItemDetails(item);
          appendWrappedLines(`${index + 1}. ${reference}`);

          if (description) {
            appendWrappedLines(description);
          }

          if (note) {
            appendWrappedLines(`Note: ${note}`);
          }

          if (formatter) {
            const extra = formatter(item);
            if (extra) {
              appendWrappedLines(extra);
            }
          }

          if (tags.length > 0) {
            appendWrappedLines(`Tags: ${tags.join(", ")}`);
          }

          appendWrappedLines(
            `Saved on ${"created_at" in item && item.created_at
              ? new Date(item.created_at).toLocaleString()
              : "Unknown date"}`
          );

          pdfLines.push("");
        });

        pdfLines.push("");
      };

      appendSection("Bookmarks", bookmarks);
      appendSection("Highlights", highlights, (item) =>
        "color" in item && item.color ? `Highlight color: ${item.color}` : undefined
      );
      appendSection("Notes", noteDisplayItems, (item) =>
        "source_id" in item && item.source_id ? `Source: ${item.source_id}` : undefined
      );

      const pdfBlob = generateSimplePdf(pdfLines);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sermon-scrolls-library-${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export ready",
        description: "Your library has been saved as a PDF file.",
      });
    } catch (error) {
      console.error("Failed to export library as PDF", error);
      toast({
        title: "Export failed",
        description: "We couldn't export your library. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

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
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isExporting || isLoadingData}
                >
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
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleExportPDF();
                  }}
                  disabled={isExporting || isLoadingData}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleExportJSON();
                  }}
                  disabled={isExporting || isLoadingData}
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
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
              items={bookmarks}
              loading={bookmarksLoading}
              onDelete={(item) => openDeleteDialog("bookmark", item)}
              onNavigate={(b) =>
                navigate(
                  `/reader?book=${encodeURIComponent(b.book)}&chapter=${b.chapter}&verse=${b.verse}`
                )
              }
            />

            {/* Highlights Section */}
            <LibrarySection
              title="Highlights"
              icon={Highlighter}
              items={highlights}
              loading={highlightsLoading}
              colorMap={HIGHLIGHT_COLORS}
              onDelete={(item) => openDeleteDialog("highlight", item)}
              onNavigate={(h) =>
                navigate(
                  `/reader?book=${encodeURIComponent(h.book)}&chapter=${h.chapter}&verse=${h.verse}`
                )
              }
            />

            {/* Notes Section */}
            <LibrarySection
              title="Notes"
              icon={FileText}
              items={noteDisplayItems}
              loading={notesLoading}
              onNavigate={() => navigate("/notes")}
            />
          </TabsContent>

          {/* Bookmarks Tab */}
          <LibraryTab
            label="Bookmarks"
              icon={BookmarkIcon}
            items={bookmarks}
            loading={bookmarksLoading}
            emptyMessage="Start bookmarking verses to save them for later."
            onDelete={(item) => openDeleteDialog("bookmark", item)}
            onNavigate={(b) =>
              navigate(
                `/reader?book=${encodeURIComponent(b.book)}&chapter=${b.chapter}&verse=${b.verse}`
              )
            }
          />

          {/* Highlights Tab */}
          <LibraryTab
            label="Highlights"
              icon={Highlighter}
            items={highlights}
            loading={highlightsLoading}
            emptyMessage="Start highlighting verses to remember important passages."
            onDelete={(item) => openDeleteDialog("highlight", item)}
            onNavigate={(h) =>
              navigate(
                `/reader?book=${encodeURIComponent(h.book)}&chapter=${h.chapter}&verse=${h.verse}`
              )
            }
            colorMap={HIGHLIGHT_COLORS}
          />

          {/* Notes Tab */}
          <LibraryTab
            label="Notes"
              icon={FileText}
            items={noteDisplayItems}
            loading={notesLoading}
            emptyMessage="Create your first study note to get started."
            onNavigate={() => navigate("/notes")}
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
}: LibrarySectionProps<T>) {
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
          No {title.toLowerCase()} yet
        </Card>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => {
            const colorClass = 'color' in item && item.color && colorMap ? colorMap[item.color] : undefined;
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
}: LibraryTabProps<T>) {
  return (
    <TabsContent value={label.toLowerCase()}>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No {label} Yet</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const colorClass = 'color' in item && item.color && colorMap ? colorMap[item.color] : undefined;
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

function formatLibraryItemReference(item: LibraryDisplayItem): string {
  if (item.book && item.chapter && item.verse) {
    return `${item.book} ${item.chapter}:${item.verse}`;
  }

  if (typeof item.source_id === "string" && item.source_id.trim().length > 0) {
    return item.source_id;
  }

  if (typeof item.title === "string" && item.title.trim().length > 0) {
    return item.title;
  }

  return "this item";
}

function getLibraryItemDetails(item: LibraryDisplayItem) {
  const reference = formatLibraryItemReference(item);

  const description = (() => {
    if (typeof item.verse_text === "string" && item.verse_text.trim().length > 0) {
      return item.verse_text.trim();
    }
    if (typeof item.content === "string" && item.content.trim().length > 0) {
      return item.content.trim();
    }
    return undefined;
  })();

  const note =
    typeof item.note === "string" && item.note.trim().length > 0
      ? item.note.trim()
      : undefined;

  const tags = Array.isArray(item.tags)
    ? item.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0)
    : [];

  return { reference, description, note, tags };
}

function wrapTextForPdf(text: string, maxLength = 90): string[] {
  const segments = String(text).split(/\r?\n/);
  const wrapped: string[] = [];

  segments.forEach((segment) => {
    if (segment.trim().length === 0) {
      wrapped.push("");
      return;
    }

    const words = segment.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      wrapped.push("");
      return;
    }

    let currentLine = "";

    const pushCurrentLine = () => {
      if (currentLine.length > 0) {
        wrapped.push(currentLine);
        currentLine = "";
      }
    };

    words.forEach((word) => {
      if (word.length > maxLength) {
        pushCurrentLine();
        for (let i = 0; i < word.length; i += maxLength) {
          wrapped.push(word.slice(i, i + maxLength));
        }
        return;
      }

      if (currentLine.length === 0) {
        currentLine = word;
        return;
      }

      if ((currentLine + " " + word).length <= maxLength) {
        currentLine = `${currentLine} ${word}`;
      } else {
        wrapped.push(currentLine);
        currentLine = word;
      }
    });

    pushCurrentLine();
  });

  return wrapped;
}

function generateSimplePdf(lines: string[]): Blob {
  const sanitizedLines = (lines.length > 0 ? lines : [""]).map((line) =>
    typeof line === "string" ? line : String(line)
  );

  const pageWidth = 612; // 8.5 inches
  const pageHeight = 792; // 11 inches
  const margin = 72; // 1 inch margins
  const fontSize = 12;
  const lineHeight = 16;
  const linesPerPage = Math.max(1, Math.floor((pageHeight - margin * 2) / lineHeight));

  const pages: string[][] = [];
  for (let i = 0; i < sanitizedLines.length; i += linesPerPage) {
    pages.push(sanitizedLines.slice(i, i + linesPerPage));
  }

  const objects: { id: number; content: string }[] = [];
  const reserveObject = () => {
    const id = objects.length + 1;
    objects.push({ id, content: "" });
    return id;
  };
  const addObject = (content: string) => {
    const id = objects.length + 1;
    objects.push({ id, content });
    return id;
  };

  const catalogId = reserveObject();
  const pagesId = reserveObject();
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  const encoder = new TextEncoder();
  const pageIds: number[] = [];

  pages.forEach((pageLines) => {
    const streamParts: string[] = [
      "BT",
      `/F1 ${fontSize} Tf`,
      `${lineHeight} TL`,
      `1 0 0 1 ${margin} ${pageHeight - margin} Tm`,
    ];

    pageLines.forEach((line, index) => {
      const escaped = escapePdfText(line);
      const safeLine = escaped.length === 0 ? " " : escaped;

      if (index === 0) {
        streamParts.push(`(${safeLine}) Tj`);
      } else {
        streamParts.push("T*");
        streamParts.push(`(${safeLine}) Tj`);
      }
    });

    streamParts.push("ET");

    const streamContent = streamParts.join("\n");
    const streamLength = encoder.encode(streamContent).length;

    const contentId = addObject(
      `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`
    );

    const pageContent = [
      "<< /Type /Page",
      `/Parent ${pagesId} 0 R`,
      "/MediaBox [0 0 612 792]",
      `/Contents ${contentId} 0 R`,
      `/Resources << /Font << /F1 ${fontId} 0 R >> >>`,
      ">>",
    ].join("\n");

    const pageId = addObject(pageContent);
    pageIds.push(pageId);
  });

  objects[pagesId - 1].content = [
    "<< /Type /Pages",
    `/Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}]`,
    `/Count ${pageIds.length}`,
    ">>",
  ].join("\n");

  objects[catalogId - 1].content = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let pdf = "%PDF-1.4\n";
  const xrefPositions: number[] = [0];

  objects.forEach((obj) => {
    xrefPositions.push(pdf.length);
    pdf += `${obj.id} 0 obj\n${obj.content}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i += 1) {
    const offset = xrefPositions[i];
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function escapePdfText(text: string): string {
  return String(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
