import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toDbFormat } from '@/services/knowledgeTableService';

interface Step1Props {
  sourceNameDisplay: string;
  sourceUse: string;
  onSourceNameChange: (value: string) => void;
  onSourceUseChange: (value: string) => void;
}

const Step1_SourceSettings: React.FC<Step1Props> = ({
  sourceNameDisplay,
  sourceUse,
  onSourceNameChange,
  onSourceUseChange,
}) => {
  const dbFormat = sourceNameDisplay ? toDbFormat(sourceNameDisplay) : '';

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="tableName">Table Name *</Label>
        <Input
          id="tableName"
          placeholder="e.g., General Information"
          value={sourceNameDisplay}
          onChange={(e) => onSourceNameChange(e.target.value)}
          className="mt-2"
        />
        {dbFormat && (
          <p className="text-xs text-muted-foreground mt-1">
            Stored as: <code className="bg-muted px-1 py-0.5 rounded">{dbFormat}</code>
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="tableUse">Table Use *</Label>
        <Textarea
          id="tableUse"
          placeholder="e.g., For answering general questions about the company"
          value={sourceUse}
          onChange={(e) => onSourceUseChange(e.target.value)}
          rows={4}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Describe what this table is used for
        </p>
      </div>
    </div>
  );
};

export default Step1_SourceSettings;
