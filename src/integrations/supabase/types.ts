export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      bible_verses: {
        Row: {
          id: string;
          book: string;
          chapter: number;
          verse: number;
          text: string;
          translation: string;
          is_jesus_words: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book: string;
          chapter: number;
          verse: number;
          text: string;
          translation?: string;
          is_jesus_words?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book?: string;
          chapter?: number;
          verse?: number;
          text?: string;
          translation?: string;
          is_jesus_words?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      cross_references: {
        Row: {
          id: string;
          from_book: string;
          from_chapter: number;
          from_verse: number;
          to_book: string;
          to_chapter: number;
          to_verse: number;
          to_verse_end: number | null;
          relationship_type: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_book: string;
          from_chapter: number;
          from_verse: number;
          to_book: string;
          to_chapter: number;
          to_verse: number;
          to_verse_end?: number | null;
          relationship_type?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_book?: string;
          from_chapter?: number;
          from_verse?: number;
          to_book?: string;
          to_chapter?: number;
          to_verse?: number;
          to_verse_end?: number | null;
          relationship_type?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      notes: {
        Row: {
          content: string | null;
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
          verse_reference: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: string;
          title: string;
          updated_at?: string;
          user_id: string;
          verse_reference?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          verse_reference?: string | null;
        };
        Relationships: [];
      };

      user_notes: {
        Row: {
          id: string;
          user_id: string;
          source_type: Database["public"]["Enums"]["note_source_type"];
          source_id: string;
          content: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_type: Database["public"]["Enums"]["note_source_type"];
          source_id: string;
          content: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_type?: Database["public"]["Enums"]["note_source_type"];
          source_id?: string;
          content?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      sermons: {
        Row: {
          id: string;
          title: string;
          date: string;
          location: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          location: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      sermon_paragraphs: {
        Row: {
          id: string;
          sermon_id: string;
          paragraph_number: number;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sermon_id: string;
          paragraph_number: number;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sermon_id?: string;
          paragraph_number?: number;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sermon_paragraphs_sermon_id_fkey";
            columns: ["sermon_id"];
            referencedRelation: "sermons";
            referencedColumns: ["id"];
          }
        ];
      };

      sermon_cross_references: {
        Row: {
          id: string;
          bible_book: string;
          bible_chapter: number;
          bible_verse: number;
          sermon_id: string;
          paragraph_id: string;
          reference_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bible_book: string;
          bible_chapter: number;
          bible_verse: number;
          sermon_id: string;
          paragraph_id: string;
          reference_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bible_book?: string;
          bible_chapter?: number;
          bible_verse?: number;
          sermon_id?: string;
          paragraph_id?: string;
          reference_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sermon_cross_references_sermon_id_fkey";
            columns: ["sermon_id"];
            referencedRelation: "sermons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sermon_cross_references_paragraph_id_fkey";
            columns: ["paragraph_id"];
            referencedRelation: "sermon_paragraphs";
            referencedColumns: ["id"];
          }
        ];
      };

      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      user_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          sermon_id: string | null;
          paragraph_number: number | null;
          book: string | null;
          chapter: number | null;
          verse: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sermon_id?: string | null;
          paragraph_number?: number | null;
          book?: string | null;
          chapter?: number | null;
          verse?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sermon_id?: string | null;
          paragraph_number?: number | null;
          book?: string | null;
          chapter?: number | null;
          verse?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_sermon_id_fkey";
            columns: ["sermon_id"];
            referencedRelation: "sermons";
            referencedColumns: ["id"];
          }
        ];
      };

      user_highlights: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string | null;
          book: string;
          chapter: number;
          verse: number;
          color: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id?: string | null;
          book: string;
          chapter: number;
          verse: number;
          color?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          verse_id?: string | null;
          book?: string;
          chapter?: number;
          verse?: number;
          color?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_highlights_verse_id_fkey";
            columns: ["verse_id"];
            referencedRelation: "bible_verses";
            referencedColumns: ["id"];
          }
        ];
      };

      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };

      user_settings: {
        Row: {
          id: string;
          user_id: string;
          font_size: number;
          theme: string;
          bible_version: string;
          font_family: string;
          reader_font_family: string;
          color_scheme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          font_size?: number;
          theme?: string;
          bible_version?: string;
          font_family?: string;
          reader_font_family?: string;
          color_scheme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          font_size?: number;
          theme?: string;
          bible_version?: string;
          font_family?: string;
          reader_font_family?: string;
          color_scheme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      user_activity_log: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          source_type: string;
          source_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          source_type: string;
          source_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          source_type?: string;
          source_id?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      search_bible_verses: {
        Args: {
          search_query: string;
          result_limit?: number;
        };
        Returns: {
          id: string;
          book: string;
          chapter: number;
          verse: number;
          text: string;
          translation: string;
          is_jesus_words: boolean;
          relevance: number;
        }[];
      };
      search_sermon_content: {
        Args: {
          search_query: string;
          result_limit?: number;
        };
        Returns: {
          sermon_id: string;
          sermon_title: string;
          sermon_date: string;
          sermon_location: string;
          paragraph_number: number;
          content: string;
          relevance: number;
        }[];
      };
    };

    Enums: {
      app_role: "admin" | "moderator" | "user";
      note_source_type: "bible" | "sermon";
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]
      )
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]
    )[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      note_source_type: ["bible", "sermon"],
    },
  },
} as const;
