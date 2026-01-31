import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Facebook, Link as LinkIcon, Lock, Mail, MapPin, MessageCircle, Pencil, Unlock, Users } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { appendShareAttribution, buildShareUrl } from "@/lib/share";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { EventRecord } from "@/types/events";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting admin approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const formatInTimeZone = (isoString: string, timeZone: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
};

export default function Events() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string>("");
  const [commentDraft, setCommentDraft] = useState("");

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) ?? events[0],
    [events, selectedId]
  );

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("start_at", { ascending: true });

        if (error) throw error;
        
        setEvents((data as EventRecord[]) || []);
        
        // Set initial selected event
        if (data && data.length > 0) {
          const matchingEvent = eventId ? data.find(e => e.id === eventId) : data[0];
          setSelectedId(matchingEvent?.id || data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast.error("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [eventId]);

  useEffect(() => {
    if (!eventId || events.length === 0) return;
    const matchingEvent = events.find((event) => event.id === eventId);
    if (matchingEvent) {
      setSelectedId(matchingEvent.id);
    }
  }, [eventId, events]);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleCommentSubmit = () => {
    if (!selectedEvent || selectedEvent.discussion_locked) return;
    if (!commentDraft.trim()) {
      toast.error("Please enter a comment.");
      return;
    }
    if (commentDraft.length > 180) {
      toast.error("Comments must be 180 characters or less.");
      return;
    }
    // For now, just show a success message (comments would need their own table)
    toast.success("Comment posted!");
    setCommentDraft("");
  };

  const isEventPast = selectedEvent
    ? new Date(selectedEvent.end_at).getTime() < new Date().getTime()
    : false;

  const isUserEvent = selectedEvent?.user_id === user?.id;
  const canEdit = isUserEvent && selectedEvent?.status === "PENDING";

  const getEventSharePayload = (event: EventRecord) => {
    const url = buildShareUrl(`/events/${event.id}`);
    const message = appendShareAttribution(`${event.title} — ${event.short_description}\n${url}`);
    return { url, message };
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async (event: EventRecord) => {
    const { url } = getEventSharePayload(event);
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied. Share it by text or social media.");
      return;
    }
    toast.error("Clipboard access unavailable. Please copy the link manually.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading events...</p>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <BackButton fallbackPath="/more" />
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Events</h1>
                <p className="text-sm text-muted-foreground">
                  Admins and verified organizers can publish events after approval.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <Badge variant="outline">Admin approval required</Badge>
              <Button asChild>
                <Link to="/events/create">Create an event</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Use the dedicated form to submit a new gathering for review.
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No events yet. Be the first to create one!</p>
              <Button asChild>
                <Link to="/events/create">Create an event</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <div className="space-y-4">
                {selectedEvent && (
                  <Card className="p-4 sm:p-6 space-y-5">
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Event page</p>
                          <h2 className="text-lg font-semibold sm:text-xl">{selectedEvent.title}</h2>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="self-start">{selectedEvent.type}</Badge>
                          {canEdit && (
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/events/edit/${selectedEvent.id}`}>
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:text-sm">
                        <Badge variant="secondary">{STATUS_LABELS[selectedEvent.status]}</Badge>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {formatInTimeZone(selectedEvent.start_at, userTimeZone)} →
                          {" "}
                          {formatInTimeZone(selectedEvent.end_at, userTimeZone)}
                        </span>
                        <span className="text-[11px] sm:text-xs">(Your timezone: {userTimeZone})</span>
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:text-sm">
                        <span className="inline-flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4" />
                          {selectedEvent.address}, {selectedEvent.city}, {selectedEvent.country}
                        </span>
                        {selectedEvent.maps_link && (
                          <Button
                            asChild
                            variant="link"
                            size="sm"
                            className="h-auto px-0 text-primary"
                          >
                            <a href={selectedEvent.maps_link} target="_blank" rel="noreferrer">
                              Open in Google Maps
                            </a>
                          </Button>
                        )}
                      </div>
                      <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/40">
                        {selectedEvent.image_url ? (
                          <img
                            src={selectedEvent.image_url}
                            alt={`${selectedEvent.title} banner`}
                            className="h-40 w-full object-cover sm:h-48"
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/15 via-background to-muted sm:h-48">
                            <div className="text-center">
                              <p className="text-sm font-semibold">Add an event image</p>
                              <p className="text-xs text-muted-foreground">
                                Upload a banner to highlight the experience.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground sm:text-sm">{selectedEvent.short_description}</p>
                      {selectedEvent.full_description && (
                        <p className="text-xs text-muted-foreground sm:text-sm">{selectedEvent.full_description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <Badge variant="outline">{selectedEvent.format}</Badge>
                        <Badge variant="outline">{selectedEvent.entry_type} entry</Badge>
                        <Badge variant="outline">Visibility: {selectedEvent.visibility}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => toast.success("Calendar invite created.")}
                      >
                        Add to Calendar
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => toast.success("Marked as interested!")}
                      >
                        I'm Interested
                      </Button>
                      <Button
                        variant="default"
                        className="w-full sm:w-auto"
                        onClick={() => toast.success("RSVP confirmed!")}
                      >
                        I'm Going
                      </Button>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">Share this event</p>
                          <p className="text-xs text-muted-foreground">
                            Send the official MessageGuide link so friends can RSVP on messageguide.org.
                          </p>
                        </div>
                        <Badge variant="outline" className="self-start">
                          Official link
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            const { message } = getEventSharePayload(selectedEvent);
                            openShareWindow(`https://wa.me/?text=${encodeURIComponent(message)}`);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
                          WhatsApp
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            const { url } = getEventSharePayload(selectedEvent);
                            openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
                          }}
                        >
                          <Facebook className="h-4 w-4 text-blue-600" />
                          Facebook
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            const { message } = getEventSharePayload(selectedEvent);
                            openShareWindow(
                              `mailto:?subject=${encodeURIComponent(`Join me at ${selectedEvent.title}`)}&body=${encodeURIComponent(message)}`
                            );
                          }}
                        >
                          <Mail className="h-4 w-4 text-sky-600" />
                          Email
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => void handleCopyLink(selectedEvent)}
                        >
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          Copy link
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">Discussion</h3>
                          <p className="text-xs text-muted-foreground">
                            Keep comments under 180 characters and focused on logistics or encouragement.
                          </p>
                        </div>
                        <Badge variant="outline" className="gap-2">
                          {selectedEvent.discussion_locked ? (
                            <>
                              <Lock className="h-4 w-4" /> Locked
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4" /> Open
                            </>
                          )}
                        </Badge>
                      </div>

                      {selectedEvent.discussion_locked ? (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                          This discussion has been locked by an admin.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Textarea
                            value={commentDraft}
                            onChange={(event) => setCommentDraft(event.target.value)}
                            placeholder="Share logistics or encouragement"
                            rows={2}
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{commentDraft.length}/180</span>
                            <Button size="sm" onClick={handleCommentSubmit}>
                              Post comment
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">No comments yet.</p>
                      </div>
                    </div>

                    {isEventPast && (
                      <div className="border-t border-border/60 pt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">Post-event follow-up</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Did you attend this event? Share your testimony to encourage the community.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" onClick={() => toast.success("Attendance confirmed.")}
                          >
                            I attended
                          </Button>
                          <Button onClick={() => toast.success("Testimony prompt opened.")}
                          >
                            Share testimony
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <Card className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Events feed</p>
                      <h2 className="text-lg font-semibold">Upcoming & recent events</h2>
                    </div>
                    <Badge variant="secondary">{events.length} events</Badge>
                  </div>
                  <div className="space-y-3">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(event.id);
                          navigate(`/events/${event.id}`);
                        }}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          selectedEvent?.id === event.id
                            ? "border-primary/60 bg-primary/5"
                            : "border-border/60 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(event.start_at), "PPP")} · {event.city}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <Badge variant="outline">{event.type}</Badge>
                            {event.status === "PENDING" && (
                              <Badge variant="secondary" className="text-xs">Pending</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {event.short_description}
                        </p>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </div>
  );
}
