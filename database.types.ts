export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      event_locations: {
        Row: {
          event_id: string;
          location_id: string;
        };
        Insert: {
          event_id: string;
          location_id: string;
        };
        Update: {
          event_id?: string;
          location_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_locations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_locations_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          ends_at: string | null;
          id: string;
          starts_at: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          starts_at?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          starts_at?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      form_submissions: {
        Row: {
          brevo_error: string | null;
          brevo_id: number | null;
          brevo_sent_at: string | null;
          brevo_status: string | null;
          country: string | null;
          email: string | null;
          f_name: string | null;
          id: string;
          l_name: string | null;
          location_id: string | null;
          payload: Json | null;
          phone: string | null;
          qr_token: string | null;
          region: string | null;
          source: string | null;
          submitted_at: string | null;
          volunteer_id: string | null;
        };
        Insert: {
          brevo_error?: string | null;
          brevo_id?: number | null;
          brevo_sent_at?: string | null;
          brevo_status?: string | null;
          country?: string | null;
          email?: string | null;
          f_name?: string | null;
          id?: string;
          l_name?: string | null;
          location_id?: string | null;
          payload?: Json | null;
          phone?: string | null;
          qr_token?: string | null;
          region?: string | null;
          source?: string | null;
          submitted_at?: string | null;
          volunteer_id?: string | null;
        };
        Update: {
          brevo_error?: string | null;
          brevo_id?: number | null;
          brevo_sent_at?: string | null;
          brevo_status?: string | null;
          country?: string | null;
          email?: string | null;
          f_name?: string | null;
          id?: string;
          l_name?: string | null;
          location_id?: string | null;
          payload?: Json | null;
          phone?: string | null;
          qr_token?: string | null;
          region?: string | null;
          source?: string | null;
          submitted_at?: string | null;
          volunteer_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "form_submissions_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "form_submissions_volunteer_id_fkey";
            columns: ["volunteer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interactions: {
        Row: {
          contact_name: string | null;
          created_at: string | null;
          date: string;
          event_id: string | null;
          friendly: boolean | null;
          id: string;
          location_id: string;
          notes: string | null;
          outcome: string;
          volunteer_id: string;
        };
        Insert: {
          contact_name?: string | null;
          created_at?: string | null;
          date?: string;
          event_id?: string | null;
          friendly?: boolean | null;
          id?: string;
          location_id: string;
          notes?: string | null;
          outcome: string;
          volunteer_id: string;
        };
        Update: {
          contact_name?: string | null;
          created_at?: string | null;
          date?: string;
          event_id?: string | null;
          friendly?: boolean | null;
          id?: string;
          location_id?: string;
          notes?: string | null;
          outcome?: string;
          volunteer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interactions_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interactions_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interactions_volunteer_id_fkey";
            columns: ["volunteer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      locations: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          qr_token: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          qr_token?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          qr_token?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      qr_tokens: {
        Row: {
          active: boolean;
          created_at: string | null;
          expires_at: string | null;
          token: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string | null;
          expires_at?: string | null;
          token: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          created_at?: string | null;
          expires_at?: string | null;
          token?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "qr_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      qr_visits: {
        Row: {
          id: number;
          ip: unknown | null;
          referer: string | null;
          token: string | null;
          user_agent: string | null;
          visited_at: string | null;
        };
        Insert: {
          id?: number;
          ip?: unknown | null;
          referer?: string | null;
          token?: string | null;
          user_agent?: string | null;
          visited_at?: string | null;
        };
        Update: {
          id?: number;
          ip?: unknown | null;
          referer?: string | null;
          token?: string | null;
          user_agent?: string | null;
          visited_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "qr_visits_token_fkey";
            columns: ["token"];
            isOneToOne: false;
            referencedRelation: "qr_tokens";
            referencedColumns: ["token"];
          },
        ];
      };
      roles: {
        Row: {
          id: string;
        };
        Insert: {
          id: string;
        };
        Update: {
          id?: string;
        };
        Relationships: [];
      };
      user_locations: {
        Row: {
          location_id: string;
          user_id: string;
        };
        Insert: {
          location_id: string;
          user_id: string;
        };
        Update: {
          location_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_locations_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_locations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          role_id: string;
          user_id: string;
        };
        Insert: {
          role_id: string;
          user_id: string;
        };
        Update: {
          role_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
