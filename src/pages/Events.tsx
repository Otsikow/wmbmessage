import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Facebook, Link as LinkIcon, Lock, Mail, MapPin, MessageCircle, Unlock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_TYPES, EVENT_FORMATS, ENTRY_TYPES, VISIBILITY_OPTIONS } from "@/data/events";
import { appendShareAttribution, buildShareUrl } from "@/lib/share";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting admin approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

interface EventRecord {
  id: string;
  title: string;
  type: (typeof EVENT_TYPES)[number];
  shortDescription: string;
  fullDescription?: string;
  startAt: string;
  endAt: string;
  timeZone: string;
  address: string;
  city: string;
  country: string;
  mapsLink?: string;
  format: (typeof EVENT_FORMATS)[number];
  registrationLink?: string;
  entryType: (typeof ENTRY_TYPES)[number];
  contactName?: string;
  contactInfo?: string;
  visibility: (typeof VISIBILITY_OPTIONS)[number];
  regionCity?: string;
  regionCountry?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  discussionLocked: boolean;
  engagement?: "Interested" | "Going" | null;
  comments: string[];
  imageUrl?: string;
}

const initialEvents: EventRecord[] = [
  {
    id: "event-1",
    title: "Citywide Prayer Summit",
    type: "Prayer Summit",
    shortDescription: "Gathering believers for an evening of prayer, worship, and encouragement.",
    fullDescription:
      "Join churches across the city as we unite in prayer for families, communities, and leaders.",
    startAt: "2026-02-12T18:00:00Z",
    endAt: "2026-02-12T20:30:00Z",
    timeZone: "Africa/Lagos",
    address: "Freedom Center, 24 Hope Avenue",
    city: "Lagos",
    country: "Nigeria",
    mapsLink: "https://maps.google.com/?q=Freedom+Center+Lagos",
    format: "Hybrid",
    registrationLink: "https://events.messageguide.com/register/prayer-summit",
    entryType: "Free",
    contactName: "Sister Ada",
    contactInfo: "+234 803 000 0000",
    visibility: "Public",
    status: "APPROVED",
    discussionLocked: false,
    engagement: null,
    comments: ["Looking forward to it!", "Will there be childcare?"],
    imageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "event-2",
    title: "Youth Revival Weekend",
    type: "Youth Program",
    shortDescription: "Weekend revival focusing on youth worship and discipleship.",
    fullDescription:
      "Sessions include worship, panel discussions, and mentorship time for youth leaders.",
    startAt: "2025-11-02T09:00:00Z",
    endAt: "2025-11-04T15:00:00Z",
    timeZone: "America/Chicago",
    address: "Grace Assembly Hall, 78 River Rd",
    city: "Dallas",
    country: "USA",
    format: "Physical",
    entryType: "Paid",
    registrationLink: "https://events.messageguide.com/register/youth-revival",
    contactName: "Brother James",
    contactInfo: "james@messageguide.com",
    visibility: "Region-based",
    regionCity: "Dallas",
    regionCountry: "USA",
    status: "APPROVED",
    discussionLocked: true,
    engagement: "Going",
    comments: ["Excited for the youth to attend!"],
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  },
];

const formatInTimeZone = (isoString: string, timeZone: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
};

