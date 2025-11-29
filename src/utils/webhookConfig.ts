// Webhook configuration for Magic Pipeline event-driven architecture

export const MAGIC_PIPELINE_WEBHOOK_URL = `https://fymcfqykdtxkhhwvszqg.db.co/functions/v1/magic-pipeline-webhook`;

// New chat webhook URL for Magic Pipeline AI communication
export const CHAT_WEBHOOK_URL = `https://fymcfqykdtxkhhwvszqg.db.co/functions/v1/DarkMagicPipelineChatWebHook`;

// Webhook request payload interfaces
export interface PipelineWebhookPayload {
  flow_status: 'new_pipeline' | 'pipeline_updated' | 'pipeline_error';
  json_result: any;
  session_id: string;
  user_id: string;
  business_needs: string;
}

export interface ChatWebhookPayload {
  query: string;
  metadata: {
    user_id: string;
    session_id: string;
    pipeline_id?: string | null;
    stage_id?: string | null;
    agent_id?: string | null;
    opportunity_id?: string | null;
  };
}

// Webhook response interfaces
export interface WebhookResponse {
  success: boolean;
  pipeline_id: string;
  message: string;
  error?: string;
  details?: {
    stages_created?: number;
    agents_created?: number;
    assignments_created?: number;
    total_processing_time?: number;
  };
}

export interface ChatWebhookResponse {
  success: boolean;
  response: string;
  message_id?: string;
  context?: {
    pipeline_id?: string;
    stage_id?: string;
    agent_id?: string;
  };
  error?: string;
}

// Pipeline build status types
export type PipelineBuildStatus = 
  | 'preparing'
  | 'building_agents'
  | 'assigning_agents'
  | 'launching'
  | 'completed'
  | 'failed';

// Build step configuration
export interface BuildStepConfig {
  id: string;
  name: string;
  description: string;
  status: PipelineBuildStatus;
  estimatedDuration: number; // in milliseconds
  icon: string;
  color: string;
}

// Default build steps configuration
export const DEFAULT_BUILD_STEPS: BuildStepConfig[] = [
  {
    id: 'prepare',
    name: 'Preparing your Sales Pipeline',
    description: 'Analyzing your business requirements and structuring the pipeline...',
    status: 'preparing',
    estimatedDuration: 2000,
    icon: 'Database',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'agents',
    name: 'Building your Sales Agents',
    description: 'Creating intelligent AI agents with specialized capabilities...',
    status: 'building_agents',
    estimatedDuration: 3000,
    icon: 'Bot',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'assign',
    name: 'Assigning Agents to Stages',
    description: 'Optimizing workflow assignments and stage transitions...',
    status: 'assigning_agents',
    estimatedDuration: 2500,
    icon: 'Users',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'launch',
    name: 'Launching Your Sales Pipeline!',
    description: 'Deploying to production and activating automation...',
    status: 'launching',
    estimatedDuration: 3500,
    icon: 'Rocket',
    color: 'from-orange-500 to-red-500'
  }
];

// Error types for webhook failures
export interface WebhookError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  retry_after?: number;
}

// Pipeline creation result
export interface PipelineCreationResult {
  success: boolean;
  pipeline_id?: string;
  pipeline_name?: string;
  stages_created?: number;
  agents_created?: number;
  webhook_response?: WebhookResponse;
  error?: WebhookError;
  processing_time?: number;
}

// Utility functions
export const createPipelineWebhookPayload = (
  flowStatus: PipelineWebhookPayload['flow_status'],
  jsonResult: any,
  sessionId: string,
  userId: string,
  businessNeeds: string
): PipelineWebhookPayload => ({
  flow_status: flowStatus,
  json_result: jsonResult,
  session_id: sessionId,
  user_id: userId,
  business_needs: businessNeeds
});

export const createChatWebhookPayload = (
  query: string,
  userId: string,
  sessionId: string,
  pipelineId?: string | null,
  stageId?: string | null,
  agentId?: string | null,
  opportunityId?: string | null
): ChatWebhookPayload => ({
  query,
  metadata: {
    user_id: userId,
    session_id: sessionId,
    pipeline_id: pipelineId,
    stage_id: stageId,
    agent_id: agentId,
    opportunity_id: opportunityId
  }
});

