export type MessageChurchStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type MessageChurchSubmissionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_REVIEW";

export type MessageChurch = {
  id: string;
  church_name: string;
  message_affiliation: string;
  pastor_or_contact_name: string;
  pastor_title?: string | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state_region?: string | null;
  postal_code?: string | null;
  country_code: string;
  country_name: string;
  latitude?: number | null;
  longitude?: number | null;
  whatsapp_number: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  website_url?: string | null;
  services_schedule_text?: string | null;
  notes_public?: string | null;
  status: MessageChurchStatus;
  verified: boolean;
  verified_at?: string | null;
  verified_by_admin_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageChurchSubmission = {
  id: string;
  submitted_church_payload: MessageChurchSubmissionPayload;
  submitter_name?: string | null;
  submitter_email?: string | null;
  submitter_whatsapp?: string | null;
  affirmation_checkbox: boolean;
  status: MessageChurchSubmissionStatus;
  admin_notes?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageChurchSubmissionPayload = {
  church_name: string;
  message_affiliation: string;
  pastor_or_contact_name: string;
  pastor_title?: string | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state_region?: string | null;
  postal_code?: string | null;
  country_code: string;
  country_name: string;
  latitude?: number | null;
  longitude?: number | null;
  whatsapp_number: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  website_url?: string | null;
  services_schedule_text?: string | null;
  notes_public?: string | null;
};
