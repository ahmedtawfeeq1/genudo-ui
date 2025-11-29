
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EnumSelect } from '@/components/ui/enum-select';
import TagInput from '@/components/ui/tag-input';

interface OpportunityMetaFormProps {
  formData: {
    status: 'active' | 'won' | 'lost' | 'pending';
    source: string;
    opportunity_notes: string;
  };
  statusOptions: Array<{ value: string; label: string }>;
  tags: string[];
  onInputChange: (field: string, value: string) => void;
  onTagsChange: (tags: string[]) => void;
}

const OpportunityMetaForm: React.FC<OpportunityMetaFormProps> = ({
  formData,
  statusOptions,
  tags,
  onInputChange,
  onTagsChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Status
          </Label>
          <EnumSelect
            options={statusOptions}
            value={formData.status}
            onValueChange={(value) => onInputChange('status', value)}
            placeholder="Select status"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source" className="text-sm font-medium">
            Source
          </Label>
          <Input
            id="source"
            value={formData.source}
            onChange={(e) => onInputChange('source', e.target.value)}
            placeholder="e.g., Website, Referral, LinkedIn"
            className="border-gray-300 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Tags</Label>
        <TagInput
          tags={tags}
          onTagsChange={onTagsChange}
          placeholder="Type and press Enter to add tags..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opportunity_notes" className="text-sm font-medium">
          Notes
        </Label>
        <Textarea
          id="opportunity_notes"
          value={formData.opportunity_notes}
          onChange={(e) => onInputChange('opportunity_notes', e.target.value)}
          placeholder="Add any notes about this opportunity..."
          rows={3}
          className="border-gray-300 focus:border-blue-500 resize-none"
        />
      </div>
    </>
  );
};

export default OpportunityMetaForm;
