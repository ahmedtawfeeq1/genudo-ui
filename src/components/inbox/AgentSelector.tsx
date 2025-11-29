
import React from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { agentsData } from "@/data/agentsData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AgentSelectorProps {
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  className?: string;
  size?: "default" | "sm";
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
  selectedAgentId,
  onSelectAgent,
  className = "",
  size = "default"
}) => {
  const handleAgentChange = (value: string) => {
    onSelectAgent(value === "all" ? null : value);
  };

  return (
    <div className={className}>
      <Select 
        value={selectedAgentId || "all"} 
        onValueChange={handleAgentChange}
      >
        <SelectTrigger className={`w-full ${size === "sm" ? "h-9 text-sm" : "md:w-[300px]"}`}>
          <SelectValue placeholder="Select an agent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                  ALL
                </AvatarFallback>
              </Avatar>
              <span>All Agents</span>
            </div>
          </SelectItem>
          
          {agentsData.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="bg-primary-100 text-primary text-xs">
                    {agent.avatar}
                  </AvatarFallback>
                </Avatar>
                <span>{agent.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AgentSelector;
