
import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AIAgentBuilderProps {
  onCreateAgent?: (prompt: string) => void;
}

const AIAgentBuilder = ({ onCreateAgent }: AIAgentBuilderProps) => {
  const [aiPrompt, setAiPrompt] = useState("");

  const handleCreateWithAI = () => {
    if (onCreateAgent) {
      onCreateAgent(aiPrompt);
    } else {
      // Default behavior if no handler provided
      console.log("Creating agent with prompt:", aiPrompt);
      // Redirect to agent edit page would happen here
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">AI Agent Builder</h2>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-4">Describe what type of agent you need, and our AI will help you create it.</p>
          <Textarea 
            placeholder="Tell me what you need... (e.g., 'I need a customer support agent that can answer questions about our product features and pricing')"
            className="min-h-[100px] w-full"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end">
          <Button disabled={!aiPrompt.trim()} onClick={handleCreateWithAI}>
            <Sparkles size={18} className="mr-2" />
            Create Agent
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAgentBuilder;
