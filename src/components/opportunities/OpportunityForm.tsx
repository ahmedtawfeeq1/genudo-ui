import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TagInput from '@/components/ui/tag-input'; // Changed to default import
import { useOpportunityForm } from './hooks/useOpportunityForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Opportunity } from '@/components/kanban/types';

interface OpportunityFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  defaultPipelineId?: string;
  defaultStageId?: string;
  mode?: 'create' | 'update'; // Added mode prop
  opportunity?: Opportunity; // Added opportunity prop for update mode
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({
  onSuccess,
  onCancel,
  defaultPipelineId,
  defaultStageId,
  mode = 'create',
  opportunity
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    formData,
    tags,
    pipelines,
    stages,
    errors,
    setTags,
    fetchPipelines,
    validateForm,
    handleInputChange,
    resetForm
  } = useOpportunityForm(defaultPipelineId, defaultStageId);

  useEffect(() => {
    fetchPipelines();
  }, []);

  // Populate form data when in update mode
  useEffect(() => {
    if (mode === 'update' && opportunity) {
      handleInputChange('opportunity_name', opportunity.opportunity_name);
      handleInputChange('client_name', opportunity.client_name);
      handleInputChange('client_email', opportunity.client_email || '');
      handleInputChange('client_phone_number', opportunity.client_phone_number || '');
      handleInputChange('status', opportunity.status);
      handleInputChange('pipeline_id', opportunity.pipeline_id);
      handleInputChange('stage_id', opportunity.stage_id);
      handleInputChange('opportunity_notes', opportunity.opportunity_notes || '');
      handleInputChange('source', opportunity.source || '');
      if (opportunity.tags) {
        setTags(opportunity.tags.split(',').map(tag => tag.trim()));
      }
    }
  }, [mode, opportunity, handleInputChange, setTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await new Promise(res => setTimeout(res, 300));
      toast({ title: "Success", description: mode === 'update' ? "Opportunity updated successfully" : "Opportunity created successfully" });
      if (mode !== 'update') {
        resetForm();
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${mode} opportunity`,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opportunity_name">Opportunity Name *</Label>
          <Input
            id="opportunity_name"
            value={formData.opportunity_name}
            onChange={(e) => handleInputChange('opportunity_name', e.target.value)}
            placeholder="Enter opportunity name"
          />
          {errors.opportunity_name && (
            <p className="text-sm text-red-500">{errors.opportunity_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_name">Client Name *</Label>
          <Input
            id="client_name"
            value={formData.client_name}
            onChange={(e) => handleInputChange('client_name', e.target.value)}
            placeholder="Enter client name"
          />
          {errors.client_name && (
            <p className="text-sm text-red-500">{errors.client_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_email">Client Email</Label>
          <Input
            id="client_email"
            type="email"
            value={formData.client_email}
            onChange={(e) => handleInputChange('client_email', e.target.value)}
            placeholder="Enter client email"
          />
          {errors.client_email && (
            <p className="text-sm text-red-500">{errors.client_email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_phone_number">Client Phone</Label>
          <Input
            id="client_phone_number"
            value={formData.client_phone_number}
            onChange={(e) => handleInputChange('client_phone_number', e.target.value)}
            placeholder="Enter client phone"
          />
          {errors.client_phone_number && (
            <p className="text-sm text-red-500">{errors.client_phone_number}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={formData.source}
            onChange={(e) => handleInputChange('source', e.target.value)}
            placeholder="Enter opportunity source"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pipeline_id">Pipeline *</Label>
          <Select
            value={formData.pipeline_id}
            onValueChange={(value) => handleInputChange('pipeline_id', value)}
          >
            <SelectTrigger>
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
            <p className="text-sm text-red-500">{errors.pipeline_id}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stage_id">Stage *</Label>
          <Select
            value={formData.stage_id}
            onValueChange={(value) => handleInputChange('stage_id', value)}
            disabled={!formData.pipeline_id}
          >
            <SelectTrigger>
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
            <p className="text-sm text-red-500">{errors.stage_id}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <TagInput
          tags={tags}
          onTagsChange={setTags}
          placeholder="Add tags..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opportunity_notes">Notes</Label>
        <Textarea
          id="opportunity_notes"
          value={formData.opportunity_notes}
          onChange={(e) => handleInputChange('opportunity_notes', e.target.value)}
          placeholder="Enter opportunity notes"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {mode === 'update' ? 'Update Opportunity' : 'Create Opportunity'}
        </Button>
      </div>
    </form>
  );
};

export default OpportunityForm;
