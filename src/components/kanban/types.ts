
// Updated types for kanban components with proper follow-up architecture
export interface Opportunity {
  id: string;
  opportunity_name: string;
  client_name: string;
  client_email: string | null;
  client_phone_number: string | null;
  status: 'active' | 'pending' | 'won' | 'lost';
  stage_id: string;
  pipeline_id: string;
  created_at: string;
  updated_at: string;
  contact_id: string;
  opportunity_notes: string | null;
  source: string | null;
  tags: string | null;
  preferred_language: string | null;
  preferred_dialect: string | null;
  external_opportunity_id?: string | null;
  external_opportunity_id_old?: number | null;
  
  // Follow-up EXECUTION STATE only (configuration comes from stage)
  follow_up_next_at: string | null;
  follow_up_last_at: string | null;
  follow_up_occurrences: number;
  
  // Names for quick display without additional fetches
  pipeline_name?: string;
  stage_name?: string;
}

export interface Stage {
  id: string;
  stage_name: string;
  stage_description: string | null;
  instructions: string | null;
  persona: string | null;
  example_messages: string | null;
  routing_array: any;
  assigned_agent_id: string | null;
  external_agent_id: string | null;
  pipeline_id: string;
  stage_nature: 'neutral' | 'won' | 'lost';
  requires_action?: boolean;
  opening_message: boolean;
  stage_position_index?: number;
  created_at?: string;
  updated_at?: string;

  // Follow-up CONFIGURATION (moved from opportunities to stages)
  follow_up_enabled: boolean;
  follow_up_interval_value: number;
  follow_up_interval_unit: 'minutes' | 'hours' | 'days' | 'months';
  follow_up_time_of_day: string;
  follow_up_timezone: string;
  follow_up_max_occurrences: number;
  follow_up_start_date?: string | null;
}

export interface StageAction {
  id: string;
  action_name: string;
  action_type: 'get_available_slots' | 'book_meeting' | 'collect_data' | 'custom_action';
  webhook_url: string | null;
  trigger_condition: 'on_stage_entry' | 'on_user_message' | 'scheduled' | 'post_response';
  recording_policy: 'once' | 'recurring';
  request_type: 'get' | 'post';
  is_active: boolean;
  default_payload: any;
  required_fields: any;
  schedule_expression: string | null;
  schedule_timezone: string;
}
