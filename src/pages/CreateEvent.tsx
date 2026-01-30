import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
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
import { EVENT_TYPES, EVENT_FORMATS, ENTRY_TYPES, VISIBILITY_OPTIONS } from "@/data/events";

const INITIAL_FORM_STATE = {
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
  imageDataUrl: "",
};

export default function CreateEvent() {
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFormState((prev) => ({ ...prev, imageDataUrl: "" }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setFormState((prev) => ({ ...prev, imageDataUrl: result }));
    };
    reader.readAsDataURL(file);
  };

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

    toast.success("Event submitted for admin approval.");
    resetForm();
    navigate("/events");
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <BackButton fallbackPath="/events" />
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Create an event</h1>
              <p className="text-sm text-muted-foreground">
                Submit new gatherings for admin review before publishing.
              </p>
            </div>
          </div>

          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Event details</h2>
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="event-image">Event image</Label>
                <Input
                  id="event-image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a banner image to make the event page feel more vibrant.
                </p>
                {formState.imageDataUrl && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border/60">
                    <img
                      src={formState.imageDataUrl}
                      alt="Event preview"
                      className="h-40 w-full object-cover"
                    />
                  </div>
                )}
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
              <Button variant="outline" onClick={resetForm}>
                Clear form
              </Button>
              <Button onClick={handleCreateEvent}>Submit for approval</Button>
            </div>
          </Card>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
