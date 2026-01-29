export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          source_id: string
          source_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source_id: string
          source_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      bible_verses: {
        Row: {
          book: string
          chapter: number
          created_at: string | null
          id: string
          is_jesus_words: boolean | null
          text: string
          translation: string | null
          updated_at: string | null
          verse: number
        }
        Insert: {
          book: string
          chapter: number
          created_at?: string | null
          id?: string
          is_jesus_words?: boolean | null
          text: string
          translation?: string | null
          updated_at?: string | null
          verse: number
        }
        Update: {
          book?: string
          chapter?: number
          created_at?: string | null
          id?: string
          is_jesus_words?: boolean | null
          text?: string
          translation?: string | null
          updated_at?: string | null
          verse?: number
        }
        Relationships: []
      }
      cross_references: {
        Row: {
          created_at: string | null
          from_book: string
          from_chapter: number
          from_verse: number
          id: string
          notes: string | null
          relationship_type: string | null
          to_book: string
          to_chapter: number
          to_verse: number
          to_verse_end: number | null
        }
        Insert: {
          created_at?: string | null
          from_book: string
          from_chapter: number
          from_verse: number
          id?: string
          notes?: string | null
          relationship_type?: string | null
          to_book: string
          to_chapter: number
          to_verse: number
          to_verse_end?: number | null
        }
        Update: {
          created_at?: string | null
          from_book?: string
          from_chapter?: number
          from_verse?: number
          id?: string
          notes?: string | null
          relationship_type?: string | null
          to_book?: string
          to_chapter?: number
          to_verse?: number
          to_verse_end?: number | null
        }
        Relationships: []
      }
      daily_content: {
        Row: {
          content_date: string
          created_at: string | null
          id: string
          quote_source: string | null
          quote_text: string | null
          updated_at: string | null
          verse_book: string
          verse_chapter: number
          verse_text: string
          verse_verse: number
        }
        Insert: {
          content_date: string
          created_at?: string | null
          id?: string
          quote_source?: string | null
          quote_text?: string | null
          updated_at?: string | null
          verse_book: string
          verse_chapter: number
          verse_text: string
          verse_verse: number
        }
        Update: {
          content_date?: string
          created_at?: string | null
          id?: string
          quote_source?: string | null
          quote_text?: string | null
          updated_at?: string | null
          verse_book?: string
          verse_chapter?: number
          verse_text?: string
          verse_verse?: number
        }
        Relationships: []
      }
      message_church_submissions: {
        Row: {
          admin_notes: string | null
          affirmation_checkbox: boolean
          created_at: string
          id: string
          status: string
          submitted_church_payload: Json
          submitter_email: string | null
          submitter_user_id: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          affirmation_checkbox?: boolean
          created_at?: string
          id?: string
          status?: string
          submitted_church_payload: Json
          submitter_email?: string | null
          submitter_user_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          affirmation_checkbox?: boolean
          created_at?: string
          id?: string
          status?: string
          submitted_church_payload?: Json
          submitter_email?: string | null
          submitter_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      message_churches: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          church_name: string
          city: string
          country_code: string
          country_name: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          message_affiliation: string
          pastor_or_contact_name: string
          pastor_title: string | null
          postal_code: string | null
          service_times: string | null
          state_region: string | null
          status: string
          updated_at: string
          verified: boolean
          verified_by_admin_id: string | null
          website: string | null
          whatsapp_number: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          church_name: string
          city: string
          country_code: string
          country_name: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          message_affiliation?: string
          pastor_or_contact_name: string
          pastor_title?: string | null
          postal_code?: string | null
          service_times?: string | null
          state_region?: string | null
          status?: string
          updated_at?: string
          verified?: boolean
          verified_by_admin_id?: string | null
          website?: string | null
          whatsapp_number: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          church_name?: string
          city?: string
          country_code?: string
          country_name?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          message_affiliation?: string
          pastor_or_contact_name?: string
          pastor_title?: string | null
          postal_code?: string | null
          service_times?: string | null
          state_region?: string | null
          status?: string
          updated_at?: string
          verified?: boolean
          verified_by_admin_id?: string | null
          website?: string | null
          whatsapp_number?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
          verse_reference: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
          verse_reference?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          verse_reference?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sermon_cross_references: {
        Row: {
          bible_book: string
          bible_chapter: number
          bible_verse: number
          created_at: string | null
          id: string
          paragraph_number: number
          reference_note: string | null
          sermon_id: string
        }
        Insert: {
          bible_book: string
          bible_chapter: number
          bible_verse: number
          created_at?: string | null
          id?: string
          paragraph_number: number
          reference_note?: string | null
          sermon_id: string
        }
        Update: {
          bible_book?: string
          bible_chapter?: number
          bible_verse?: number
          created_at?: string | null
          id?: string
          paragraph_number?: number
          reference_note?: string | null
          sermon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sermon_cross_references_sermon_id_fkey"
            columns: ["sermon_id"]
            isOneToOne: false
            referencedRelation: "sermons"
            referencedColumns: ["id"]
          },
        ]
      }
      sermon_paragraphs: {
        Row: {
          content: string
          created_at: string | null
          id: string
          paragraph_number: number
          sermon_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          paragraph_number: number
          sermon_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          paragraph_number?: number
          sermon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sermon_paragraphs_sermon_id_fkey"
            columns: ["sermon_id"]
            isOneToOne: false
            referencedRelation: "sermons"
            referencedColumns: ["id"]
          },
        ]
      }
      sermons: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          location: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          location: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          location?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          note: string | null
          paragraph_number: number
          sermon_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note?: string | null
          paragraph_number: number
          sermon_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string | null
          paragraph_number?: number
          sermon_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_sermon_id_fkey"
            columns: ["sermon_id"]
            isOneToOne: false
            referencedRelation: "sermons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cross_references: {
        Row: {
          created_at: string | null
          from_book: string
          from_chapter: number
          from_verse: number
          id: string
          notes: string | null
          relationship_type: string | null
          to_book: string
          to_chapter: number
          to_verse: number
          to_verse_end: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          from_book: string
          from_chapter: number
          from_verse: number
          id?: string
          notes?: string | null
          relationship_type?: string | null
          to_book: string
          to_chapter: number
          to_verse: number
          to_verse_end?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          from_book?: string
          from_chapter?: number
          from_verse?: number
          id?: string
          notes?: string | null
          relationship_type?: string | null
          to_book?: string
          to_chapter?: number
          to_verse?: number
          to_verse_end?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_highlights: {
        Row: {
          book: string
          chapter: number
          color: string
          created_at: string | null
          id: string
          note: string | null
          updated_at: string | null
          user_id: string
          verse: number
        }
        Insert: {
          book: string
          chapter: number
          color: string
          created_at?: string | null
          id?: string
          note?: string | null
          updated_at?: string | null
          user_id: string
          verse: number
        }
        Update: {
          book?: string
          chapter?: number
          color?: string
          created_at?: string | null
          id?: string
          note?: string | null
          updated_at?: string | null
          user_id?: string
          verse?: number
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sermon_title: string | null
          source_id: string
          source_type: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          verse_reference: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sermon_title?: string | null
          source_id: string
          source_type: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          verse_reference?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sermon_title?: string | null
          source_id?: string
          source_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          verse_reference?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          bible_version: string | null
          color_scheme: string | null
          created_at: string | null
          font_family: string | null
          font_size: string | null
          id: string
          reader_font_family: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bible_version?: string | null
          color_scheme?: string | null
          created_at?: string | null
          font_family?: string | null
          font_size?: string | null
          id?: string
          reader_font_family?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bible_version?: string | null
          color_scheme?: string | null
          created_at?: string | null
          font_family?: string | null
          font_size?: string | null
          id?: string
          reader_font_family?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
