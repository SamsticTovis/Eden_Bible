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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      circle_members: {
        Row: {
          circle_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          circle_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "prayer_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          verse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          verse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          verse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "verses"
            referencedColumns: ["id"]
          },
        ]
      }
      game_questions: {
        Row: {
          correct_option: string
          created_at: string
          difficulty: string
          game_type: string
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
        }
        Insert: {
          correct_option: string
          created_at?: string
          difficulty?: string
          game_type?: string
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d?: string
          question: string
        }
        Update: {
          correct_option?: string
          created_at?: string
          difficulty?: string
          game_type?: string
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
        }
        Relationships: []
      }
      prayer_circles: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string | null
          max_members: number
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string | null
          max_members?: number
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          max_members?: number
          name?: string
        }
        Relationships: []
      }
      prayer_reactions: {
        Row: {
          created_at: string
          id: string
          reaction: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction?: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_reactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          circle_id: string
          content: string
          created_at: string
          id: string
          user_id: string
          verse_reference: string | null
        }
        Insert: {
          circle_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
          verse_reference?: string | null
        }
        Update: {
          circle_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          verse_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayer_requests_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "prayer_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          chapters_read: number
          created_at: string
          games_won: number
          id: string
          reading_streak: number
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          chapters_read?: number
          created_at?: string
          games_won?: number
          id: string
          reading_streak?: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          chapters_read?: number
          created_at?: string
          games_won?: number
          id?: string
          reading_streak?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      recent_activity: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          icon: string
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_sermons: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          topic: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          topic: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          date_unlocked: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_name: string
          date_unlocked?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_name?: string
          date_unlocked?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string
          daily_streak: number
          id: string
          last_activity_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_streak?: number
          id?: string
          last_activity_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_streak?: number
          id?: string
          last_activity_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verses: {
        Row: {
          book: string | null
          created_at: string
          id: string
          mood: string | null
          reference: string
          tags: string[]
          text: string
          version: string
        }
        Insert: {
          book?: string | null
          created_at?: string
          id?: string
          mood?: string | null
          reference: string
          tags?: string[]
          text: string
          version?: string
        }
        Update: {
          book?: string | null
          created_at?: string
          id?: string
          mood?: string | null
          reference?: string
          tags?: string[]
          text?: string
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
