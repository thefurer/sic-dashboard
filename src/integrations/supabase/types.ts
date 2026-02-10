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
      app_settings: {
        Row: {
          career_name: string | null
          created_at: string | null
          faculty_name: string | null
          header_logo_left: string | null
          header_logo_right: string | null
          header_subtext: string | null
          id: string
          institution_name: string
          instructions_pdf_url: string | null
          mission_text: string | null
          objectives_text: string | null
          planning_pdf_url: string | null
          registry_pdf_url: string | null
          research_lines: Json | null
          signature_coordinator_name: string | null
          signature_president_name: string | null
          signature_responsible_name: string | null
          updated_at: string | null
          vision_text: string | null
          work_plan_pdf_url: string | null
        }
        Insert: {
          career_name?: string | null
          created_at?: string | null
          faculty_name?: string | null
          header_logo_left?: string | null
          header_logo_right?: string | null
          header_subtext?: string | null
          id?: string
          institution_name?: string
          instructions_pdf_url?: string | null
          mission_text?: string | null
          objectives_text?: string | null
          planning_pdf_url?: string | null
          registry_pdf_url?: string | null
          research_lines?: Json | null
          signature_coordinator_name?: string | null
          signature_president_name?: string | null
          signature_responsible_name?: string | null
          updated_at?: string | null
          vision_text?: string | null
          work_plan_pdf_url?: string | null
        }
        Update: {
          career_name?: string | null
          created_at?: string | null
          faculty_name?: string | null
          header_logo_left?: string | null
          header_logo_right?: string | null
          header_subtext?: string | null
          id?: string
          institution_name?: string
          instructions_pdf_url?: string | null
          mission_text?: string | null
          objectives_text?: string | null
          planning_pdf_url?: string | null
          registry_pdf_url?: string | null
          research_lines?: Json | null
          signature_coordinator_name?: string | null
          signature_president_name?: string | null
          signature_responsible_name?: string | null
          updated_at?: string | null
          vision_text?: string | null
          work_plan_pdf_url?: string | null
        }
        Relationships: []
      }
      assigned_tasks: {
        Row: {
          activity_id: string
          admin_observations: string | null
          created_at: string | null
          evidence_description: string | null
          evidence_link: string | null
          evidence_url: string | null
          id: string
          plan_id: string
          read_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_id: string
          admin_observations?: string | null
          created_at?: string | null
          evidence_description?: string | null
          evidence_link?: string | null
          evidence_url?: string | null
          id?: string
          plan_id: string
          read_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string
          admin_observations?: string | null
          created_at?: string | null
          evidence_description?: string | null
          evidence_link?: string | null
          evidence_url?: string | null
          id?: string
          plan_id?: string
          read_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assigned_tasks_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "planning_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planning_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
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
          article_metadata: Json | null
          category: string
          created_at: string | null
          evidence_details: Json | null
          evidence_url: string | null
          fase: string | null
          id: string
          indicator_name: string
          justification: string | null
          monto: number | null
          porcentaje_ejecucion: number | null
          project_roles: Json | null
          proposal_type: string | null
          quantity: number | null
          related_project_id: string | null
          report_id: string
          score_obtained: number | null
          team_members: Json | null
          updated_at: string | null
        }
        Insert: {
          article_metadata?: Json | null
          category: string
          created_at?: string | null
          evidence_details?: Json | null
          evidence_url?: string | null
          fase?: string | null
          id?: string
          indicator_name: string
          justification?: string | null
          monto?: number | null
          porcentaje_ejecucion?: number | null
          project_roles?: Json | null
          proposal_type?: string | null
          quantity?: number | null
          related_project_id?: string | null
          report_id: string
          score_obtained?: number | null
          team_members?: Json | null
          updated_at?: string | null
        }
        Update: {
          article_metadata?: Json | null
          category?: string
          created_at?: string | null
          evidence_details?: Json | null
          evidence_url?: string | null
          fase?: string | null
          id?: string
          indicator_name?: string
          justification?: string | null
          monto?: number | null
          porcentaje_ejecucion?: number | null
          project_roles?: Json | null
          proposal_type?: string | null
          quantity?: number | null
          related_project_id?: string | null
          report_id?: string
          score_obtained?: number | null
          team_members?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_items_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "official_projects"
            referencedColumns: ["id"]
          },
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
          admin_observations: string | null
          correction_deadline: string | null
          created_at: string | null
          edit_justification: string | null
          edited_after_submission: boolean | null
          group_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          total_score: number | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          admin_observations?: string | null
          correction_deadline?: string | null
          created_at?: string | null
          edit_justification?: string | null
          edited_after_submission?: boolean | null
          group_id: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          total_score?: number | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          admin_observations?: string | null
          correction_deadline?: string | null
          created_at?: string | null
          edit_justification?: string | null
          edited_after_submission?: boolean | null
          group_id?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          created_at: string
          full_content: string
          id: string
          image_url: string
          is_active: boolean
          short_description: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          full_content: string
          id?: string
          image_url: string
          is_active?: boolean
          short_description: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          full_content?: string
          id?: string
          image_url?: string
          is_active?: boolean
          short_description?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      official_projects: {
        Row: {
          created_at: string
          documents: Json | null
          id: string
          name: string
          project_document_url: string | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          documents?: Json | null
          id?: string
          name: string
          project_document_url?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          documents?: Json | null
          id?: string
          name?: string
          project_document_url?: string | null
          updated_at?: string
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
          meeting_schedule: Json | null
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
          meeting_schedule?: Json | null
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
          meeting_schedule?: Json | null
          period_name?: string
          president_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_contacts: {
        Row: {
          created_at: string
          email: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cedula: string | null
          country_code: string | null
          created_at: string
          cv_url: string | null
          full_name: string
          id: string
          is_approved: boolean
          last_login_at: string | null
          orcid: string | null
          research_role: string | null
          researcher_code: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cedula?: string | null
          country_code?: string | null
          created_at?: string
          cv_url?: string | null
          full_name: string
          id: string
          is_approved?: boolean
          last_login_at?: string | null
          orcid?: string | null
          research_role?: string | null
          researcher_code?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cedula?: string | null
          country_code?: string | null
          created_at?: string
          cv_url?: string | null
          full_name?: string
          id?: string
          is_approved?: boolean
          last_login_at?: string | null
          orcid?: string | null
          research_role?: string | null
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
      has_assigned_task_in_plan: {
        Args: { _plan_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_plan_member: {
        Args: { _plan_id: string; _user_id: string }
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
