export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: Database['public']['Enums']['account_type'];
          initial_balance: number;
          is_archived: boolean;
          counts_as_liquid: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          type: Database['public']['Enums']['account_type'];
          initial_balance?: number;
          is_archived?: boolean;
          counts_as_liquid?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: Database['public']['Enums']['account_type'];
          initial_balance?: number;
          is_archived?: boolean;
          counts_as_liquid?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kind: Database['public']['Enums']['category_kind'];
          icon: string;
          color: string;
          parent_id: string | null;
          sort_order: number;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          kind: Database['public']['Enums']['category_kind'];
          icon: string;
          color: string;
          parent_id?: string | null;
          sort_order?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          kind?: Database['public']['Enums']['category_kind'];
          icon?: string;
          color?: string;
          parent_id?: string | null;
          sort_order?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: Database['public']['Enums']['transaction_type'];
          nature: Database['public']['Enums']['nature'] | null;
          amount: number;
          account_id: string;
          transfer_account_id: string | null;
          category_id: string | null;
          occurred_on: string;
          note: string | null;
          recurring_rule_id: string | null;
          occurrence_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          type: Database['public']['Enums']['transaction_type'];
          nature?: Database['public']['Enums']['nature'] | null;
          amount: number;
          account_id: string;
          transfer_account_id?: string | null;
          category_id?: string | null;
          occurred_on: string;
          note?: string | null;
          recurring_rule_id?: string | null;
          occurrence_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database['public']['Enums']['transaction_type'];
          nature?: Database['public']['Enums']['nature'] | null;
          amount?: number;
          account_id?: string;
          transfer_account_id?: string | null;
          category_id?: string | null;
          occurred_on?: string;
          note?: string | null;
          recurring_rule_id?: string | null;
          occurrence_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recurring_rules: {
        Row: {
          id: string;
          user_id: string;
          type: Database['public']['Enums']['transaction_type'];
          nature: Database['public']['Enums']['nature'];
          amount: number;
          account_id: string;
          category_id: string;
          note: string | null;
          frequency: Database['public']['Enums']['frequency'];
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          type: Database['public']['Enums']['transaction_type'];
          nature: Database['public']['Enums']['nature'];
          amount: number;
          account_id: string;
          category_id: string;
          note?: string | null;
          frequency: Database['public']['Enums']['frequency'];
          start_date: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database['public']['Enums']['transaction_type'];
          nature?: Database['public']['Enums']['nature'];
          amount?: number;
          account_id?: string;
          category_id?: string;
          note?: string | null;
          frequency?: Database['public']['Enums']['frequency'];
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      account_balances: {
        Row: {
          account_id: string | null;
          user_id: string | null;
          name: string | null;
          type: Database['public']['Enums']['account_type'] | null;
          initial_balance: number | null;
          is_archived: boolean | null;
          balance: number | null;
          counts_as_liquid: boolean | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_owned_category: {
        Args: {
          category_id: string;
        };
        Returns: boolean;
      };
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      account_type: 'cash' | 'bank' | 'savings' | 'credit_card';
      category_kind: 'income' | 'expense';
      transaction_type: 'income' | 'expense' | 'transfer';
      nature: 'base' | 'extra';
      frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
