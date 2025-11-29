// Agent Types
export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description: string;
  avatar?: string;
  is_active: boolean;
  language: string;
  dialect?: string;
  external_agent_id?: string; // TWIN_ID for Loop-X knowledge base integration
  external_agent_token?: string;
  config_metadata: ConfigMetadata;
  knowledge_instructions?: string;
  knowledge_instructions_manual?: string;
  created_at: string;
  updated_at: string;
}

// Configuration metadata stored as JSONB
export interface ConfigMetadata {
  // Hidden fields (auto-included, not shown in UI)
  twin_mode: string; // Default: "norm"
  twin_role: string; // Default: "master"
  twin_type: string; // Default: "twin_pro"
  files_mode: string; // Default: "tabular_data"

  // Main Configuration Fields (shown in UI)
  rag_mode: "agentic" | "norm"; // Default: "norm"
  ai_provider: string; // Default: "gemini"
  model_temperature: number; // Default: 0.1

  // Routing Agent Configuration
  ra_ai_provider: string; // Default: "openai"
  routing_agent_model: string; // Default: "gpt-4.1-2025-04-14"

  // RAG Agent Configuration
  rag_ai_provider: string; // Default: "openai"
  rag_agent_model: string; // Default: "gpt-4.1-2025-04-14"

  // Model Selection (based on ai_provider)
  openai_model?: string;
  cohere_model?: string;
  gemini_model?: string;
  anthropic_model?: string;

  // Embedding and Reranking (hidden)
  cohere_embedding_model: string; // Default: "embed-multilingual-v3.0"
  openai_embedding_model: string; // Default: "text-embedding-3-large"
  cohere_rerank_model: string; // Default: "rerank-multilingual-v2.0"

  // History and Retrieval Settings
  history_days_back: number; // Default: 30
  no_relevant_docs: number; // Default: 3
  no_previous_concated_messages: number; // Default: 10
  retrieved_columns: string; // Default: "question,answer" (comma-separated)
  rag_history_mode: "both" | "user" | "assistant"; // Default: "both"
}

// Agent Metrics
export interface AgentMetrics {
  id: string;
  agent_id: string;
  conversations: number;
  messages: number;
  response_time: string; // e.g., "1.2s"
  cost: string; // Total cost as string, e.g., "12.35"
  created_at: string;
  updated_at: string;
}

// Knowledge Files
export interface KnowledgeFile {
  id: string;
  agent_id: string;
  file_name: string; // DB uses file_name
  file_type: "excel" | "markdown" | "text" | "website" | "qa" | "structured_table"; // excel/markdown/text = uploaded files, website = web URLs, qa = Q&A pairs, structured_table = formatted Excel tables
  file_url?: string; // For files: Storage URL, for urls: actual URL
  file_size?: number; // Only for uploaded files
  upload_date: string; // Original upload timestamp
  status: "pending" | "uploading" | "training" | "trained" | "failed" | "completed"; // Training workflow statuses
  metadata?: Record<string, any>; // Can store Q&A content, training info, etc.
  error_message?: string; // Error message if upload or training failed
  created_at: string; // Record creation timestamp
  updated_at: string; // Last update timestamp
  table_instructions?: string; // Optional free-text instructions for this table
}

// Agent with relations (for detail page)
export interface AgentWithRelations extends Agent {
  metrics?: AgentMetrics;
  knowledge_files?: KnowledgeFile[];
}

// Create Agent DTO
export interface CreateAgentDTO {
  name: string;
  description: string;
  avatar?: string;
  is_active?: boolean;
  language: string;
  dialect?: string;
  external_agent_id?: string;
  config_metadata?: Partial<ConfigMetadata>;
  knowledge_instructions?: string;
  knowledge_instructions_manual?: string;
}

// Update Agent DTO
export interface UpdateAgentDTO {
  name?: string;
  description?: string;
  avatar?: string;
  is_active?: boolean;
  language?: string;
  dialect?: string;
  external_agent_id?: string;
  external_agent_token?: string;
  config_metadata?: Partial<ConfigMetadata>;
  knowledge_instructions?: string;
  knowledge_instructions_manual?: string;
}

// Agent list item (for agents page)
export interface AgentListItem {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  is_active: boolean;
  language: string;
  dialect?: string;
  created_at: string;
  updated_at: string;
  metrics?: {
    conversations: number;
    messages: number;
    cost: string;
  };
}

// File Upload Types
export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "failed";
  error?: string;
}
