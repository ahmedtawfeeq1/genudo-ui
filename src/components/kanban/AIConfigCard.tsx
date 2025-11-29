
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExpandableTextarea } from "@/components/ui/expandable-textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Bot } from "lucide-react";
import TextQualityBadge from "./TextQualityBadge";
import TextMetricsDisplay from "./TextMetricsDisplay";
import TotalInstructionsBar from "./TotalInstructionsBar";
import {
  countWords,
  countCharacters,
  getPersonaQuality,
  getInstructionsQuality,
  getImportantNotesQuality,
} from "@/utils/textMetrics";

interface Agent {
  id: string;
  name: string;
  external_agent_id: string;
}

interface Props {
  formData: any;
  agents: Agent[];
  onInputChange: (field: string, value: any) => void;
  hideStageAgentFields?: boolean;
}

const AIConfigCard: React.FC<Props> = ({ formData, agents, onInputChange, hideStageAgentFields = false }) => {
  // Calculate metrics for each field
  const personaWords = countWords(formData.persona || "");
  const personaChars = countCharacters(formData.persona || "");
  const personaQuality = getPersonaQuality(personaWords);

  const instructionsWords = countWords(formData.instructions || "");
  const instructionsChars = countCharacters(formData.instructions || "");
  const instructionsQuality = getInstructionsQuality(instructionsWords);

  const notesWords = countWords(formData.example_messages || "");
  const notesChars = countCharacters(formData.example_messages || "");
  const notesQuality = getImportantNotesQuality(notesWords);

  // Calculate total words across all three text fields
  const totalWords = personaWords + instructionsWords + notesWords;
  const totalChars = personaChars + instructionsChars + notesChars;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Agent Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hideStageAgentFields && (
          <div className="space-y-4">
            <Label htmlFor="assigned_agent_id">Assigned Agent</Label>
            <Select
              value={formData.assigned_agent_id}
              onValueChange={(v) => onInputChange("assigned_agent_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                <SelectItem value="unassigned">No agent assigned</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {!hideStageAgentFields && (
          <div className="space-y-4">
            <Label htmlFor="external_agent_id">External Agent ID</Label>
            <Input
              id="external_agent_id"
              value={formData.external_agent_id}
              onChange={(e) => onInputChange("external_agent_id", e.target.value)}
              placeholder="ID for agent in external (e.g., Unipile) system"
            />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="persona">AI Persona</Label>
            <TextQualityBadge quality={personaQuality} />
          </div>
          <ExpandableTextarea
            id="persona"
            value={formData.persona}
            onChange={(value) => onInputChange("persona", value)}
            placeholder="Define the AI agent's personality and tone"
            rows={3}
            label="AI Persona"
            description="Define the AI agent's personality, tone, and communication style."
          />
          <TextMetricsDisplay wordCount={personaWords} charCount={personaChars} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="instructions">Stage Instructions</Label>
            <TextQualityBadge quality={instructionsQuality} />
          </div>
          <ExpandableTextarea
            id="instructions"
            value={formData.instructions}
            onChange={(value) => onInputChange("instructions", value)}
            placeholder="Specific instructions for this stage"
            rows={4}
            label="Stage Instructions"
            description="Provide specific instructions for the AI agent at this stage."
          />
          <TextMetricsDisplay wordCount={instructionsWords} charCount={instructionsChars} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="example_messages">Important Notes</Label>
            <TextQualityBadge quality={notesQuality} />
          </div>
          <ExpandableTextarea
            id="example_messages"
            value={formData.example_messages}
            onChange={(value) => onInputChange("example_messages", value)}
            placeholder="Example messages or responses"
            rows={4}
            label="Important Notes"
            description="Provide example messages, important notes, or key information for the AI agent."
          />
          <TextMetricsDisplay wordCount={notesWords} charCount={notesChars} />
        </div>

        {/* Total Instructions Review Bar */}
        <TotalInstructionsBar totalWords={totalWords} totalChars={totalChars} maxWords={1800} />
      </CardContent>
    </Card>
  );
};

export default AIConfigCard;
