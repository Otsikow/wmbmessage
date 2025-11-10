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

  /* ------------------------- DELETE HANDLER ------------------------- */
  const handleDelete = async () => {
    if (!itemToDelete) return;
    const ok =
      itemToDelete.type === "bookmark"
        ? await removeBookmark(itemToDelete.item)
        : await removeHighlight(itemToDelete.item);
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
        <div className="max-w-xl mb-6 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved items..."
            className="pl-9"
          />
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
          <TabsContent value="all" className="space-y-6">
            <LibrarySection
              title="Bookmarks"
              icon={BookmarkIcon}
              items={filteredBookmarks}
              loading={bookmarksLoading}
              onDelete={(i) => openDeleteDialog("bookmark", i)}
              onNavigate={(b) =>
                navigate(
                  `/reader?book=${encodeURIComponent(b.book)}&chapter=${b.chapter}&verse=${b.verse}`
                )
              }
            />
            <LibrarySection
              title="Highlights"
              icon={Highlighter}
              items={filteredHighlights}
              loading={highlightsLoading}
              colorMap={HIGHLIGHT_COLORS}
              onDelete={(i) => openDeleteDialog("highlight", i)}
              onNavigate={(h) =>
                navigate(
                  `/reader?book=${encodeURIComponent(h.book)}&chapter=${h.chapter}&verse=${h.verse}`
                )
              }
            />
            <LibrarySection
              title="Notes"
              icon={FileText}
              items={filteredNotes}
              loading={notesLoading}
              onNavigate={() => navigate("/notes")}
            />
          </TabsContent>

          {/* Notes / Bookmarks / Highlights Individual Tabs */}
          <LibraryTab
            label="Bookmarks"
            icon={BookmarkIcon}
            items={filteredBookmarks}
            loading={bookmarksLoading}
            emptyMessage="Start bookmarking verses to save them for later."
            onDelete={(i) => openDeleteDialog("bookmark", i)}
            onNavigate={(b) =>
              navigate(
                `/reader?book=${encodeURIComponent(b.book)}&chapter=${b.chapter}&verse=${b.verse}`
              )
            }
          />

          <LibraryTab
            label="Highlights"
            icon={Highlighter}
            items={filteredHighlights}
            loading={highlightsLoading}
            emptyMessage="Start highlighting verses to remember important passages."
            onDelete={(i) => openDeleteDialog("highlight", i)}
            onNavigate={(h) =>
              navigate(
                `/reader?book=${encodeURIComponent(h.book)}&chapter=${h.chapter}&verse=${h.verse}`
              )
            }
            colorMap={HIGHLIGHT_COLORS}
          />

          <LibraryTab
            label="Notes"
            icon={FileText}
            items={filteredNotes}
            loading={notesLoading}
            emptyMessage="Create your first study note to get started."
            onNavigate={() => navigate("/notes")}
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

function formatLibraryItemReference(item: LibraryDisplayItem): string {
  if (item.book && item.chapter && item.verse) return `${item.book} ${item.chapter}:${item.verse}`;
  if (item.source_id) return item.source_id;
  if (item.title) return item.title;
  return "this item";
}

function getLibraryItemDetails(item: LibraryDisplayItem) {
  const reference = formatLibraryItemReference(item);
  const description =
    item.verse_text?.trim() || item.content?.trim() || undefined;
  const note = item.note?.trim() || undefined;
  const tags = Array.isArray(item.tags)
    ? item.tags.filter((t) => typeof t === "string" && t.trim().length > 0)
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
