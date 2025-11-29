
import React from 'react';
import UnifiedOpportunityModal from '@/components/opportunities/UnifiedOpportunityModal';
import { type Opportunity } from './types';

interface OpportunityDetailDialogProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const OpportunityDetailDialog: React.FC<OpportunityDetailDialogProps> = ({
  opportunity,
  open,
  onOpenChange,
  onSuccess
}) => {
  // Transform opportunity data to match the unified modal format
  const opportunityData = {
    id: opportunity.id,
    opportunity_name: opportunity.opportunity_name,
    client_name: opportunity.client_name,
    client_email: opportunity.client_email,
    client_phone_number: opportunity.client_phone_number,
    status: opportunity.status as 'active' | 'pending' | 'won' | 'lost',
    pipeline_id: opportunity.pipeline_id,
    stage_id: opportunity.stage_id,
    contact_id: opportunity.contact_id,
    opportunity_notes: opportunity.opportunity_notes,
    source: opportunity.source,
    tags: opportunity.tags,
    preferred_language: opportunity.preferred_language || null,
    preferred_dialect: opportunity.preferred_dialect || null,
    created_at: opportunity.created_at,
    pipeline_name: opportunity.pipeline_name,
    stage_name: opportunity.stage_name,
    // NEW FIELD: preserve value (may be string, number, null)
    external_opportunity_id: opportunity.external_opportunity_id ?? null,
  };

  return (
    <UnifiedOpportunityModal
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      mode="update"
      opportunity={opportunityData}
    />
  );
};

export default OpportunityDetailDialog;
