import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ModernPipelineNode from './flow-nodes/ModernPipelineNode';
import ModernStageNode from './flow-nodes/ModernStageNode';
import ModernAgentNode from './flow-nodes/ModernAgentNode';
import { convertWebhookDataToFlow, WebhookAgentData, WebhookStageData } from '@/utils/pipelineSchemaConverter';

const nodeTypes = {
  pipeline: ModernPipelineNode,
  stage: ModernStageNode,
  agent: ModernAgentNode,
};

interface PipelineFlowRendererProps {
  pipelineData?: any;
  onNodeClick?: (nodeId: string, nodeType: string, nodeData: any) => void;
}

const PipelineFlowRenderer: React.FC<PipelineFlowRendererProps> = ({
  pipelineData,
  onNodeClick: onNodeClickProp
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Fixed spacing constants
  const FIXED_STAGE_SPACING = 230; // Fixed 230px spacing between stages
  const FIXED_AGENT_OFFSET = 500; // Fixed agent offset
  
  const updateFlowFromPipelineData = useCallback((data: any) => {
      if (!data) return;
  
      try {
        const converted = convertWebhookDataToFlow(data);
        const { pipeline, agents, stageAgentAssignments } = converted;

        // Layout configuration with fixed spacing
        const pipelineY = 0;
        const firstStageY = 300;
        const stageX = 400;
  
        // Create pipeline node
        const pipelineNode: Node = {
          id: 'pipeline-header',
          type: 'pipeline',
          position: { x: stageX, y: pipelineY },
          data: {
            pipelineName: pipeline.pipeline_name || 'AI-Generated Pipeline',
            pipelineDescription: pipeline.pipeline_description || 'Created by AI Assistant',
            totalStages: pipeline.stages?.length || 0,
            totalAgents: agents.length,
            type: 'pipeline'
          },
          draggable: true,
        };
  
        // Create stage nodes - pass webhook data directly
        const stageNodes: Node[] = (pipeline.stages || []).map((stage: any, index: number) => ({
          id: stage.id,
          type: 'stage',
          position: { x: stageX, y: firstStageY + index * FIXED_STAGE_SPACING },
          data: {
            order: stage.stage_level, // Use actual stage level from webhook
            stageName: stage.stage_name,
            description: stage.stage_description,
            won_status: stage.won_status || 'neutral', // NEW: Use won_status field
            requiresAction: stage.requires_action || false,
            assignedAgents: 1,
            conversionRate: Math.floor(Math.random() * 30) + 65,
            // Pass complete webhook data for modal
            webhookData: stage as WebhookStageData,
            type: 'stage'
          },
          draggable: true,
        }));
  
        // Create agent nodes - pass webhook data directly
        const agentNodes: Node[] = agents.map((agent: any, index: number) => {
          // Find stages assigned to this agent
          const assignedStageIds = Object.entries(stageAgentAssignments)
            .filter(([_, agentName]) => agentName === agent.name.toLowerCase())
            .map(([stageKey, _]) => {
              return pipeline.stages?.find((s: any) =>
                s.stage_name.toLowerCase().replace(/\s+/g, '-') === stageKey
              )?.id;
            })
            .filter(Boolean);
  
          // Calculate agent position with fixed vertical spacing
          let agentY = firstStageY + (index * FIXED_STAGE_SPACING);
  
          if (assignedStageIds.length > 0) {
            // Find the stage positions
            const stageIndexes = assignedStageIds.map(stageId => 
              pipeline.stages?.findIndex((s: any) => s.id === stageId) || 0
            );
            
            if (stageIndexes.length === 1) {
              // Single stage - align with that stage
              agentY = firstStageY + stageIndexes[0] * FIXED_STAGE_SPACING;
            } else if (stageIndexes.length > 1) {
              // Multiple stages - center between them
              const minIndex = Math.min(...stageIndexes);
              const maxIndex = Math.max(...stageIndexes);
              agentY = firstStageY + ((minIndex + maxIndex) / 2) * FIXED_STAGE_SPACING;
            }
          }
  
          return {
            id: agent.id,
            type: 'agent',
            position: { x: stageX + FIXED_AGENT_OFFSET, y: agentY },
            data: {
              name: agent.name,
              persona: agent.persona,
              color: agent.color,
              agentId: agent.id,
              capabilities: agent.core_capabilities,
              // Pass complete webhook data for modal
              webhookData: agent as WebhookAgentData,
              type: 'agent'
            },
            draggable: true,
          };
        });
  
        // Create edges with proper connections
        const flowEdges: Edge[] = [];
  
        // Pipeline to each stage
        stageNodes.forEach((stageNode) => {
          flowEdges.push({
            id: `pipeline-to-${stageNode.id}`,
            source: 'pipeline-header',
            target: stageNode.id,
            sourceHandle: undefined,
            targetHandle: 'left',
            type: 'smoothstep',
            animated: true,
            style: {
              strokeDasharray: '5,5',
              stroke: '#6366f1',
              strokeWidth: 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#6366f1',
            },
          });
        });
  
        // Stage to agent connections
        Object.entries(stageAgentAssignments).forEach(([stageKey, agentName]) => {
          const stage = pipeline.stages?.find((s: any) =>
            s.stage_name.toLowerCase().replace(/\s+/g, '-') === stageKey
          );
          const agent = agents.find((a: any) => a.name.toLowerCase() === agentName);
  
          if (stage && agent) {
            flowEdges.push({
              id: `${stage.id}-to-${agent.id}`,
              source: stage.id,
              target: agent.id,
              sourceHandle: 'right',
              targetHandle: undefined,
              type: 'smoothstep',
              animated: true,
              style: {
                strokeDasharray: '3,3',
                strokeWidth: 2,
                stroke: '#9333ea',
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#9333ea',
              },
            });
          }
        });
  
        // Update React Flow with new nodes and edges
        setNodes([pipelineNode, ...stageNodes, ...agentNodes]);
        setEdges(flowEdges);
  
      } catch (error) {
        console.error('Error converting pipeline data to flow:', error);
      }
    }, [setNodes, setEdges]);

  // Update flow when pipeline data changes
  useEffect(() => {
    if (pipelineData) {
      updateFlowFromPipelineData(pipelineData);
    }
  }, [pipelineData, updateFlowFromPipelineData]);

  // Handle node clicks - pass webhook data for modals
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeClickProp) {
      // For agent and stage nodes, pass the webhook data instead of node.data
      const nodeData = node.data.webhookData || node.data;
      onNodeClickProp(node.id, node.type || 'unknown', nodeData);
    }
  }, [onNodeClickProp]);

  const nodeClassName = useCallback((node: Node) => node.type || '', []);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-gradient-to-br from-slate-50 to-blue-50"
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20} 
          size={1}
          color="#e2e8f0"
        />
        <Controls 
          className="bg-white shadow-lg border border-gray-200 rounded-lg"
          showInteractive={false}
        />
        <MiniMap 
          nodeClassName={nodeClassName}
          className="bg-white border border-gray-200 rounded-lg shadow-lg"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};

export default PipelineFlowRenderer;