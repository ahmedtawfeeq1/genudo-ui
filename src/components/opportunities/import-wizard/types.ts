
export interface ImportedOpportunity {
  client_name: string;
  phone: string;
  email?: string;
  source?: string;
  notes?: string;
  preferred_language: string;
  preferred_dialect: string;
  isValid: boolean;
  errors: string[];
}

export interface Stage {
  id: string;
  stage_name: string;
  opening_message: boolean;
}

export interface Pipeline {
  id: string;
  pipeline_name: string;
  connector_account_id: string | null;
}

export interface ImportResults {
  successful: number;
  failed: number;
  skipped: number;
  total: number;
  webhookTriggered: number;
  webhookFailed: number;
  opportunityIds: string[];
}
