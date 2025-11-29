
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw, Move } from 'lucide-react';

interface NodeSpacingControlProps {
  stageSpacing: number;
  agentOffset: number;
  onStageSpacingChange: (value: number) => void;
  onAgentOffsetChange: (value: number) => void;
  onResetLayout: () => void;
}

const NodeSpacingControl: React.FC<NodeSpacingControlProps> = ({
  stageSpacing,
  agentOffset,
  onStageSpacingChange,
  onAgentOffsetChange,
  onResetLayout
}) => {
  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Move className="w-4 h-4" />
          Layout Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Stage Spacing</label>
            <span className="text-xs text-gray-500">{stageSpacing}px</span>
          </div>
          <Slider
            value={[stageSpacing]}
            onValueChange={(value) => onStageSpacingChange(value[0])}
            min={150}
            max={300}
            step={10}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Agent Distance</label>
            <span className="text-xs text-gray-500">{agentOffset}px</span>
          </div>
          <Slider
            value={[agentOffset]}
            onValueChange={(value) => onAgentOffsetChange(value[0])}
            min={250}
            max={500}
            step={25}
            className="w-full"
          />
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onResetLayout}
          className="w-full text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          Reset Layout
        </Button>
      </CardContent>
    </Card>
  );
};

export default NodeSpacingControl;
