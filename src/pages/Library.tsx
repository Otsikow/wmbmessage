import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
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
  Plus,
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
import { cn } from "@/lib/utils";

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
  action?: ReactNode;
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
        title: note.title,
        source_id: note.source_id,
        content: note.content,
        created_at: note.created_at,
      })),
    [userNotes]
  );

  const totalLibraryItems =
    bookmarks.length + highlights.length + noteDisplayItems.length;
  const isLoadingData = bookmarksLoading || highlightsLoading || notesLoading;

  /* ------------------------- EXPORT ------------------------- */
  const buildExportData = () => ({
    generatedAt: new Date().toISOString(),
    totals: {
      bookmarks: bookmarks.length,
      highlights: highlights.length,
      notes: userNotes.length,
    },
    bookmarks: bookmarks.map((b) => ({ ...b, reference: formatLibraryItemReference(b) })),
    highlights: highlights.map((h) => ({ ...h, reference: formatLibraryItemReference(h) })),
    notes: userNotes,
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
    } catch {
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
    } catch {
      toast({
        title: "Export failed",
        description: "Unable to create PDF file.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  /* ------------------------- FILTER + SORT ------------------------- */
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

  const handleCreateNote = useCallback(() => {
    navigate("/notes", { state: { openEditor: true } });
  }, [navigate]);

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
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-30 border-b border-border bg-card shadow-sm">
        <div className="container flex flex-wrap items-center gap-3 px-4 py-4">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
            <BackButton fallbackPath="/more" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold">My Library</h1>
              <p className="text-sm text-muted-foreground">Your personal Bible study collection</p>
            </div>
          </div>
          <div className="w-full sm:w-auto sm:ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center sm:w-auto"
                  disabled={isExporting || isLoadingData}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" /> Export
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => void handleExportPDF()}>
                  <FileDown className="mr-2 h-4 w-4" /> Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleExportJSON()}>
                  <FileJson className="mr-2 h-4 w-4" /> Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Search + Sort */}
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
          <TabsList className="mb-6 flex w-full flex-wrap gap-2 overflow-x-auto md:flex-nowrap">
            <TabsTrigger value="all" className="flex-1 min-w-[120px]">
              All
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex-1 min-w-[120px]">
              <BookmarkIcon className="h-4 w-4" /> Bookmarks
            </TabsTrigger>
            <TabsTrigger value="highlights" className="flex-1 min-w-[120px]">
              <Highlighter className="h-4 w-4" /> Highlights
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex-1 min-w-[120px]">
              <FileText className="h-4 w-4" /> Notes
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1 min-w-[120px]">
              <Clock className="h-4 w-4" /> Recent
            </TabsTrigger>
          </TabsList>

          {/* All */}
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
            action={
              <Button size="sm" onClick={handleCreateNote}>
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            }
            onNavigate={() => navigate("/notes")}
            sectionType="note"
            onUpdateNote={handleNoteEdit}
          />

          {/* Recent */}
          <TabsContent value="recent" className="space-y-4">
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

/* ------------------------- HELPER FUNCTIONS ------------------------- */

function formatLibraryItemReference(item: LibraryDisplayItem): string {
  if ('book' in item && 'chapter' in item && 'verse' in item) {
    return `${item.book} ${item.chapter}:${item.verse}`;
  }
  if ('title' in item && item.title) {
    return item.title;
  }
  if ('sermon_title' in item && item.sermon_title) {
    return item.sermon_title;
  }
  return "Untitled";
}

function wrapTextForPdf(text: string, maxWidth = 80): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function getLibraryItemDetails(item: LibraryDisplayItem): {
  reference: string;
  description: string;
  note: string;
  tags: string[];
} {
  const reference = formatLibraryItemReference(item);
  let description = '';
  let note = '';
  let tags: string[] = [];

  if ('verse_text' in item && item.verse_text) {
    description = item.verse_text;
  }
  if ('content' in item && item.content) {
    description = item.content;
  }
  if ('note' in item && item.note) {
    note = item.note;
  }
  if ('tags' in item && Array.isArray(item.tags)) {
    tags = item.tags;
  }

  return { reference, description, note, tags };
}

function generateSimplePdf(lines: string[]): Blob {
  // Simple PDF generation - creates a basic PDF structure
  const header = '%PDF-1.4\n';
  const body = lines.join('\n');
  
  // Create a basic PDF structure
  const pdfContent = `${header}
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length ${body.length} >>
stream
BT
/F1 12 Tf
50 750 Td
${body}
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000000304 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + body.length}
%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
}

function filterLibraryItems<T extends LibraryDisplayItem>(
  items: T[],
  query: string
): T[] {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase();
  
  return items.filter((item) => {
    // Check reference
    const reference = formatLibraryItemReference(item);
    if (reference.toLowerCase().includes(lowerQuery)) return true;
    
    // Check content
    if ('content' in item && item.content?.toLowerCase().includes(lowerQuery)) return true;
    if ('verse_text' in item && item.verse_text?.toLowerCase().includes(lowerQuery)) return true;
    
    // Check note
    if ('note' in item && item.note?.toLowerCase().includes(lowerQuery)) return true;
    
    // Check tags
    if ('tags' in item && Array.isArray(item.tags)) {
      if (item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
    }
    
    return false;
  });
}

function sortLibraryItems<T extends LibraryDisplayItem>(
  items: T[],
  sortOption: SortOption
): T[] {
  const sorted = [...items];
  
  switch (sortOption) {
    case 'date':
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      break;
    case 'book':
      sorted.sort((a, b) => {
        const refA = formatLibraryItemReference(a);
        const refB = formatLibraryItemReference(b);
        return refA.localeCompare(refB);
      });
      break;
    case 'type':
      // This is handled at the combined level, so just return by date
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      break;
  }
  
  return sorted;
}

function sortCombinedLibraryItems(
  items: CombinedLibraryItem[],
  sortOption: SortOption
): CombinedLibraryItem[] {
  const sorted = [...items];
  
  switch (sortOption) {
    case 'date':
      sorted.sort((a, b) => {
        const dateA = a.item.created_at ? new Date(a.item.created_at).getTime() : 0;
        const dateB = b.item.created_at ? new Date(b.item.created_at).getTime() : 0;
        return dateB - dateA;
      });
      break;
    case 'book':
      sorted.sort((a, b) => {
        const refA = formatLibraryItemReference(a.item);
        const refB = formatLibraryItemReference(b.item);
        return refA.localeCompare(refB);
      });
      break;
    case 'type':
      sorted.sort((a, b) => {
        const typeOrder = { bookmark: 0, highlight: 1, note: 2 };
        const orderA = typeOrder[a.type];
        const orderB = typeOrder[b.type];
        if (orderA !== orderB) return orderA - orderB;
        
        const dateA = a.item.created_at ? new Date(a.item.created_at).getTime() : 0;
        const dateB = b.item.created_at ? new Date(b.item.created_at).getTime() : 0;
        return dateB - dateA;
      });
      break;
  }
  
  return sorted;
}

/* ------------------------- SUB COMPONENTS ------------------------- */

function LibraryItemCard<T extends LibraryDisplayItem>({
  item,
  itemType,
  colorClass,
  showTypeBadge,
  onNavigate,
  onDelete,
  onUpdateHighlight,
  onUpdateNote,
}: {
  item: T;
  itemType: LibraryItemType;
  colorClass?: string;
  showTypeBadge?: boolean;
  onNavigate: (item: T) => void;
  onDelete?: (item: T) => void;
  onUpdateHighlight?: (item: LibraryHighlight, note: string) => Promise<boolean>;
  onUpdateNote?: (item: T, content: string) => Promise<boolean>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const reference = formatLibraryItemReference(item);
  const { description, note } = getLibraryItemDetails(item);
  
  const handleEdit = () => {
    if (itemType === 'highlight' && 'note' in item) {
      setEditValue(item.note || '');
    } else if (itemType === 'note' && 'content' in item) {
      setEditValue(item.content || '');
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    let success = false;
    
    if (itemType === 'highlight' && onUpdateHighlight) {
      success = await onUpdateHighlight(item as LibraryHighlight, editValue);
    } else if (itemType === 'note' && onUpdateNote) {
      success = await onUpdateNote(item, editValue);
    }
    
    setIsSaving(false);
    if (success) setIsEditing(false);
  };

  return (
    <Card className={cn("p-4 hover:shadow-md transition-shadow", colorClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onNavigate(item)}>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm">{reference}</p>
            {showTypeBadge && (
              <Badge variant="secondary" className="text-xs">
                {itemType}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {description}
            </p>
          )}
          {!isEditing && note && (
            <p className="text-xs text-muted-foreground italic">Note: {note}</p>
          )}
          {isEditing && (
            <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={itemType === 'highlight' ? 'Add a note...' : 'Edit content...'}
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {(onUpdateHighlight || onUpdateNote) && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function LibraryTab<T extends LibraryDisplayItem = LibraryDisplayItem>({
  label,
  icon: Icon,
  items,
  loading,
  onDelete,
  onNavigate,
  colorMap,
  sectionType,
  onUpdateHighlight,
  onUpdateNote,
  emptyMessage,
  action,
}: LibraryTabProps<T>) {
  return (
    <TabsContent value={label.toLowerCase()} className="space-y-3">
      {action ? <div className="flex justify-end">{action}</div> : null}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No {label}</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => {
            const highlight = sectionType === "highlight" ? (item as LibraryHighlight) : null;
            const colorClass = highlight?.color && colorMap
              ? colorMap[highlight.color]
              : undefined;

            return (
              <LibraryItemCard
                key={item.id}
                item={item}
                itemType={sectionType}
                colorClass={colorClass}
                onNavigate={onNavigate}
                onDelete={onDelete}
                onUpdateHighlight={onUpdateHighlight as any}
                onUpdateNote={onUpdateNote}
              />
            );
          })}
        </div>
      )}
    </TabsContent>
  );
}
