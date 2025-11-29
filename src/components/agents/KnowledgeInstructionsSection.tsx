import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, CheckCircle } from "lucide-react";
import { useSaveAgentProfile } from "@/hooks/useAgents";

/**
 * Class-level: KnowledgeInstructionsSection
 * Renders manual knowledge instructions editor and a read-only preview of composed instructions
 */
interface KnowledgeInstructionsSectionProps {
  agentId: string;
  initialInstructions?: string;
  composedInstructions?: string;
  onInstructionsChange?: (instructions: string) => void;
}

const KnowledgeInstructionsSection = ({
  agentId,
  initialInstructions = "",
  composedInstructions = "",
  onInstructionsChange,
}: KnowledgeInstructionsSectionProps) => {
  const saveProfileMutation = useSaveAgentProfile();
  const [showSavedStatus, setShowSavedStatus] = useState(false);
  const [instructions, setInstructions] = useState(initialInstructions);

  // Track unsaved changes
  const hasUnsavedChanges = instructions !== initialInstructions;

  // Show saved status after successful save
  useEffect(() => {
    if (!saveProfileMutation.isPending && !hasUnsavedChanges && saveProfileMutation.isSuccess) {
      setShowSavedStatus(true);
      const timer = setTimeout(() => {
        setShowSavedStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveProfileMutation.isPending, hasUnsavedChanges, saveProfileMutation.isSuccess]);

  /**
   * Function-level: handle manual instructions change
   */
  const handleChange = (value: string) => {
    setInstructions(value);
    if (onInstructionsChange) {
      onInstructionsChange(value);
    }
  };

  /**
   * Function-level: persist manual instructions to agents.knowledge_instructions_manual
   */
  const handleSave = async () => {
    await saveProfileMutation.mutateAsync({
      agentId,
      updates: {
        knowledge_instructions_manual: instructions,
      },
    });
  };

  const handleCancel = () => {
    setInstructions(initialInstructions);
    if (onInstructionsChange) {
      onInstructionsChange(initialInstructions);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Knowledge Instructions</h2>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Mention to the agent some notes about your knowledge so that they can search better and find
            the best relevant answer for the user.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="knowledge-instructions">Instructions</Label>
          <Textarea
            id="knowledge-instructions"
            value={instructions}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter instructions about how to use your knowledge base effectively..."
            className="min-h-[300px] font-mono"
          />
        </div>

        {/* Save/Cancel Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
          <div className="flex items-center">
            {showSavedStatus && !hasUnsavedChanges && (
              <div className="flex items-center text-green-600 animate-fade-in">
                <CheckCircle size={16} className="mr-1" />
                <span className="text-sm">Changes saved</span>
              </div>
            )}
            {hasUnsavedChanges && !saveProfileMutation.isPending && (
              <div className="flex items-center text-amber-600">
                <span className="text-sm">You have unsaved changes</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saveProfileMutation.isPending || !hasUnsavedChanges}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-white"
              disabled={saveProfileMutation.isPending || !hasUnsavedChanges}
            >
              {saveProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default KnowledgeInstructionsSection;
