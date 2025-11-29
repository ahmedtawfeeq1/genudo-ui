
import { Node, Edge, MarkerType } from '@xyflow/react';

export const stages = [
  { id: 'lead-gen', name: 'Lead Generation', desc: 'Attract and capture potential customers.\nMulti-channel prospecting strategy.' },
  { id: 'qualification', name: 'Qualification', desc: 'Assess lead quality and fit.\nBudget, authority, need, timeline.' },
  { id: 'demo', name: 'Demo & Discovery', desc: 'Product demonstration session.\nUncover pain points and needs.' },
  { id: 'proposal', name: 'Proposal', desc: 'Custom solution presentation.\nPricing and feature discussion.' },
  { id: 'negotiation', name: 'Negotiation', desc: 'Handle objections and concerns.\nFinal terms refinement.' },
  { id: 'closed-won', name: 'Closed Won', desc: 'Deal successfully closed.\nContract signed and onboarding.', badge: 'WON' },
  { id: 'closed-lost', name: 'Closed Lost', desc: 'Opportunity lost.\nFeedback collection for improvement.', badge: 'LOST' }
];

export const agentMap = {
  aria: { 
    name: 'Aria', 
    role: 'Lead Magnet & Qualifier',
    persona: 'Multi-channel prospecting expert.\nHandles initial qualification.',
    color: 'from-purple-500 to-purple-600'
  },
  clio: { 
    name: 'Clio', 
    role: 'Demo Master & Proposal Writer',
    persona: 'Product showcase virtuoso.\nCustom solution architect.',
    color: 'from-blue-500 to-blue-600'
  },
  ivy: { 
    name: 'Ivy', 
    role: 'Deal Closer & Success Manager',
    persona: 'Objection handling expert.\nContract finalization specialist.',
    color: 'from-emerald-500 to-emerald-600'
  },
  vee: { 
    name: 'Vee', 
    role: 'Recovery Agent',
    persona: 'Re-engagement specialist.\nNurtures lost opportunities.',
    color: 'from-red-500 to-red-600'
  }
};

export const stageAgentAssignments = {
  'lead-gen': 'aria',
  'qualification': 'aria',
  'demo': 'clio',
  'proposal': 'clio',
  'negotiation': 'ivy',
  'closed-won': 'ivy',
  'closed-lost': 'vee'
};

// Updated spacing configuration for better layout
const startY = 120; // Adjusted to accommodate higher pipeline position
const stageSpacing = 160; // Increased from 100px to eliminate overlapping
const agentSpacing = 250; // Keep agent distance the same

export const initialNodes: Node[] = [
  // Pipeline Header Node - repositioned higher
  {
    id: 'pipeline-header',
    type: 'pipeline',
    position: { x: 400, y: -50 }, // Moved up from y: 30
    data: {
      pipelineName: 'Modern Sales Pipeline',
      pipelineDescription: 'AI-powered sales automation.\nTurn prospects into customers efficiently.',
      totalStages: 7,
      totalAgents: 4,
    },
    draggable: false,
  },
  // Stage Nodes with increased spacing
  ...stages.map((stage, index) => ({
    id: stage.id,
    type: 'stage' as const,
    position: { x: 400, y: startY + index * stageSpacing },
    data: {
      order: index + 1,
      stageName: stage.name,
      description: stage.desc,
      badge: stage.badge as 'WON' | 'LOST' | 'ACTIVE' | undefined,
      assignedAgents: 1,
      conversionRate: Math.floor(Math.random() * 30) + 60,
    },
    draggable: false,
  })),
  // Agent Nodes with improved positioning based on stage assignments
  ...Object.entries(agentMap).map(([key, agent], index) => {
    // Calculate optimal Y position based on assigned stages
    const assignedStageIds = stages
      .filter(stage => stageAgentAssignments[stage.id as keyof typeof stageAgentAssignments] === key)
      .map(stage => stage.id);
    
    let agentY;
    if (assignedStageIds.length === 1) {
      // Single stage: align with that stage
      const stageIndex = stages.findIndex(stage => stage.id === assignedStageIds[0]);
      agentY = startY + stageIndex * stageSpacing;
    } else if (assignedStageIds.length > 1) {
      // Multiple stages: position in the middle of assigned stages
      const stageIndexes = assignedStageIds.map(stageId => 
        stages.findIndex(stage => stage.id === stageId)
      );
      const minIndex = Math.min(...stageIndexes);
      const maxIndex = Math.max(...stageIndexes);
      agentY = startY + ((minIndex + maxIndex) / 2) * stageSpacing;
    } else {
      // Fallback positioning
      agentY = startY + index * stageSpacing;
    }

    return {
      id: `agent-${key}`,
      type: 'agent' as const,
      position: { x: 400 + agentSpacing, y: agentY },
      data: {
        ...agent,
        agentId: key,
      },
      draggable: false,
    };
  }),
];

export const initialEdges: Edge[] = [
  // Pipeline to first stage - dashed animated smoothstep
  {
    id: 'pipeline-to-lead-gen',
    source: 'pipeline-header',
    target: 'lead-gen',
    type: 'smoothstep',
    animated: true,
    style: {
      strokeDasharray: '8,8',
      stroke: '#6366f1',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#6366f1',
    },
  },
  // Sequential stage connections - dashed animated smoothstep
  ...stages.slice(0, -2).map((stage, index) => ({
    id: `${stage.id}-to-${stages[index + 1].id}`,
    source: stage.id,
    target: stages[index + 1].id,
    type: 'smoothstep' as const,
    animated: true,
    style: {
      strokeDasharray: '8,8',
      stroke: '#6366f1',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#6366f1',
    },
  })),
  // Negotiation to both outcomes - dashed animated
  {
    id: 'negotiation-to-closed-won',
    source: 'negotiation',
    target: 'closed-won',
    type: 'smoothstep',
    animated: true,
    style: {
      strokeDasharray: '8,8',
      stroke: '#10b981',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#10b981',
    },
  },
  {
    id: 'negotiation-to-closed-lost',
    source: 'negotiation',
    target: 'closed-lost',
    type: 'smoothstep',
    animated: true,
    style: {
      strokeDasharray: '8,8',
      stroke: '#ef4444',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#ef4444',
    },
  },
  // Stage to agent connections - now animated with subtle styling
  ...Object.entries(stageAgentAssignments).map(([stageId, agentKey]) => ({
    id: `${stageId}-to-agent-${agentKey}`,
    source: stageId,
    target: `agent-${agentKey}`,
    type: 'smoothstep' as const,
    animated: true, // Now animated as requested
    style: {
      strokeDasharray: '5,5',
      strokeWidth: 1.5,
      stroke: '#9ca3af',
    },
  })),
];
