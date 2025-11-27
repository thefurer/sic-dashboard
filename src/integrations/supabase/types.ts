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
      documents: {
        Row: {
          category: string
          file_url: string
          id: string
          title: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          category: string
          file_url: string
          id?: string
          title: string
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          category?: string
          file_url?: string
          id?: string
          title?: string
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      evaluation_items: {
        Row: {
          category: string
          created_at: string | null
          evidence_url: string | null
          fase: string | null
          id: string
          indicator_name: string
          justification: string | null
          monto: number | null
          porcentaje_ejecucion: number | null
          quantity: number | null
          report_id: string
          score_obtained: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          evidence_url?: string | null
          fase?: string | null
          id?: string
          indicator_name: string
          justification?: string | null
          monto?: number | null
          porcentaje_ejecucion?: number | null
          quantity?: number | null
          report_id: string
          score_obtained?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          evidence_url?: string | null
          fase?: string | null
          id?: string
          indicator_name?: string
          justification?: string | null
          monto?: number | null
          porcentaje_ejecucion?: number | null
          quantity?: number | null
          report_id?: string
          score_obtained?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_items_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "evaluation_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_reports: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          status: string
          submitted_at: string | null
          total_score: number | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          status?: string
          submitted_at?: string | null
          total_score?: number | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          status?: string
          submitted_at?: string | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      planning_activities: {
        Row: {
          activity: string
          created_at: string
          end_date: string
          id: string
          objective: string
          order_index: number
          plan_id: string
          responsibles: Json
          start_date: string
          verification_means: string
        }
        Insert: {
          activity: string
          created_at?: string
          end_date: string
          id?: string
          objective: string
          order_index?: number
          plan_id: string
          responsibles?: Json
          start_date: string
          verification_means: string
        }
        Update: {
          activity?: string
          created_at?: string
          end_date?: string
          id?: string
          objective?: string
          order_index?: number
          plan_id?: string
          responsibles?: Json
          start_date?: string
          verification_means?: string
        }
        Relationships: [
          {
            foreignKeyName: "planning_activities_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planning_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      planning_members: {
        Row: {
          created_at: string
          id: string
          member_type: string
          plan_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_type: string
          plan_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_type?: string
          plan_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planning_members_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planning_sheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      planning_sheets: {
        Row: {
          created_at: string
          created_by: string
          drive_link: string | null
          id: string
          meeting_schedule: string
          period_name: string
          president_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          drive_link?: string | null
          id?: string
          meeting_schedule?: string
          period_name: string
          president_name?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          drive_link?: string | null
          id?: string
          meeting_schedule?: string
          period_name?: string
          president_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          cv_url: string | null
          email: string | null
          full_name: string
          id: string
          is_approved: boolean
          phone: string | null
          researcher_code: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string | null
          full_name: string
          id: string
          is_approved?: boolean
          phone?: string | null
          researcher_code?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_approved?: boolean
          phone?: string | null
          researcher_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_investigators: {
        Row: {
          created_at: string
          id: string
          investigator_id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          investigator_id: string
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          investigator_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_investigators_investigator_id_fkey"
            columns: ["investigator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_investigators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          investigator_id: string
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          title: string
          type: Database["public"]["Enums"]["project_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          investigator_id: string
          start_date: string
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          type: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          investigator_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_investigator_id_fkey"
            columns: ["investigator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scientific_books: {
        Row: {
          authors: string
          created_at: string
          editorial: string | null
          id: string
          isbn: string
          title: string
          updated_at: string
          user_id: string
          year: string
        }
        Insert: {
          authors: string
          created_at?: string
          editorial?: string | null
          id?: string
          isbn: string
          title: string
          updated_at?: string
          user_id: string
          year: string
        }
        Update: {
          authors?: string
          created_at?: string
          editorial?: string | null
          id?: string
          isbn?: string
          title?: string
          updated_at?: string
          user_id?: string
          year?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "researcher" | "student"
      project_status: "Proposed" | "In Progress" | "Finished"
      project_type:
        | "Basic Research"
        | "Applied Research"
        | "Tech Development"
        | "Innovation"
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
      app_role: ["admin", "researcher", "student"],
      project_status: ["Proposed", "In Progress", "Finished"],
      project_type: [
        "Basic Research",
        "Applied Research",
        "Tech Development",
        "Innovation",
      ],
    },
  },
} as const
