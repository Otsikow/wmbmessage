import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, MapPin, Share2, Lock, Unlock, Users } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const EVENT_TYPES = [
  "Convention",
  "Special Retreat",
  "Revival Meeting",
  "Marriage Ceremony",
  "Conference",
  "Youth Program",
  "Prayer Summit",
  "Other (admin approval required)",
] as const;

const EVENT_FORMATS = ["Physical", "Online", "Hybrid"] as const;
const ENTRY_TYPES = ["Free", "Paid"] as const;
const VISIBILITY_OPTIONS = ["Public", "Group-only", "Region-based"] as const;

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

  const [formState, setFormState] = useState({
    title: "",
    type: EVENT_TYPES[0],
    shortDescription: "",
    fullDescription: "",
    startAt: "",
    endAt: "",
    timeZone: "",
    address: "",
    city: "",
    country: "",
    mapsLink: "",
    format: EVENT_FORMATS[0],
    registrationLink: "",
    entryType: ENTRY_TYPES[0],
    contactName: "",
    contactInfo: "",
    visibility: VISIBILITY_OPTIONS[0],
    regionCity: "",
    regionCountry: "",
  });

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) ?? events[0],
    [events, selectedId]
  );

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleCreateEvent = () => {
    if (!formState.title.trim()) {
      toast.error("Event title is required.");
      return;
    }
    if (formState.shortDescription.length > 300) {
      toast.error("Short description must be 300 characters or less.");
      return;
    }
    if (!formState.startAt || !formState.endAt) {
      toast.error("Please provide start and end date/time.");
      return;
    }
    if (!formState.timeZone.trim()) {
      toast.error("Time zone is required.");
      return;
    }
    if (!formState.address.trim() || !formState.city.trim() || !formState.country.trim()) {
      toast.error("Address, city, and country are required.");
      return;
    }

    const newEvent: EventRecord = {
      id: `event-${Date.now()}`,
      title: formState.title.trim(),
      type: formState.type,
      shortDescription: formState.shortDescription.trim(),
      fullDescription: formState.fullDescription.trim() || undefined,
      startAt: formState.startAt,
      endAt: formState.endAt,
      timeZone: formState.timeZone.trim(),
      address: formState.address.trim(),
      city: formState.city.trim(),
      country: formState.country.trim(),
      mapsLink: formState.mapsLink.trim() || undefined,
      format: formState.format,
      registrationLink: formState.registrationLink.trim() || undefined,
      entryType: formState.entryType,
      contactName: formState.contactName.trim() || undefined,
      contactInfo: formState.contactInfo.trim() || undefined,
      visibility: formState.visibility,
      regionCity: formState.regionCity.trim() || undefined,
      regionCountry: formState.regionCountry.trim() || undefined,
      status: "PENDING",
      discussionLocked: false,
      engagement: null,
      comments: [],
    };

    setEvents((prev) => [newEvent, ...prev]);
    setSelectedId(newEvent.id);
    setFormState({
      title: "",
      type: EVENT_TYPES[0],
      shortDescription: "",
      fullDescription: "",
      startAt: "",
      endAt: "",
      timeZone: "",
      address: "",
      city: "",
      country: "",
      mapsLink: "",
      format: EVENT_FORMATS[0],
      registrationLink: "",
      entryType: ENTRY_TYPES[0],
      contactName: "",
      contactInfo: "",
      visibility: VISIBILITY_OPTIONS[0],
      regionCity: "",
      regionCountry: "",
    });
    toast.success("Event submitted for admin approval.");
  };

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

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <BackButton fallbackPath="/more" />
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Events</h1>
              <p className="text-sm text-muted-foreground">
                Admins and verified organizers can publish events after approval.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Create an event</h2>
                  <p className="text-sm text-muted-foreground">
                    Required fields are marked and restricted to verified organizers.
                  </p>
                </div>
                <Badge variant="outline">Admin approval required</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Event title *</Label>
                  <Input
                    id="event-title"
                    value={formState.title}
                    onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                    placeholder="Citywide Prayer Summit"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event type *</Label>
                  <Select
                    value={formState.type}
                    onValueChange={(value) =>
                      setFormState({ ...formState, type: value as (typeof EVENT_TYPES)[number] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="short-description">Short description *</Label>
                  <Textarea
                    id="short-description"
                    value={formState.shortDescription}
                    onChange={(event) => setFormState({ ...formState, shortDescription: event.target.value })}
                    placeholder="Maximum 300 characters"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formState.shortDescription.length}/300
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="full-description">Full description</Label>
                  <Textarea
                    id="full-description"
                    value={formState.fullDescription}
                    onChange={(event) => setFormState({ ...formState, fullDescription: event.target.value })}
                    placeholder="Optional details for attendees"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start date & time *</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={formState.startAt}
                    onChange={(event) => setFormState({ ...formState, startAt: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End date & time *</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={formState.endAt}
                    onChange={(event) => setFormState({ ...formState, endAt: event.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="time-zone">Time zone *</Label>
                  <Input
                    id="time-zone"
                    value={formState.timeZone}
                    onChange={(event) => setFormState({ ...formState, timeZone: event.target.value })}
                    placeholder={`e.g. ${userTimeZone}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Physical address *</Label>
                  <Input
                    id="address"
                    value={formState.address}
                    onChange={(event) => setFormState({ ...formState, address: event.target.value })}
                    placeholder="24 Hope Avenue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formState.city}
                    onChange={(event) => setFormState({ ...formState, city: event.target.value })}
                    placeholder="Lagos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formState.country}
                    onChange={(event) => setFormState({ ...formState, country: event.target.value })}
                    placeholder="Nigeria"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maps">Google Maps link</Label>
                  <Input
                    id="maps"
                    value={formState.mapsLink}
                    onChange={(event) => setFormState({ ...formState, mapsLink: event.target.value })}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event format *</Label>
                  <Select
                    value={formState.format}
                    onValueChange={(value) =>
                      setFormState({ ...formState, format: value as (typeof EVENT_FORMATS)[number] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_FORMATS.map((formatOption) => (
                        <SelectItem key={formatOption} value={formatOption}>
                          {formatOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Entry type *</Label>
                  <Select
                    value={formState.entryType}
                    onValueChange={(value) =>
                      setFormState({ ...formState, entryType: value as (typeof ENTRY_TYPES)[number] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entry" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTRY_TYPES.map((entry) => (
                        <SelectItem key={entry} value={entry}>
                          {entry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration">Registration link</Label>
                  <Input
                    id="registration"
                    value={formState.registrationLink}
                    onChange={(event) => setFormState({ ...formState, registrationLink: event.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Contact person</Label>
                  <Input
                    id="contact-name"
                    value={formState.contactName}
                    onChange={(event) => setFormState({ ...formState, contactName: event.target.value })}
                    placeholder="Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-info">Phone or email</Label>
                  <Input
                    id="contact-info"
                    value={formState.contactInfo}
                    onChange={(event) => setFormState({ ...formState, contactInfo: event.target.value })}
                    placeholder="Phone or email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visibility *</Label>
                  <Select
                    value={formState.visibility}
                    onValueChange={(value) =>
                      setFormState({ ...formState, visibility: value as (typeof VISIBILITY_OPTIONS)[number] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILITY_OPTIONS.map((visibility) => (
                        <SelectItem key={visibility} value={visibility}>
                          {visibility}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region-country">Region country (for region-based)</Label>
                  <Input
                    id="region-country"
                    value={formState.regionCountry}
                    onChange={(event) => setFormState({ ...formState, regionCountry: event.target.value })}
                    placeholder="Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region-city">Region city (optional)</Label>
                  <Input
                    id="region-city"
                    value={formState.regionCity}
                    onChange={(event) => setFormState({ ...formState, regionCity: event.target.value })}
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <Button variant="outline" onClick={() => setFormState({ ...formState, title: "" })}>
                  Save draft
                </Button>
                <Button onClick={handleCreateEvent}>Submit for approval</Button>
              </div>
            </Card>

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

              {selectedEvent && (
                <Card className="p-5 sm:p-6 space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Event page</p>
                        <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
                      </div>
                      <Badge>{selectedEvent.type}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">{STATUS_LABELS[selectedEvent.status]}</Badge>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatInTimeZone(selectedEvent.startAt, userTimeZone)} →
                        {" "}
                        {formatInTimeZone(selectedEvent.endAt, userTimeZone)}
                      </span>
                      <span className="text-xs">(Your timezone: {userTimeZone})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {selectedEvent.address}, {selectedEvent.city}, {selectedEvent.country}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedEvent.shortDescription}</p>
                    {selectedEvent.fullDescription && (
                      <p className="text-sm text-muted-foreground">{selectedEvent.fullDescription}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{selectedEvent.format}</Badge>
                      <Badge variant="outline">{selectedEvent.entryType} entry</Badge>
                      <Badge variant="outline">Visibility: {selectedEvent.visibility}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => toast.success("Calendar invite created.")}
                    >
                      Add to Calendar
                    </Button>
                    <Button
                      variant={selectedEvent.engagement === "Interested" ? "default" : "outline"}
                      onClick={() => handleEngagement("Interested")}
                    >
                      I’m Interested
                    </Button>
                    <Button
                      variant={selectedEvent.engagement === "Going" ? "default" : "outline"}
                      onClick={() => handleEngagement("Going")}
                    >
                      I’m Going
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={() => toast.success("Shared internally.")}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
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
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
