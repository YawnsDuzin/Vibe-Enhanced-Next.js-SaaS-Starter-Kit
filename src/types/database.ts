export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          team_id: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          status: 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'PAST_DUE' | 'TRIALING' | 'UNPAID';
          plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          status?: 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'PAST_DUE' | 'TRIALING' | 'UNPAID';
          plan?: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          status?: 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'PAST_DUE' | 'TRIALING' | 'UNPAID';
          plan?: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image: string | null;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image?: string | null;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image?: string | null;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
          created_at?: string;
          updated_at?: string;
        };
      };
      team_invitations: {
        Row: {
          id: string;
          team_id: string;
          email: string;
          role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
          token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          email: string;
          role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
          token: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          email?: string;
          role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
          token?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      prompts: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          content: string;
          category: 'GENERAL' | 'WRITING' | 'CODING' | 'MARKETING' | 'SALES' | 'SUPPORT' | 'CUSTOM';
          variables: Json | null;
          is_public: boolean;
          is_system: boolean;
          user_id: string | null;
          team_id: string | null;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          content: string;
          category?: 'GENERAL' | 'WRITING' | 'CODING' | 'MARKETING' | 'SALES' | 'SUPPORT' | 'CUSTOM';
          variables?: Json | null;
          is_public?: boolean;
          is_system?: boolean;
          user_id?: string | null;
          team_id?: string | null;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          content?: string;
          category?: 'GENERAL' | 'WRITING' | 'CODING' | 'MARKETING' | 'SALES' | 'SUPPORT' | 'CUSTOM';
          variables?: Json | null;
          is_public?: boolean;
          is_system?: boolean;
          user_id?: string | null;
          team_id?: string | null;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      prompt_usages: {
        Row: {
          id: string;
          prompt_id: string;
          user_id: string;
          input: Json | null;
          output: string | null;
          tokens: number | null;
          duration: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          user_id: string;
          input?: Json | null;
          output?: string | null;
          tokens?: number | null;
          duration?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          prompt_id?: string;
          user_id?: string;
          input?: Json | null;
          output?: string | null;
          tokens?: number | null;
          duration?: number | null;
          created_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          name: string;
          key: string;
          user_id: string;
          last_used_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          key: string;
          user_id: string;
          last_used_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          key?: string;
          user_id?: string;
          last_used_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          subscription_id: string;
          stripe_invoice_id: string;
          amount_paid: number;
          amount_due: number;
          currency: string;
          status: string;
          invoice_url: string | null;
          invoice_pdf: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          stripe_invoice_id: string;
          amount_paid: number;
          amount_due: number;
          currency?: string;
          status: string;
          invoice_url?: string | null;
          invoice_pdf?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          stripe_invoice_id?: string;
          amount_paid?: number;
          amount_due?: number;
          currency?: string;
          status?: string;
          invoice_url?: string | null;
          invoice_pdf?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
      team_role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
      subscription_status: 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'PAST_DUE' | 'TRIALING' | 'UNPAID';
      plan_type: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
      prompt_category: 'GENERAL' | 'WRITING' | 'CODING' | 'MARKETING' | 'SALES' | 'SUPPORT' | 'CUSTOM';
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
