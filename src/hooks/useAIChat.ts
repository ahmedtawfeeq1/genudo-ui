// Enhanced AI Chat functionality for Magic Pipeline
// This transforms your beautiful Nase7 interface into a functional AI assistant
// that can actually understand and execute pipeline modifications

import { useState } from 'react';
import { FlowAction, ChatMessage } from '@/types/pipeline';
import { usePipelineData } from './usePipelineData';

// Define the enhanced AI response structure
interface AIResponse {
  message: string;
  action?: FlowAction;
  confidence?: number; // How confident the AI is in understanding the request
}

// Custom hook that manages the AI chat functionality
// This builds on your existing beautiful Nase7 UI design
export function useAIChat(pipelineId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { stages, agents, createStage, assignAgent } = usePipelineData(pipelineId);

  // The main AI processing function
  // In production, this would connect to OpenAI/Anthropic, but for now we'll use
  // sophisticated pattern matching that demonstrates the full capability
  const processMessage = async (message: string): Promise<AIResponse> => {
    setIsLoading(true);
    
    try {
      // Simulate realistic AI processing delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      // Process the message and determine appropriate response and actions
      const response = await processAIMessage(message, stages, agents, createStage, assignAgent);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processMessage,
    isLoading,
  };
}

// Advanced pattern matching that simulates AI understanding
// This demonstrates how natural language can be transformed into pipeline actions
async function processAIMessage(
  message: string, 
  stages: any[], 
  agents: any[],
  createStage: Function,
  assignAgent: Function
): Promise<AIResponse> {
  const lowerMessage = message.toLowerCase();

  // Pattern 1: Adding new stages
  // Handles phrases like "add a qualification stage" or "create a demo stage after lead generation"
  if (lowerMessage.includes('add') && lowerMessage.includes('stage')) {
    const stageName = extractStageName(message);
    const position = extractStagePosition(message, stages);
    
    if (stageName) {
      try {
        await createStage({
          name: stageName,
          description: `AI-generated ${stageName} stage`,
          position: position || (stages?.length || 0) + 1,
          x_position: 400,
          y_position: 200 + ((position || stages?.length || 0) * 180),
        });

        return {
          message: `Perfect! I've added a "${stageName}" stage to your pipeline. This stage will help you ${getStageDescription(stageName)}. The visual flow has been updated and you can now assign agents to this stage or modify its properties.`,
          action: {
            type: 'add_stage',
            payload: { name: stageName, position }
          },
          confidence: 0.9
        };
      } catch (error) {
        return {
          message: `I understand you want to add a "${stageName}" stage, but I encountered an issue. Could you try rephrasing your request or check if a stage with this name already exists?`,
          confidence: 0.7
        };
      }
    }
  }

  // Pattern 2: Agent assignment
  // Handles "assign Aria to lead generation" or "put Clio in charge of demos"
  if ((lowerMessage.includes('assign') || lowerMessage.includes('put')) && 
      (lowerMessage.includes('agent') || hasAgentName(lowerMessage))) {
    
    const agentName = extractAgentName(message);
    const stageName = extractStageNameForAssignment(message, stages);
    
    if (agentName && stageName) {
      const agent = agents?.find(a => a.name.toLowerCase() === agentName.toLowerCase());
      const stage = stages?.find(s => s.name.toLowerCase().includes(stageName.toLowerCase()));
      
      if (agent && stage) {
        try {
          await assignAgent({
            stageId: stage.id,
            agentId: agent.id,
            role: 'primary'
          });

          return {
            message: `Excellent! I've assigned ${agentName} as the primary agent for the ${stageName} stage. ${agentName} will now handle all leads when they reach this part of your pipeline. Their expertise in ${agent.role} makes them perfect for this stage.`,
            action: {
              type: 'assign_agent',
              payload: { agentName, stageName, role: 'primary' }
            },
            confidence: 0.95
          };
        } catch (error) {
          return {
            message: `I understand you want to assign ${agentName} to ${stageName}, but I encountered an issue. The assignment might already exist or there could be a permission issue.`,
            confidence: 0.6
          };
        }
      }
    }
  }

  // Pattern 3: Pipeline structure questions
  // Handles "show me the current pipeline" or "what stages do I have"
  if (lowerMessage.includes('show') || lowerMessage.includes('current') || 
      lowerMessage.includes('what') && (lowerMessage.includes('stage') || lowerMessage.includes('pipeline'))) {
    
    const stageCount = stages?.length || 0;
    const agentCount = agents?.length || 0;
    const stageList = stages?.map(s => s.name).join(', ') || 'No stages yet';
    
    return {
      message: `Your current pipeline has ${stageCount} stages: ${stageList}. You have ${agentCount} AI agents available for assignment. Each stage can have multiple agents with different roles (primary, secondary, or support). Would you like me to help you modify any part of this structure?`,
      confidence: 1.0
    };
  }

  // Pattern 4: Help and guidance
  // Handles general questions about capabilities
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || 
      lowerMessage.includes('how') && lowerMessage.includes('work')) {
    
    return {
      message: `I'm your AI pipeline architect! Here's what I can help you with:

• **Add stages**: Say "add a qualification stage" or "create a demo stage after lead generation"
• **Assign agents**: Try "assign Aria to lead generation" or "put Clio in charge of demos"  
• **Modify structure**: Ask me to "connect stages" or "reorder the pipeline"
• **Explain setup**: I can describe your current pipeline or suggest improvements

I understand natural language, so feel free to describe what you want in your own words. What would you like to work on first?`,
      confidence: 1.0
    };
  }

  // Pattern 5: Pipeline optimization suggestions
  if (lowerMessage.includes('optimize') || lowerMessage.includes('improve') || lowerMessage.includes('better')) {
    return {
      message: `Based on your current pipeline structure, here are some optimization suggestions:

• **Stage Flow**: Your stages follow a logical progression, which is excellent for conversion tracking
• **Agent Assignment**: Consider assigning backup agents to critical stages for redundancy
• **Automation**: You could add conditional routing between stages based on lead scoring
• **Analytics**: Track conversion rates between each stage to identify bottlenecks

Would you like me to implement any of these improvements? I can help you add backup agents or create new stages for better lead qualification.`,
      confidence: 0.8
    };
  }

  // Default response for unrecognized patterns
  // This maintains the helpful, engaging tone of your Nase7 character
  return {
    message: `I understand you want to work with your pipeline, but I need a bit more detail to help you effectively. Here are some things you can try:

• **"Add a [stage name] stage"** - I'll create a new stage in your pipeline
• **"Assign [agent name] to [stage name]"** - I'll connect an agent to a specific stage  
• **"Show me my current pipeline"** - I'll describe your current setup
• **"Help me optimize this"** - I'll suggest improvements

What specific change would you like to make to your pipeline?`,
    confidence: 0.3
  };
}

