import type { EventType, EventFormat, EntryType, VisibilityOption } from "@/data/events";

export interface EventRecord {
  id: string;
  user_id: string | null;
  title: string;
  type: EventType;
  short_description: string;
  full_description: string | null;
  start_at: string;
  end_at: string;
  time_zone: string;
  address: string;
  city: string;
  country: string;
  maps_link: string | null;
  format: EventFormat;
  registration_link: string | null;
  entry_type: EntryType;
  contact_name: string | null;
  contact_info: string | null;
  visibility: VisibilityOption;
  region_city: string | null;
  region_country: string | null;
  image_url: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  discussion_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventFormState {
  title: string;
  type: string;
  shortDescription: string;
  fullDescription: string;
  startAt: string;
  endAt: string;
  timeZone: string;
  address: string;
  city: string;
  country: string;
  mapsLink: string;
  format: string;
  registrationLink: string;
  entryType: string;
  contactName: string;
  contactInfo: string;
  visibility: string;
  regionCity: string;
  regionCountry: string;
  imageFile: File | null;
  imagePreviewUrl: string;
}
