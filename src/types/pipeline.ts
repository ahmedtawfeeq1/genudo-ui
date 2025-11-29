
/************************************************************
 * PIPELINE CORE TYPES (keep in sync with backend schema)
 ************************************************************/
export interface Pipeline {
  id: string;
  user_id: string;
  created_at: string; // Made required for use everywhere
  updated_at?: string;
  pipeline_name: string;
  pipeline_description?: string | null; // Changed from required to optional to match usage
  connector_account_id?: string | null;
  is_active: boolean;
  is_archived?: boolean;
  routing_instructions?: string | null;
}

// Map backend JSON-like type to TypeScript
// Use any for broad support—change if you use a stricter Json type in your project
export type Json = any;

export interface ConnectorAccount {
  id: string;
  user_id: string;
  channel_type:
    | "WHATSAPP"
    | "GMAIL"
    | "OUTLOOK"
    | "IMAP"
    | "INSTAGRAM"
    | "MESSENGER"
    | "TELEGRAM"
    | "WEBCHAT"
    | "API"
    | "LINKEDIN";
  connector_account_identifier: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  connector_api_key?: string | null;
  connector_sender_provider_id: string;
  external_account_id: string;
  result_metadata?: any | null; // Accept any type or null (was: Record<string, any> | null
}

// Simple stage definition as used in settings/analytics UI
export interface StageData {
  id: string;
  stage_name: string;
  stage_nature: "won" | "lost" | "neutral";
  created_at?: string;
  opportunity_count?: number;
  total_cost?: number;
}

/************************************************************
 * PIPELINE BOARD/AI TYPES
 ************************************************************/
// For react-query and ai hooks (pipeline editing, assignments, agents)
export interface Stage {
  id: string;
  pipeline_id: string;
  name: string;
  description?: string;
  position: number;
  color?: string;
  x_position?: number;
  y_position?: number;
  created_at?: string;
  updated_at?: string;
  badge?: string;
  stage_nature?: "won" | "lost" | "neutral";
}

export interface Agent {
  id: string;
  name: string;
  role?: string;
  persona?: string;
  instructions?: string;
  capabilities?: string[];
  avatar_url?: string;
  color?: string;
  created_at?: string;
}

export interface StageAgent {
  id: string;
  stage_id: string;
  agent_id: string;
  role: "primary" | "secondary" | "support";
}

/************************************************************
 * ANALYTICS/DASHBOARD TYPES
 ************************************************************/
export interface PipelineMetrics {
  total_cost: number;
  total_opportunities: number;
  active_opportunities: number;
  won_opportunities: number;
  lost_opportunities: number;
}

// For charts and analytics tabs (e.g. Win Rate Pie, Perf, etc)
export interface PipelineConvMetrics {
  pipeline_id: string;
  pipeline_name: string;
  total_opportunities: number;
  won_opportunities: number;
  lost_opportunities: number;
  overall_win_rate: string; // Always as string for display, e.g. '67.5'
  avg_pipeline_duration_days?: number | null;
  velocity_opportunities_per_day?: number | null;
  total_cost_usd?: number | null;
}

// Stage performance analytics row
export interface StagePerf {
  id: string;
  stage_id: string;
  pipeline_id: string;
  stage_name: string;
  stage_nature: "won" | "lost" | "neutral";
  total_opportunities: number;
  won_opportunities: number;
  lost_opportunities: number;
  active_opportunities: number;
  win_rate: number; // percent as float, e.g. 66.7
  avg_stage_duration_days: number;
}

/************************************************************
 * AI CHAT / MAGIC PIPELINE
 ************************************************************/
// What actions the AI chat can take
export type FlowAction =
  | { type: "add_stage"; payload: { name: string; position?: number } }
  | { type: "assign_agent"; payload: { agentName: string; stageName: string; role: string } }
  | { type: "optimize_pipeline"; payload?: any };

// Main chat message ("role" for future expansion)
export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  createdAt: string;
}