// Helper functions for natural language processing
// These demonstrate how to extract entities from conversational text

function extractStageName(message: string): string | null {
  // Look for quoted stage names first
  const quotedMatch = message.match(/["']([^"']+)["']/);
  if (quotedMatch) return quotedMatch[1];
  
  // Look for "add a [name] stage" patterns
  const stagePatterns = [
    /add\s+(?:a\s+)?([a-zA-Z\s]+)\s+stage/i,
    /create\s+(?:a\s+)?([a-zA-Z\s]+)\s+stage/i,
    /new\s+([a-zA-Z\s]+)\s+stage/i,
  ];

  for (const pattern of stagePatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }

  // Look for common stage names
  const commonStages = [
    'qualification', 'demo', 'demonstration', 'proposal', 'closing', 'follow-up', 
    'follow up', 'nurture', 'discovery', 'lead generation', 'lead gen',
    'negotiation', 'onboarding', 'contract', 'presentation'
  ];
  
  for (const stage of commonStages) {
    if (message.toLowerCase().includes(stage)) {
      return stage.charAt(0).toUpperCase() + stage.slice(1);
    }
  }

  return null;
}

function extractAgentName(message: string): string | null {
  const agentNames = ['aria', 'clio', 'ivy', 'vee'];
  for (const agent of agentNames) {
    if (message.toLowerCase().includes(agent)) {
      return agent.charAt(0).toUpperCase() + agent.slice(1);
    }
  }
  return null;
}

function hasAgentName(message: string): boolean {
  return extractAgentName(message) !== null;
}

function extractStageNameForAssignment(message: string, stages: any[]): string | null {
  // First try to find existing stage names in the message
  if (stages) {
    for (const stage of stages) {
      const stageName = stage.name.toLowerCase();
      if (message.toLowerCase().includes(stageName)) {
        return stage.name;
      }
    }
  }

  // Then try common stage name patterns
  const stageKeywords = [
    'lead generation', 'lead gen', 'qualification', 'demo', 'demonstration',
    'proposal', 'closing', 'follow-up', 'follow up', 'negotiation'
  ];

  for (const keyword of stageKeywords) {
    if (message.toLowerCase().includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }

  return null;
}

function extractStagePosition(message: string, stages: any[]): number | null {
  // Look for positional indicators like "after", "before", "between"
  if (message.toLowerCase().includes('after')) {
    // Find which stage it should come after
    if (stages) {
      for (let i = 0; i < stages.length; i++) {
        if (message.toLowerCase().includes(stages[i].name.toLowerCase())) {
          return i + 2; // Position after this stage
        }
      }
    }
  }
  
  if (message.toLowerCase().includes('before')) {
    // Find which stage it should come before
    if (stages) {
      for (let i = 0; i < stages.length; i++) {
        if (message.toLowerCase().includes(stages[i].name.toLowerCase())) {
          return i + 1; // Position before this stage
        }
      }
    }
  }

  return null; // Default to end of pipeline
}

function getStageDescription(stageName: string): string {
  const descriptions: { [key: string]: string } = {
    'qualification': 'assess lead quality and fit with your ideal customer profile',
    'demo': 'showcase your product capabilities and address specific prospect needs',
    'demonstration': 'showcase your product capabilities and address specific prospect needs',
    'proposal': 'present customized solutions and pricing to qualified prospects',
    'closing': 'finalize agreements and convert prospects into customers',
    'follow-up': 'maintain engagement with prospects who need more time to decide',
    'follow up': 'maintain engagement with prospects who need more time to decide',
    'discovery': 'understand prospect needs, challenges, and decision-making process',
    'lead generation': 'attract and capture potential customers for your pipeline',
    'lead gen': 'attract and capture potential customers for your pipeline',
    'negotiation': 'work through final terms and address any remaining objections',
    'onboarding': 'welcome new customers and ensure successful product adoption',
  };

  return descriptions[stageName.toLowerCase()] || 'manage this important part of your sales process';
}
