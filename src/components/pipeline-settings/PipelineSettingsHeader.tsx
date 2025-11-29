import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import InlineEditableText from '@/components/ui/inline-editable-text';
import { ArrowLeft, Settings, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Pipeline } from '@/types/pipeline';

interface Stage {
  id: string;
  stage_name: string;
}

interface PipelineSettingsHeaderProps {
  pipeline: Pipeline;
  stages: Stage[];
}

const PipelineSettingsHeader: React.FC<PipelineSettingsHeaderProps> = ({
  pipeline,
  stages
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pipeline name update handler
  const handlePipelineNameUpdate = async (_newName: string) => {
    toast({ title: "Success", description: "Pipeline name updated (static)" });
  };

  // Pipeline description update handler
  const handlePipelineDescriptionUpdate = async (_newDescription: string) => {
    toast({ title: "Success", description: "Pipeline description updated (static)" });
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Inline Editable Title */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/pipelines')}
          className="bg-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          {/* Inline editable pipeline name */}
          <InlineEditableText
            value={pipeline.pipeline_name}
            onSave={handlePipelineNameUpdate}
            placeholder="Pipeline name..."
            variant="title"
            className="mb-1"
            showEditIcon={true}
            editIconSize="md"
          />
          
          {/* Inline editable pipeline description */}
          <InlineEditableText
            value={pipeline.pipeline_description || ""}
            onSave={handlePipelineDescriptionUpdate}
            placeholder="Add pipeline description..."
            variant="description"
            multiline={true}
            showEditIcon={true}
            editIconSize="sm"
          />
        </div>
      </div>

      {/* Pipeline Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">Pipeline Status</p>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {pipeline.is_active ? 'Active' : 'Inactive'}
                </p>
                <p className="text-xs text-blue-600">
                  Created {new Date(pipeline.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-800">Total Stages</p>
                </div>
                <p className="text-2xl font-bold text-purple-900">{stages.length}</p>
                <p className="text-xs text-purple-600">
                  {stages.length === 1 ? 'Stage configured' : 'Stages configured'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800">Last Updated</p>
                </div>
                <p className="text-lg font-bold text-green-900">
                  {new Date(pipeline.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-green-600">
                  Configuration status
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PipelineSettingsHeader;
