import React, { useState, useEffect } from 'react';
import { Save, Bot, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { db } from "@/lib/mock-db";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Pipeline } from '@/types/pipeline';
import StageRoutingRulesSection from './StageRoutingRulesSection';
import RoutingInstructionsSection from './RoutingInstructionsSection';

interface Stage {
  id: string;
  stage_name: string;
  stage_position_index: number;
  when_to_enter: string | null;
  when_to_exit: string | null;
}

interface AIConfigurationTabProps {
  pipeline: Pipeline;
}

const AIConfigurationTab: React.FC<AIConfigurationTabProps> = ({ pipeline }) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Array<{ id: string; name: string; external_agent_id?: string | null; description?: string | null }>>([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [pipeline.id]);

  const fetchData = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 200));
    setStages([
      { id: 's1', stage_name: 'New', stage_position_index: 0, when_to_enter: null, when_to_exit: null },
      { id: 's2', stage_name: 'Qualified', stage_position_index: 1, when_to_enter: null, when_to_exit: null },
      { id: 's3', stage_name: 'Won', stage_position_index: 2, when_to_enter: null, when_to_exit: null },
    ]);
    setAgents([
      { id: 'agent-001', name: 'Sales Pro Alpha', external_agent_id: 'ext-001', description: 'Primary sales assistant' },
      { id: 'agent-002', name: 'Assistant Beta', external_agent_id: 'ext-002', description: 'General helper agent' },
    ]);
    setSelectedAgentId('agent-001');
    setLoading(false);
  };

  // Assign pipeline-level agent and propagate to stages
  const assignPipelineAgent = async (agentId: string) => {
    if (!agentId) return;
    setAssigning(true);
    await new Promise(res => setTimeout(res, 150));
    setSelectedAgentId(agentId);
    toast({ title: 'Agent assigned', description: 'Pipeline and stages updated (static)' });
    setAssigning(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline-level AI Agent Assignment */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Pipeline AI Agent</CardTitle>
          </div>
          <CardDescription>
            Choose one of the agents for this pipeline and save the agent details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
              <Select value={selectedAgentId} onValueChange={(v) => setSelectedAgentId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an agent..." />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white">
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={assigning || !selectedAgentId}
              onClick={() => assignPipelineAgent(selectedAgentId)}
              className="shrink-0"
            >
              <Save className="h-4 w-4 mr-2" />
              {assigning ? 'Saving...' : 'Save Agent'}
            </Button>
          </div>

          {/* Selected Agent Display */}
          {selectedAgentId && (
            <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              {(() => {
                const a = agents.find(x => x.id === selectedAgentId);
                if (!a) return null;
                return (
                  <div className="space-y-1">
                    <div className="font-medium text-slate-900">{a.name}</div>
                    <div className="text-sm text-slate-500">
                      {a.description ? a.description : 'No description available for this agent.'}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Configurations Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-5 w-5" />
            Advanced Configurations
          </CardTitle>
          <CardDescription>
            Configure routing instructions and stage rules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Show Advanced Configuration
                </span>
                {isAdvancedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-6 space-y-6 pt-4 border-t">
              {/* Routing Instructions Section - Moved to Top */}
              <RoutingInstructionsSection
                pipelineId={pipeline.id}
                initialInstructions={pipeline.routing_instructions || null}
                onUpdate={fetchData}
              />

              {/* Stage Routing Rules Section - Moved to Bottom */}
              <StageRoutingRulesSection
                stages={stages}
                onStagesUpdate={fetchData}
                pipelineId={pipeline.id}
              />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConfigurationTab;
