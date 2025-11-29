
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type FlowBuilderSectionProps = {
  agentId: string;
};

const FlowBuilderSection = ({ agentId }: FlowBuilderSectionProps) => {
  const navigate = useNavigate();
  const [flowBuilderEnabled, setFlowBuilderEnabled] = useState(false);
  const [showFlowBuilderDialog, setShowFlowBuilderDialog] = useState(false);

  const handleFlowBuilderClick = () => {
    setShowFlowBuilderDialog(true);
  };

  const handleFlowBuilderEnable = () => {
    setFlowBuilderEnabled(true);
    setShowFlowBuilderDialog(false);
  };

  const handleGoToFlowBuilder = () => {
    navigate(`/agents/${agentId}/flow-builder`);
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">Flow Builder</h2>
          <div className="space-y-6">
            <p className="text-gray-600">
              The Flow Builder allows you to create visual conversation flows for your agent.
              {flowBuilderEnabled ? " Flow Builder is currently enabled." : " Flow Builder is currently disabled."}
            </p>
            
            <div className="flex items-center mb-4">
              <Switch 
                id="flow-builder-status" 
                checked={flowBuilderEnabled}
                onCheckedChange={(checked) => {
                  if (!flowBuilderEnabled && checked) {
                    handleFlowBuilderClick();
                  } else {
                    setFlowBuilderEnabled(checked);
                  }
                }}
              />
              <Label htmlFor="flow-builder-status" className="ml-2">
                {flowBuilderEnabled ? "Enabled" : "Disabled"}
              </Label>
            </div>
            
            {flowBuilderEnabled && (
              <Button onClick={handleGoToFlowBuilder} className="bg-primary">
                <Play size={16} className="mr-2" />
                Open Flow Builder Studio
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showFlowBuilderDialog} onOpenChange={setShowFlowBuilderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Flow Builder</DialogTitle>
            <DialogDescription>
              The Flow Builder allows you to create visual conversation flows for your agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Would you like to enable the Flow Builder for this agent?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlowBuilderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFlowBuilderEnable} className="bg-primary">
              Enable Flow Builder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlowBuilderSection;
