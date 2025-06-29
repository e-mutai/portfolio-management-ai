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
      investment_recommendations: {
        Row: {
          asset_name: string
          asset_type: string
          created_at: string
          expected_return: number | null
          id: string
          rationale: string | null
          recommended_allocation: number
          risk_assessment_id: string
          risk_level: string | null
          symbol: string | null
          user_id: string
        }
        Insert: {
          asset_name: string
          asset_type: string
          created_at?: string
          expected_return?: number | null
          id?: string
          rationale?: string | null
          recommended_allocation: number
          risk_assessment_id: string
          risk_level?: string | null
          symbol?: string | null
          user_id: string
        }
        Update: {
          asset_name?: string
          asset_type?: string
          created_at?: string
          expected_return?: number | null
          id?: string
          rationale?: string | null
          recommended_allocation?: number
          risk_assessment_id?: string
          risk_level?: string | null
          symbol?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_recommendations_risk_assessment_id_fkey"
            columns: ["risk_assessment_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          change_amount: number | null
          change_percent: number | null
          company_name: string
          current_price: number
          id: string
          last_updated: string
          market_cap: number | null
          previous_close: number | null
          sector: string | null
          symbol: string
          volume: number | null
        }
        Insert: {
          change_amount?: number | null
          change_percent?: number | null
          company_name: string
          current_price: number
          id?: string
          last_updated?: string
          market_cap?: number | null
          previous_close?: number | null
          sector?: string | null
          symbol: string
          volume?: number | null
        }
        Update: {
          change_amount?: number | null
          change_percent?: number | null
          company_name?: string
          current_price?: number
          id?: string
          last_updated?: string
          market_cap?: number | null
          previous_close?: number | null
          sector?: string | null
          symbol?: string
          volume?: number | null
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          asset_name: string
          asset_type: string
          average_cost: number
          created_at: string
          current_price: number | null
          id: string
          market_value: number | null
          portfolio_id: string
          quantity: number
          symbol: string | null
          updated_at: string
        }
        Insert: {
          asset_name: string
          asset_type: string
          average_cost: number
          created_at?: string
          current_price?: number | null
          id?: string
          market_value?: number | null
          portfolio_id: string
          quantity: number
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          asset_name?: string
          asset_type?: string
          average_cost?: number
          created_at?: string
          current_price?: number | null
          id?: string
          market_value?: number | null
          portfolio_id?: string
          quantity?: number
          symbol?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          cash_balance: number
          created_at: string
          id: string
          name: string
          total_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cash_balance?: number
          created_at?: string
          id?: string
          name?: string
          total_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cash_balance?: number
          created_at?: string
          id?: string
          name?: string
          total_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          id: string
          investment_experience: string | null
          last_name: string | null
          monthly_income: number | null
          occupation: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id: string
          investment_experience?: string | null
          last_name?: string | null
          monthly_income?: number | null
          occupation?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          investment_experience?: string | null
          last_name?: string | null
          monthly_income?: number | null
          occupation?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assessment_data: Json | null
          created_at: string
          debt_to_income_ratio: number | null
          emergency_fund_months: number | null
          financial_goals: string[]
          id: string
          investment_horizon: number
          risk_tolerance: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_data?: Json | null
          created_at?: string
          debt_to_income_ratio?: number | null
          emergency_fund_months?: number | null
          financial_goals: string[]
          id?: string
          investment_horizon: number
          risk_tolerance: string
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_data?: Json | null
          created_at?: string
          debt_to_income_ratio?: number | null
          emergency_fund_months?: number | null
          financial_goals?: string[]
          id?: string
          investment_horizon?: number
          risk_tolerance?: string
          score?: number
          updated_at?: string
          user_id?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
