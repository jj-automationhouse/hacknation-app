export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UnitType = "voivodeship" | "county" | "municipality" | "institution";
export type UserRole = "basic" | "approver" | "admin";
export type BudgetStatus = "draft" | "pending" | "approved" | "rejected";
export type SubmissionStatus = "draft" | "pending" | "approved" | "returned";
export type ClarificationStatus = "none" | "requested" | "responded" | "resolved";

export interface Database {
  public: {
    Tables: {
      organizational_units: {
        Row: {
          id: string;
          name: string;
          type: UnitType;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: UnitType;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: UnitType;
          parent_id?: string | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          unit_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: UserRole;
          unit_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: UserRole;
          unit_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_items: {
        Row: {
          id: string;
          unit_id: string;
          budget_section: string;
          budget_division: string;
          category: string;
          description: string;
          year: number;
          amount: number;
          status: BudgetStatus;
          comment: string | null;
          submitted_to: string | null;
          clarification_status: ClarificationStatus;
          has_unread_comments: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          budget_section: string;
          budget_division: string;
          category: string;
          description: string;
          year: number;
          amount: number;
          status?: BudgetStatus;
          comment?: string | null;
          submitted_to?: string | null;
          clarification_status?: ClarificationStatus;
          has_unread_comments?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unit_id?: string;
          budget_section?: string;
          budget_division?: string;
          category?: string;
          description?: string;
          year?: number;
          amount?: number;
          status?: BudgetStatus;
          comment?: string | null;
          submitted_to?: string | null;
          clarification_status?: ClarificationStatus;
          has_unread_comments?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_submissions: {
        Row: {
          id: string;
          from_unit_id: string;
          to_unit_id: string;
          status: SubmissionStatus;
          submitted_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_unit_id: string;
          to_unit_id: string;
          status?: SubmissionStatus;
          submitted_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_unit_id?: string;
          to_unit_id?: string;
          status?: SubmissionStatus;
          submitted_at?: string;
          created_at?: string;
        };
      };
      budget_submission_items: {
        Row: {
          submission_id: string;
          budget_item_id: string;
          created_at: string;
        };
        Insert: {
          submission_id: string;
          budget_item_id: string;
          created_at?: string;
        };
        Update: {
          submission_id?: string;
          budget_item_id?: string;
          created_at?: string;
        };
      };
      budget_comments: {
        Row: {
          id: string;
          budget_item_id: string;
          author_id: string;
          author_name: string;
          content: string;
          is_response: boolean | null;
          parent_comment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          budget_item_id: string;
          author_id: string;
          author_name: string;
          content: string;
          is_response?: boolean | null;
          parent_comment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          budget_item_id?: string;
          author_id?: string;
          author_name?: string;
          content?: string;
          is_response?: boolean | null;
          parent_comment_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      get_descendant_units: {
        Args: { unit_uuid: string };
        Returns: { descendant_id: string }[];
      };
      get_ancestor_units: {
        Args: { unit_uuid: string };
        Returns: { ancestor_id: string }[];
      };
      can_access_unit: {
        Args: { target_unit_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      unit_type: UnitType;
      user_role: UserRole;
      budget_status: BudgetStatus;
      submission_status: SubmissionStatus;
      clarification_status: ClarificationStatus;
    };
  };
}
