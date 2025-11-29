import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EnumSelect } from '@/components/ui/enum-select';
import TagInput from '@/components/ui/tag-input';
import { Building, MessageCircle, Loader2 } from 'lucide-react';

interface Pipeline { id: string; pipeline_name: string }
interface Stage { id: string; stage_name: string; opening_message: boolean }

interface OpportunityDetailsSectionProps {
  formData: any;
  errors: Record<string, string>;
  pipelines: Pipeline[];
  stages: Stage[];
  tags: string[];
  onInputChange: (field: string, value: string) => void;
  setTags: (tags: string[]) => void;
  statusOptions: { value: string; label: string }[];
  defaultStageId?: string;
  // NEW: Inbox button props
  showInboxButton?: boolean;
  onInboxClick?: () => void;
  inboxLoading?: boolean;
  // NEW: Make pipeline show-only
  pipelineReadOnly?: boolean;
}

const OpportunityDetailsSection: React.FC<OpportunityDetailsSectionProps> = ({
  formData,
  errors,
  pipelines,
  stages,
  tags,
  onInputChange,
  setTags,
  statusOptions,
  defaultStageId,
  // NEW: Inbox button props with defaults
  showInboxButton = false,
  onInboxClick,
  inboxLoading = false,
  pipelineReadOnly = false
}) => {
  return (
    <div className="space-y-4">
      {/* Updated header with inbox button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Opportunity Details</h3>
        </div>
        {/* NEW: Inbox Button */}
        {showInboxButton && onInboxClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onInboxClick}
            disabled={inboxLoading}
            className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            {inboxLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            Open Inbox
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opportunity_name" className="text-sm font-medium text-gray-700">
            Opportunity Name *
          </Label>
          <Input
            id="opportunity_name"
            value={formData.opportunity_name}
            onChange={(e) => onInputChange('opportunity_name', e.target.value)}
            placeholder="Enter opportunity name"
            className={`transition-colors ${errors.opportunity_name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
          />
          {errors.opportunity_name && <p className="text-sm text-red-600">{errors.opportunity_name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
          <Label htmlFor="pipeline_id" className="text-sm font-medium text-gray-700">
            Pipeline *
          </Label>
            {pipelineReadOnly ? (
              <Input
                value={pipelines.find(p => p.id === formData.pipeline_id)?.pipeline_name || ''}
                readOnly
                disabled
              />
            ) : (
              <EnumSelect
                options={pipelines.map(pipeline => ({
                  value: pipeline.id,
                  label: pipeline.pipeline_name
                }))}
                value={formData.pipeline_id}
                onValueChange={value => onInputChange('pipeline_id', value)}
                placeholder="Select pipeline"
              />
            )}
          {errors.pipeline_id && <p className="text-sm text-red-600">{errors.pipeline_id}</p>}
        </div>
          <div className="space-y-2">
            <Label htmlFor="stage_id" className="text-sm font-medium text-gray-700">
              Stage *
              {(() => {
                const selectedStage = stages.find(s => s.id === formData.stage_id);
                const stageName = selectedStage?.stage_name.toLowerCase() || '';
                const isAutoStatus = stageName.includes('won') || stageName.includes('closed') ||
                  stageName.includes('lost') || stageName.includes('rejected');
                return isAutoStatus ? (
                  <span className="ml-2 text-xs text-blue-600 font-normal">
                    (Auto-updates status)
                  </span>
                ) : null;
              })()}
            </Label>
            <EnumSelect
              options={stages.map(stage => ({
                value: stage.id,
                label: stage.opening_message ? `${stage.stage_name} (Auto Outreach)` : stage.stage_name
              }))}
              value={formData.stage_id}
              onValueChange={value => onInputChange('stage_id', value)}
              placeholder="Select stage"
            />
            {errors.stage_id && <p className="text-sm text-red-600">{errors.stage_id}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm font-medium text-gray-700">
              Source
            </Label>
            <Input
              id="source"
              value={formData.source}
              onChange={e => onInputChange('source', e.target.value)}
              placeholder="e.g., Website, Referral, LinkedIn"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <EnumSelect
              options={statusOptions}
              value={formData.status}
              onValueChange={value => onInputChange('status', value)}
              placeholder="Select status"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preferred_language" className="text-sm font-medium text-gray-700">
              Preferred Language
            </Label>
            <Input
              id="preferred_language"
              value={formData.preferred_language}
              onChange={e => onInputChange('preferred_language', e.target.value)}
              placeholder="e.g., English, Spanish"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferred_dialect" className="text-sm font-medium text-gray-700">
              Preferred Dialect
            </Label>
            <Input
              id="preferred_dialect"
              value={formData.preferred_dialect}
              onChange={e => onInputChange('preferred_dialect', e.target.value)}
              placeholder="e.g., US English, Mexican Spanish"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Tags</Label>
          <TagInput
            tags={tags}
            onTagsChange={setTags}
            placeholder="Type and press Enter to add tags..."
          />
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailsSection;
