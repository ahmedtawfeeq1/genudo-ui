import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Zap, 
  Brain, 
  Target,
  FileText,
  CheckCircle,
  Briefcase,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { WebhookAgentData } from '@/utils/pipelineSchemaConverter';

interface AgentDetailsModalProps {
  agentData: WebhookAgentData | null;
  agentColor?: string;
  onClose: () => void;
}

const AgentDetailsModal: React.FC<AgentDetailsModalProps> = ({ 
  agentData: agent, 
  agentColor = 'from-blue-400 to-blue-500',
  onClose 
}) => {
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false);

  if (!agent) return null;

  return (
    <Dialog open={!!agent} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${agentColor} rounded-2xl flex items-center justify-center`}>
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {agent.name}
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600 mt-1">
                  {agent.description}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Agent Profile (Persona) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Agent Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {agent.persona}
              </p>
              {agent.assigned_stages && agent.assigned_stages.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Assigned Stages</h4>
                  <div className="flex gap-2">
                    {agent.assigned_stages.map((stage: number) => (
                      <Badge key={stage} variant="outline" className="text-xs">
                        Stage {stage}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Core Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Core Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {agent.core_capabilities.map((capability: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="justify-center py-2 text-xs"
                  >
                    {capability}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-600" />
                Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agent.specialties.map((specialty: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{specialty}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Use Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agent.use_cases.map((useCase: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">{useCase}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Instructions List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
                Operating Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agent.instructions.map((instruction: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{instruction}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Core Instructions (Markdown - Expandable) */}
          {agent.core_instructions && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Detailed Operating Manual
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsInstructionsExpanded(!isInstructionsExpanded)}
                  >
                    {isInstructionsExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Read More
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${isInstructionsExpanded ? '' : 'max-h-32'} overflow-hidden transition-all duration-300 relative`}>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown>{agent.core_instructions}</ReactMarkdown>
                  </div>
                  {!isInstructionsExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Bar */}
          <div className="lg:col-span-2">
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Currently Active</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Last Updated: Just now</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentDetailsModal;