import React from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Pipeline {
  id: string;
  pipeline_name: string;
}

interface PipelineSelectorProps {
  selectedPipelineId: string | null;
  onSelectPipeline: (pipelineId: string | null) => void;
  pipelines: Pipeline[];
  className?: string;
  size?: "default" | "sm";
}

const PipelineSelector: React.FC<PipelineSelectorProps> = ({
  selectedPipelineId,
  onSelectPipeline,
  pipelines,
  className = "",
  size = "default"
}) => {
  const handlePipelineChange = (value: string) => {
    onSelectPipeline(value === "all" ? null : value);
  };

  const getPipelineInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      // Use first letter of first two words
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      // Use first two letters of single word
      return name.substring(0, 2).toUpperCase();
    }
  };

  return (
    <div className={className}>
      <Select 
        value={selectedPipelineId || "all"} 
        onValueChange={handlePipelineChange}
      >
        <SelectTrigger className={`w-full ${size === "sm" ? "h-9 text-sm" : "md:w-[300px]"}`}>
          <SelectValue placeholder="Select a pipeline" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center">
              <span>All Pipelines</span>
            </div>
          </SelectItem>
          
          {pipelines.map((pipeline) => (
            <SelectItem key={pipeline.id} value={pipeline.id}>
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="bg-primary-100 text-primary text-xs">
                    {getPipelineInitials(pipeline.pipeline_name)}
                  </AvatarFallback>
                </Avatar>
                <span>{pipeline.pipeline_name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PipelineSelector;