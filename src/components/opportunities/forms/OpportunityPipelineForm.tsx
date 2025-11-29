
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Pipeline {
  id: string;
  pipeline_name: string;
}

interface Stage {
  id: string;
  stage_name: string;
}

interface OpportunityPipelineFormProps {
  formData: {
    pipeline_id: string;
    stage_id: string;
  };
  errors: Record<string, string>;
  pipelines: Pipeline[];
  stages: Stage[];
  onInputChange: (field: string, value: string) => void;
}

const OpportunityPipelineForm: React.FC<OpportunityPipelineFormProps> = ({
  formData,
  errors,
  pipelines,
  stages,
  onInputChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="pipeline_id" className="text-sm font-medium">
          Pipeline *
        </Label>
        <Select value={formData.pipeline_id} onValueChange={(value) => onInputChange('pipeline_id', value)}>
          <SelectTrigger className={`${errors.pipeline_id ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}>
            <SelectValue placeholder="Select pipeline" />
          </SelectTrigger>
          <SelectContent>
            {pipelines.map((pipeline) => (
              <SelectItem key={pipeline.id} value={pipeline.id}>
                {pipeline.pipeline_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.pipeline_id && (
          <p className="text-sm text-red-600">{errors.pipeline_id}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="stage_id" className="text-sm font-medium">
          Stage *
        </Label>
        <Select value={formData.stage_id} onValueChange={(value) => onInputChange('stage_id', value)}>
          <SelectTrigger className={`${errors.stage_id ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}>
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.stage_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.stage_id && (
          <p className="text-sm text-red-600">{errors.stage_id}</p>
        )}
      </div>
    </div>
  );
};

export default OpportunityPipelineForm;
