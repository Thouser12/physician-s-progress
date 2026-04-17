export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_records: {
        Row: {
          id: string
          user_id: string
          record_date: string
          level: string
          goals: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          record_date: string
          level?: string
          goals?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          record_date?: string
          level?: string
          goals?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          name: string
          level: string
          terms_accepted: boolean
          role: string
          week_start_date: string | null
          avatar_url: string | null
          achievements_seen: string[]
          last_chat_read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string
          level?: string
          terms_accepted?: boolean
          role?: string
          week_start_date?: string | null
          avatar_url?: string | null
          achievements_seen?: string[]
          last_chat_read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          level?: string
          terms_accepted?: boolean
          role?: string
          week_start_date?: string | null
          avatar_url?: string | null
          achievements_seen?: string[]
          last_chat_read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_summaries: {
        Row: {
          id: string
          user_id: string
          week_start: string
          week_end: string
          percentage: number
          level_before: string
          level_after: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          week_end: string
          percentage?: number
          level_before: string
          level_after: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          week_end?: string
          percentage?: number
          level_before?: string
          level_after?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      doctor_profiles: {
        Row: {
          id: string
          name: string
          crm_number: string | null
          specialty: string | null
          doctor_code: string
          avatar_url: string | null
          last_chat_read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string
          crm_number?: string | null
          specialty?: string | null
          doctor_code: string
          avatar_url?: string | null
          last_chat_read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          crm_number?: string | null
          specialty?: string | null
          doctor_code?: string
          avatar_url?: string | null
          last_chat_read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctor_connections: {
        Row: {
          id: string
          user_id: string
          doctor_id: string
          doctor_user_id: string | null
          doctor_name: string
          status: string
          custom_goals: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          doctor_id: string
          doctor_user_id?: string | null
          doctor_name?: string
          status?: string
          custom_goals?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          doctor_id?: string
          doctor_user_id?: string | null
          doctor_name?: string
          status?: string
          custom_goals?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          doctor_id: string
          patient_id: string
          connection_id: string
          title: string
          description: string | null
          frequency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          patient_id: string
          connection_id: string
          title: string
          description?: string | null
          frequency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          patient_id?: string
          connection_id?: string
          title?: string
          description?: string | null
          frequency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      connection_read_states: {
        Row: {
          connection_id: string
          user_id: string
          last_read_at: string
          updated_at: string
        }
        Insert: {
          connection_id: string
          user_id: string
          last_read_at?: string
          updated_at?: string
        }
        Update: {
          connection_id?: string
          user_id?: string
          last_read_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          connection_id: string
          sender_id: string
          sender_type: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          sender_id: string
          sender_type: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          connection_id?: string
          sender_id?: string
          sender_type?: string
          text?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_doctor_code: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
