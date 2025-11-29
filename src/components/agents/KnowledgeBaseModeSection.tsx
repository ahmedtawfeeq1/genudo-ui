
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type KnowledgeBaseModeProps = {
  selectedMode: string;
  onModeChange: (mode: string) => void;
};

const KnowledgeBaseModeSection = ({ 
  selectedMode = "my-knowledge", 
  onModeChange 
}: KnowledgeBaseModeProps) => {
  return (
    <Card className="shadow-sm mb-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Knowledge Base Mode</h2>
        
        <RadioGroup 
          value={selectedMode} 
          onValueChange={onModeChange}
          className="space-y-4"
        >
          <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
            <RadioGroupItem id="my-knowledge" value="my-knowledge" className="mt-1" />
            <div className="space-y-1">
              <Label htmlFor="my-knowledge" className="text-base font-medium">My Knowledge Mode</Label>
              <p className="text-gray-600 text-sm">
                Focuses solely on your personal files and data.
                <br /><br />
                In this mode, the system utilizes only the information and content you provide, ensuring that outputs are based entirely on your own resources and knowledge.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
            <RadioGroupItem id="hybrid" value="hybrid" className="mt-1" />
            <div className="space-y-1">
              <Label htmlFor="hybrid" className="text-base font-medium">Hybrid Knowledge Mode</Label>
              <p className="text-gray-600 text-sm">
                Merges your personal files with AI-generated information.
                <br /><br />
                This mode combines the uniqueness of your content with the extensive knowledge base of the AI, providing a balanced mix of personalized and AI-enhanced insights.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
            <RadioGroupItem id="ai-primary" value="ai-primary" className="mt-1" />
            <div className="space-y-1">
              <Label htmlFor="ai-primary" className="text-base font-medium">AI-Primary Knowledge Mode</Label>
              <p className="text-gray-600 text-sm">
                Prioritizes AI knowledge, using it as the main source of information.
                <br /><br />
                If you upload personal files, the AI creatively integrates them, enhancing the output. Without file uploads, the AI relies solely on its vast knowledge base, ensuring a wide range of information and creativity.
              </p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default KnowledgeBaseModeSection;