// Validation functions
export const validateWebhookResponse = (response: any): response is WebhookResponse => {
  return (
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    typeof response.pipeline_id === 'string' &&
    typeof response.message === 'string'
  );
};

export const validateChatWebhookResponse = (response: any): response is ChatWebhookResponse => {
  return (
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    typeof response.response === 'string'
  );
};

// Error handling utilities
export const handleWebhookError = (error: any): WebhookError => {
  return {
    code: error.code || 'WEBHOOK_ERROR',
    message: error.message || 'An unknown webhook error occurred',
    details: error.details || null,
    timestamp: new Date().toISOString(),
    retry_after: error.retry_after || null
  };
};

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
};

// Webhook with retry logic
export const sendWebhookWithRetry = async (
  url: string,
  payload: PipelineWebhookPayload | ChatWebhookPayload,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<WebhookResponse | ChatWebhookResponse> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate response based on URL type
      if (url.includes('magic-pipeline-webhook')) {
        if (!validateWebhookResponse(data)) {
          throw new Error('Invalid webhook response format');
        }
      } else if (url.includes('chat-webhook')) {
        if (!validateChatWebhookResponse(data)) {
          throw new Error('Invalid chat webhook response format');
        }
      }

      return data;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < config.maxRetries) {
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt),
          config.maxDelay
        );
        
        console.warn(`Webhook attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

// Pipeline status polling (for future use)
export interface PipelineStatusResponse {
  pipeline_id: string;
  status: PipelineBuildStatus;
  progress: number;
  current_step?: string;
  estimated_completion?: string;
  error?: WebhookError;
}

export const pollPipelineStatus = async (
  pipelineId: string,
  interval: number = 2000,
  timeout: number = 60000
): Promise<PipelineStatusResponse> => {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        if (Date.now() - startTime > timeout) {
          reject(new Error('Pipeline status polling timeout'));
          return;
        }

        // This would be a real endpoint in your backend
        const response = await fetch(`${MAGIC_PIPELINE_WEBHOOK_URL}/status/${pipelineId}`);
        const status: PipelineStatusResponse = await response.json();
        
        if (status.status === 'completed' || status.status === 'failed') {
          resolve(status);
        } else {
          setTimeout(poll, interval);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    poll();
  });
};

// Example usage documentation
/*
Pipeline Webhook Usage:
========================

POST to: https://fymcfqykdtxkhhwvszqg.db.co/functions/v1/magic-pipeline-webhook

Headers:
- Content-Type: application/json
- Authorization: Bearer [your-service-role-key] (optional)

Request Body:
{
  "flow_status": "new_pipeline",
  "json_result": {
    "pipeline": { "pipeline_name": "...", "pipeline_description": "..." },
    "stages": [...],
    "agents": [...],
    "stageAgentAssignments": {...}
  },
  "session_id": "uuid-of-session",
  "user_id": "uuid-of-user",
  "business_needs": "Create a SaaS sales pipeline with qualification stages"
}

Expected Response:
{
  "success": true,
  "pipeline_id": "3fed010e-de1e-4c6b-83f6-bd48c8a4b524",
  "message": "Pipeline created successfully!",
  "details": {
    "stages_created": 5,
    "agents_created": 3,
    "assignments_created": 8,
    "total_processing_time": 2500
  }
}

Chat Webhook Usage:
===================

POST to: https://fymcfqykdtxkhhwvszqg.db.co/functions/v1/chat-webhook

Request Body:
{
  "query": "Hello, how can you help me?",
  "metadata": {
    "user_id": "uuid-of-user",
    "session_id": "uuid-of-session",
    "pipeline_id": "uuid-of-pipeline",
    "stage_id": "uuid-of-stage",
    "agent_id": "uuid-of-agent",
    "opportunity_id": "uuid-of-opportunity"
  }
}

Expected Response:
{
  "success": true,
  "response": "Hello! I'm here to help you with your sales pipeline...",
  "message_id": "msg-uuid",
  "context": {
    "pipeline_id": "uuid-of-pipeline",
    "stage_id": "uuid-of-stage"
  }
}
*/