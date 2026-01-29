import { Json } from "@/integrations/supabase/types";

// Database-aligned status types
export type MessageChurchStatus = "PENDING" | "PUBLISHED" | "REJECTED" | "ARCHIVED" | "BANNED";
export type MessageChurchSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

// Matches the database schema for message_churches table
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
  whatsapp_number: string;
  email?: string | null;
  website?: string | null;
  service_times?: string | null;
  description?: string | null;
  status: MessageChurchStatus;
  verified: boolean;
  verified_by_admin_id?: string | null;
  created_at: string;
  updated_at: string;
};

// Payload stored in JSON column for submissions
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
  whatsapp_number: string;
  email?: string | null;
  website?: string | null;
  service_times?: string | null;
  description?: string | null;
};

// Matches the database schema for message_church_submissions table  
export type MessageChurchSubmission = {
  id: string;
  submitted_church_payload: Json;
  affirmation_checkbox: boolean;
  status: string;
  submitter_user_id?: string | null;
  submitter_email?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
};

// Helper function to safely parse submission payload
export function parseSubmissionPayload(payload: Json): MessageChurchSubmissionPayload | null {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return null;
  }
  return payload as unknown as MessageChurchSubmissionPayload;
}
