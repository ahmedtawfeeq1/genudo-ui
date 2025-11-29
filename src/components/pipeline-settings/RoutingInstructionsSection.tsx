import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
 
import { toast } from "sonner";
import { Save, Brain } from "lucide-react";
import { ExpandableTextarea } from "@/components/ui/expandable-textarea";

interface Props {
  pipelineId: string;
  initialInstructions: string | null;
  onUpdate: () => void;
}

const RoutingInstructionsSection: React.FC<Props> = ({
  pipelineId,
  initialInstructions,
  onUpdate,
}) => {
  const [instructions, setInstructions] = useState(initialInstructions || "");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setInstructions(initialInstructions || "");
    setIsDirty(false);
  }, [initialInstructions]);

  const handleChange = (value: string) => {
    setInstructions(value);
    setIsDirty(value !== (initialInstructions || ""));
  };

  const handleSave = async () => {
    setSaving(true);
    toast.success("Routing instructions saved (static)");
    setIsDirty(false);
    onUpdate();
    setSaving(false);
  };

  const instructionsLength = instructions.length;
  const wordCount = instructions.trim() ? instructions.trim().split(/\s+/).length : 0;

  return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Routing Agent Instructions
          </CardTitle>
        <CardDescription>
          Provide instructions for the AI routing agent to determine how leads should move through the pipeline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <ExpandableTextarea
            id="routing_instructions"
            value={instructions}
            onChange={(value) => handleChange(value)}
            placeholder="The routing agent should analyze customer responses and move them to the appropriate stage based on their readiness and intent. Consider factors like engagement level, budget confirmation, decision-making authority..."
            rows={4}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{wordCount} words, {instructionsLength} characters</span>
            {isDirty && <span className="text-orange-500">Unsaved changes</span>}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving || !isDirty}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Routing Instructions"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoutingInstructionsSection;
