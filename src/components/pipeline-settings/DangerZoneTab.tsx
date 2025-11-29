
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { PipelineMetrics, StageData } from '@/types/pipeline';

interface DangerZoneTabProps {
  metrics: PipelineMetrics,
  stages: StageData[],
  pipelineName: string,
  onDelete: () => void
}

const DangerZoneTab: React.FC<DangerZoneTabProps> = ({
  metrics,
  stages,
  pipelineName,
  onDelete
}) => (
  <div className="max-w-2xl mx-auto">
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-red-800 flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5" />
          Delete Pipeline
        </CardTitle>
        <CardDescription className="text-red-700 text-sm">
          Permanently delete this pipeline and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-4 rounded border border-red-200">
          <p className="text-sm text-red-800 mb-3">
            <strong>Warning:</strong> This action cannot be undone. This will permanently remove:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm text-red-700 mb-4">
            <div>• {metrics.total_opportunities} opportunities</div>
            <div>• {stages.length} stages</div>
            <div>• All conversations</div>
            <div>• All analytics data</div>
          </div>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="w-full"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Pipeline Permanently
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default DangerZoneTab;
