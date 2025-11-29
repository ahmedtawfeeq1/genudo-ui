// Clean, simple interfaces that match your webhook JSON exactly

export interface WebhookPipelineResponse {
  response: string;
  flow_status: string;
  json_result: PipelineFlowData;
}

export interface PipelineFlowData {
  pipeline: {
    pipeline_name: string;
    pipeline_description: string;
  };
  stages: WebhookStageData[];
  agents: WebhookAgentData[];
  stage_agent_assignments: Record<string, string>;
}

// Exact match to your webhook JSON for stages
export interface WebhookStageData {
  stage_level: number;
  stage_name: string;
  stage_description: string;
  won_status: "won" | "neutral" | "lost";  // New field instead of is_won
  requires_action: boolean;
}

// Exact match to your webhook JSON for agents
export interface WebhookAgentData {
  name: string;
  description: string;
  persona: string;
  core_capabilities: string[];
  specialties: string[];
  instructions: string[];
  core_instructions: string;
  use_cases: string[];
  assigned_stages: number[];
}

// Enhanced agent color assignments
export const AGENT_COLORS = [
  'from-violet-300 to-purple-400',
  'from-sky-300 to-blue-400',
  'from-emerald-300 to-green-400',
  'from-rose-300 to-pink-400',
  'from-amber-300 to-orange-400',
  'from-cyan-300 to-teal-400',
  'from-fuchsia-300 to-purple-400',
  'from-lime-300 to-green-400',
  'from-indigo-300 to-blue-400',
  'from-coral-300 to-red-400',
];

// Helper function to truncate description to first 5 words
export const truncateDescription = (description: string, wordLimit: number = 5): string => {
  const words = description.split(' ');
  if (words.length <= wordLimit) return description;
  return words.slice(0, wordLimit).join(' ') + '...';
};

// Convert webhook data to flow format (NO unnecessary field name changes)
export const convertWebhookDataToFlow = (data: PipelineFlowData) => {
  // Pipeline data - keep simple
  const pipeline = {
    pipeline_name: data.pipeline.pipeline_name,
    pipeline_description: data.pipeline.pipeline_description,
    id: `pipeline-${Date.now()}`,
    stages: data.stages.sort((a, b) => a.stage_level - b.stage_level).map((stage, index) => ({
      id: `stage-${stage.stage_level}`,
      position: index,
      ...stage // Keep all webhook fields exactly as they are
    }))
  };

  // Agents data - keep webhook structure exactly, just add UI helpers
  const agents = data.agents.map((agent, index) => ({
    id: `agent-${agent.name.toLowerCase().replace(/\s+/g, '-')}`,
    color: AGENT_COLORS[index % AGENT_COLORS.length],
    ...agent // Keep all webhook fields exactly as they are
  }));

  // Stage-agent assignments
  const stageAgentAssignments: Record<string, string> = {};
  Object.entries(data.stage_agent_assignments).forEach(([stageLevel, agentName]) => {
    const stage = pipeline.stages.find(s => s.stage_level === parseInt(stageLevel));
    if (stage) {
      const stageKey = stage.stage_name.toLowerCase().replace(/\s+/g, '-');
      stageAgentAssignments[stageKey] = agentName.toLowerCase();
    }
  });

  return {
    pipeline,
    agents,
    stageAgentAssignments,
  };
};

export default {
  convertWebhookDataToFlow,
  truncateDescription,
  AGENT_COLORS,
};