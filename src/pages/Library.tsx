import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookmarkIcon, Highlighter, FileText, Clock, Loader2, Trash2 } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const HIGHLIGHT_COLORS = {
  yellow: "bg-yellow-200 dark:bg-yellow-900",
  green: "bg-green-200 dark:bg-green-900",
  blue: "bg-blue-200 dark:bg-blue-900",
  pink: "bg-pink-200 dark:bg-pink-900",
  purple: "bg-purple-200 dark:bg-purple-900",
};

export default function Library() {
  const navigate = useNavigate();
  const { bookmarks, loading: bookmarksLoading, deleteBookmark } = useBookmarks();
  const { highlights, loading: highlightsLoading, deleteHighlight } = useHighlights();
  const { notes, loading: notesLoading } = useNotes();
  const { activities, loading: activitiesLoading, getRecentActivity } = useActivityLog();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);

  const recentActivities = getRecentActivity(20);

  const handleDelete = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "bookmark") {
      await deleteBookmark(itemToDelete.id);
    } else if (itemToDelete.type === "highlight") {
      await deleteHighlight(itemToDelete.id);
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
      <div className="flex-1 w-full py-6 sm:py-8 pb-24 md:pb-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/more")}
              className="md:hidden shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">My Library</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Your personal Bible study collection
              </p>
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
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BookmarkIcon className="h-5 w-5" />
                    Bookmarks
                    <Badge variant="secondary">{bookmarks.length}</Badge>
                  </h2>
                </div>
                {bookmarksLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : bookmarks.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    No bookmarks yet
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {bookmarks.slice(0, 5).map((bookmark) => (
                      <Card
                        key={bookmark.id}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/reader?book=${bookmark.book}&chapter=${bookmark.chapter}`)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <BookmarkIcon className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-sm">
                                {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                              </span>
                            </div>
                            {bookmark.verse_text && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {bookmark.verse_text}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog("bookmark", bookmark.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Highlights Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Highlighter className="h-5 w-5" />
                    Highlights
                    <Badge variant="secondary">{highlights.length}</Badge>
                  </h2>
                </div>
                {highlightsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : highlights.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    No highlights yet
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {highlights.slice(0, 5).map((highlight) => (
                      <Card
                        key={highlight.id}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/reader?book=${highlight.book}&chapter=${highlight.chapter}`)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${HIGHLIGHT_COLORS[highlight.color as keyof typeof HIGHLIGHT_COLORS]}`} />
                              <span className="font-semibold text-sm">
                                {highlight.book} {highlight.chapter}:{highlight.verse}
                              </span>
                            </div>
                            {highlight.verse_text && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {highlight.verse_text}
                              </p>
                            )}
                            {highlight.note && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                Note: {highlight.note}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(highlight.created_at), { addSuffix: true })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog("highlight", highlight.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                    <Badge variant="secondary">{notes.length}</Badge>
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => navigate("/notes")}>
                    View All
                  </Button>
                </div>
                {notesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : notes.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    No notes yet
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {notes.slice(0, 3).map((note) => (
                      <Card
                        key={note.id}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate("/notes")}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">{note.title}</h3>
                            {note.verse_reference && (
                              <Badge variant="outline" className="text-xs mb-2">
                                {note.verse_reference}
                              </Badge>
                            )}
                            {note.content && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {note.content}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Bookmarks Tab */}
            <TabsContent value="bookmarks">
              {bookmarksLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : bookmarks.length === 0 ? (
                <Card className="p-12 text-center">
                  <BookmarkIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Bookmarks Yet</h3>
                  <p className="text-muted-foreground">
                    Start bookmarking verses to save them for later
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map((bookmark) => (
                    <Card
                      key={bookmark.id}
                      className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/reader?book=${bookmark.book}&chapter=${bookmark.chapter}`)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookmarkIcon className="h-5 w-5 text-primary" />
                            <span className="font-semibold">
                              {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                            </span>
                          </div>
                          {bookmark.verse_text && (
                            <p className="text-sm text-muted-foreground">
                              {bookmark.verse_text}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog("bookmark", bookmark.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Highlights Tab */}
            <TabsContent value="highlights">
              {highlightsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : highlights.length === 0 ? (
                <Card className="p-12 text-center">
                  <Highlighter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Highlights Yet</h3>
                  <p className="text-muted-foreground">
                    Start highlighting verses to remember important passages
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {highlights.map((highlight) => (
                    <Card
                      key={highlight.id}
                      className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/reader?book=${highlight.book}&chapter=${highlight.chapter}`)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-4 h-4 rounded-full ${HIGHLIGHT_COLORS[highlight.color as keyof typeof HIGHLIGHT_COLORS]}`} />
                            <span className="font-semibold">
                              {highlight.book} {highlight.chapter}:{highlight.verse}
                            </span>
                          </div>
                          {highlight.verse_text && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {highlight.verse_text}
                            </p>
                          )}
                          {highlight.note && (
                            <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
                              {highlight.note}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(highlight.created_at), { addSuffix: true })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog("highlight", highlight.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes">
              {notesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : notes.length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Notes Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first study note to get started
                  </p>
                  <Button onClick={() => navigate("/notes")}>
                    Go to Notes
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <Card
                      key={note.id}
                      className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate("/notes")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{note.title}</h3>
                          {note.verse_reference && (
                            <Badge variant="outline" className="mb-2">
                              {note.verse_reference}
                            </Badge>
                          )}
                          {note.content && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {note.content}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

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
                    Your reading activity will appear here
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <Card key={activity.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          {activity.action === "read" && <Clock className="h-4 w-4 text-muted-foreground" />}
                          {activity.action === "highlight" && <Highlighter className="h-4 w-4 text-yellow-500" />}
                          {activity.action === "bookmark" && <BookmarkIcon className="h-4 w-4 text-primary" />}
                          {activity.action === "note" && <FileText className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium capitalize">{activity.action}</span>
                            {" "}
                            <span className="text-muted-foreground">{activity.source_id}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
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
      </div>

      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
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