export default function Events() {
  const [events, setEvents] = useState<EventRecord[]>(initialEvents);
  const [selectedId, setSelectedId] = useState(initialEvents[0]?.id ?? "");
  const [commentDraft, setCommentDraft] = useState("");

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) ?? events[0],
    [events, selectedId]
  );

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleEngagement = (type: "Interested" | "Going") => {
    if (!selectedEvent) return;
    setEvents((prev) =>
      prev.map((event) =>
        event.id === selectedEvent.id
          ? { ...event, engagement: event.engagement === type ? null : type }
          : event
      )
    );
  };

  const handleCommentSubmit = () => {
    if (!selectedEvent || selectedEvent.discussionLocked) return;
    if (!commentDraft.trim()) {
      toast.error("Please enter a comment.");
      return;
    }
    if (commentDraft.length > 180) {
      toast.error("Comments must be 180 characters or less.");
      return;
    }
    setEvents((prev) =>
      prev.map((event) =>
        event.id === selectedEvent.id
          ? { ...event, comments: [commentDraft.trim(), ...event.comments] }
          : event
      )
    );
    setCommentDraft("");
  };

  const handleDiscussionToggle = () => {
    if (!selectedEvent) return;
    setEvents((prev) =>
      prev.map((event) =>
        event.id === selectedEvent.id
          ? { ...event, discussionLocked: !event.discussionLocked }
          : event
      )
    );
  };

  const isEventPast = selectedEvent
    ? new Date(selectedEvent.endAt).getTime() < new Date().getTime()
    : false;

  const getEventSharePayload = (event: EventRecord) => {
    const url = buildShareUrl(`/events/${event.id}`);
    const message = appendShareAttribution(`${event.title} — ${event.shortDescription}\n${url}`);
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
                      <Badge className="self-start">{selectedEvent.type}</Badge>
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:text-sm">
                      <Badge variant="secondary">{STATUS_LABELS[selectedEvent.status]}</Badge>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatInTimeZone(selectedEvent.startAt, userTimeZone)} →
                        {" "}
                        {formatInTimeZone(selectedEvent.endAt, userTimeZone)}
                      </span>
                      <span className="text-[11px] sm:text-xs">(Your timezone: {userTimeZone})</span>
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:text-sm">
                      <span className="inline-flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4" />
                        {selectedEvent.address}, {selectedEvent.city}, {selectedEvent.country}
                      </span>
                      {selectedEvent.mapsLink && (
                        <Button
                          asChild
                          variant="link"
                          size="sm"
                          className="h-auto px-0 text-primary"
                        >
                          <a href={selectedEvent.mapsLink} target="_blank" rel="noreferrer">
                            Open in Google Maps
                          </a>
                        </Button>
                      )}
                    </div>
                    <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/40">
                      {selectedEvent.imageUrl ? (
                        <img
                          src={selectedEvent.imageUrl}
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
                    <p className="text-xs text-muted-foreground sm:text-sm">{selectedEvent.shortDescription}</p>
                    {selectedEvent.fullDescription && (
                      <p className="text-xs text-muted-foreground sm:text-sm">{selectedEvent.fullDescription}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <Badge variant="outline">{selectedEvent.format}</Badge>
                      <Badge variant="outline">{selectedEvent.entryType} entry</Badge>
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
                      variant={selectedEvent.engagement === "Interested" ? "default" : "outline"}
                      className="w-full sm:w-auto"
                      onClick={() => handleEngagement("Interested")}
                    >
                      I’m Interested
                    </Button>
                    <Button
                      variant={selectedEvent.engagement === "Going" ? "default" : "outline"}
                      className="w-full sm:w-auto"
                      onClick={() => handleEngagement("Going")}
                    >
                      I’m Going
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleDiscussionToggle}
                      >
                        {selectedEvent.discussionLocked ? (
                          <>
                            <Lock className="h-4 w-4" /> Locked
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4" /> Open
                          </>
                        )}
                      </Button>
                    </div>

                    {selectedEvent.discussionLocked ? (
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
                      {selectedEvent.comments.map((comment, index) => (
                        <div key={`${comment}-${index}`} className="rounded-lg border border-border/60 p-3">
                          <p className="text-sm">{comment}</p>
                        </div>
                      ))}
                      {selectedEvent.comments.length === 0 && (
                        <p className="text-sm text-muted-foreground">No comments yet.</p>
                      )}
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
                  <Badge variant="secondary" className="self-start">
                    Public likes disabled
                  </Badge>
                </div>
                <div className="space-y-3">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelectedId(event.id)}
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
                            {format(new Date(event.startAt), "PPP")} · {event.city}
                          </p>
                        </div>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {event.shortDescription}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
