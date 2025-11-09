import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BookmarkIcon,
  Highlighter,
  FileText,
  Clock,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useHighlights } from "@/hooks/useHighlights";
import { useNotes } from "@/hooks/useNotes";
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

const HIGHLIGHT_COLORS = {
  yellow: "bg-yellow-200 dark:bg-yellow-900",
  green: "bg-green-200 dark:bg-green-900",
  blue: "bg-blue-200 dark:bg-blue-900",
  pink: "bg-pink-200 dark:bg-pink-900",
  purple: "bg-purple-200 dark:bg-purple-900",
};

interface LibraryDisplayItem {
  id: string;
  book?: string;
  chapter?: number;
  verse?: number;
  verse_text?: string;
  color?: string;
  note?: string;
  [key: string]: unknown;
}

interface LibrarySectionProps<T extends LibraryDisplayItem = LibraryDisplayItem> {
  title: string;
  icon: LucideIcon;
  items: T[];
  loading: boolean;
  onDelete?: (id: string) => void;
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
  const { bookmarks, loading: bookmarksLoading, removeBookmark } = useBookmarks();
  const { highlights, loading: highlightsLoading, removeHighlight } = useHighlights("", 0);
  const { notes, loading: notesLoading } = useNotes();
  const { activities, loading: activitiesLoading, getRecentActivity } = useActivityLog();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);

  const recentActivities = getRecentActivity(20);

  const handleDelete = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "bookmark") {
      // Extract sermon_id and paragraph_number from the bookmark ID
      const bookmark = bookmarks.find(b => b.id === itemToDelete.id);
      if (bookmark) {
        await removeBookmark(bookmark.sermon_id as any, bookmark.paragraph_number as any);
      }
    } else if (itemToDelete.type === "highlight") {
      const highlight = highlights.find(h => h.id === itemToDelete.id);
      if (highlight) {
        await removeHighlight(highlight.verse);
      }
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const openDeleteDialog = (type: string, id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center gap-3 py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/more")}
            className="md:hidden shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
              items={bookmarks as any}
              loading={bookmarksLoading}
              onDelete={(id) => openDeleteDialog("bookmark", id)}
              onNavigate={(b) => navigate(`/reader?book=${b.book}&chapter=${b.chapter}`)}
            />

            {/* Highlights Section */}
            <LibrarySection
              title="Highlights"
              icon={Highlighter}
              items={highlights as any}
              loading={highlightsLoading}
              colorMap={HIGHLIGHT_COLORS}
              onDelete={(id) => openDeleteDialog("highlight", id)}
              onNavigate={(h) => navigate(`/reader?book=${h.book}&chapter=${h.chapter}`)}
            />

            {/* Notes Section */}
            <LibrarySection
              title="Notes"
              icon={FileText}
              items={notes as any}
              loading={notesLoading}
              onNavigate={() => navigate("/notes")}
            />
          </TabsContent>

          {/* Bookmarks Tab */}
          <LibraryTab
            label="Bookmarks"
            icon={BookmarkIcon}
            items={bookmarks as any}
            loading={bookmarksLoading}
            emptyMessage="Start bookmarking verses to save them for later."
            onDelete={(id) => openDeleteDialog("bookmark", id)}
            onNavigate={(b) => navigate(`/reader?book=${b.book}&chapter=${b.chapter}`)}
          />

          {/* Highlights Tab */}
          <LibraryTab
            label="Highlights"
            icon={Highlighter}
            items={highlights as any}
            loading={highlightsLoading}
            emptyMessage="Start highlighting verses to remember important passages."
            onDelete={(id) => openDeleteDialog("highlight", id)}
            onNavigate={(h) => navigate(`/reader?book=${h.book}&chapter=${h.chapter}`)}
            colorMap={HIGHLIGHT_COLORS}
          />

          {/* Notes Tab */}
          <LibraryTab
            label="Notes"
            icon={FileText}
            items={notes as any}
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
              Delete {itemToDelete?.type}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This
              action cannot be undone.
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
            const colorClass = item.color && colorMap ? colorMap[item.color] : undefined;

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
                      <span className="font-semibold text-sm">
                        {item.book} {item.chapter}:{item.verse}
                      </span>
                    </div>
                    {item.verse_text && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.verse_text}
                      </p>
                    )}
                  </div>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
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
            const colorClass = item.color && colorMap ? colorMap[item.color] : undefined;

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
                      <span className="font-semibold">
                        {item.book} {item.chapter}:{item.verse}
                      </span>
                    </div>
                    {item.verse_text && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.verse_text}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
                        {item.note}
                      </p>
                    )}
                  </div>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
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
